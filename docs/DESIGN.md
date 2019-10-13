# Formlet Design

Formlet as an idea isn't new, it has been discussed in Haskell community for a long time (http://homepages.inf.ed.ac.uk/slindley/papers/formlets-tr2008.pdf).

I first saw Formlets implemented in WebSharper (http://websharper.com/) and been interested ever since in the Formlet design pattern.

## Motivation

In 1990s we transformed arrays like so:

```typescript
function _1990(vs: int[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < vs.length; ++i) {
    if (vs[i] % 2 == 0) {
      result.push(vs[i].toString());
    }
  }
  return result;
}
```

There were people that said there are better ways to think about sequence transformations but those ideas weren't mainstream in 1990s.

In 2010 these ideas have become mainstream and we often write sequence transformations like so:

```typescript
function _2020(vs: int[]): string[] {
  return vs
    .filter(v => v % 2 == 0)
    .map  (v => v.toString())
    ;
}
```

Not only is this style of programming more succinct, it also allows us to think more abstractly about sequence transformations.

Why then do we still write UI code like it's 1990?

```typescript
class LetUsWriteCodeLikeItIs1990Again extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clicks: 0
    };
  }
  IncrementItem = () => {
    this.setState({ clicks: this.state.clicks + 1 });
  }
  DecreaseItem = () => {
    this.setState({ clicks: this.state.clicks - 1 });
  }
  render() {
    return (
      <div>
        <button onClick={this.IncrementItem}>Click to increment by 1</button>
        <button onClick={this.DecreaseItem}>Click to decrease by 1</button>
        <h2>{ this.state.clicks }</h2>
      </div>
    );
  }
}
```

Wouldn't it be great if we could write UI in a more declarative and functional style of programming?

Finding such a model that can cover all use cases for UI can be difficult but what we can create opportunities for abstractions by limiting the scope.

Formlet is is an abstraction that allows building forms quickly. As not all UI is forms formlets are therefore complementary design pattern but still valuable as lot of UI is forms and they are usually tedious and tricky to implement (in order to support validation).

## Example of formlets

The simplest example of formlet is the "Hello World!" formlet:

```typescript
export const formlet: Formlet<string> = Inputs.text("Hello world!");
```

This merely renders a text input with the placeholder "Hello world".

We can combine multiple text inputs:

```typescript
export const formlet: Formlet<[string, string]> =
  Inputs.text("First name").andAlso(Inputs.text("Last name"));
```

This renders two text inputs with placeholders "First name" and "Last name". The type is: `Formlet<[string, string]>` which is a pair of string. We can map this pair into something more easy to use:

```typescript
export const formlet: Formlet<Person> =
  Inputs.text("First name").andAlso(Inputs.text("Last name")).map(fl => new Person(fl[0], fl[1]));
```

That means formlet like sequence transformations let's us inspect and transform the values as they flow through the formlet.

Formlets intrinsically supports validations and creating reusable formlets is just about creating normal functions:

```typescript
// Creates an bootstrap text input with label and validation
function text(label: string, placeholder: string): Formlet<string> {
  return Inputs
    .text(placeholder)                              // Basic input
    .map(v => v.trim())                             // Trim the input text
    .then(Enhance.withFormControl)                  // Makes the input to a form-control
    .then(Validate.notEmpty)                        // Don't validate if empty
    .then(Enhance.withInputFeedback)                // Add validation feedback to UI
    .then(t => Core.withLabel(t, label))            // Add a label
    .surroundWith("div", {className: "form-group"}) // Surround in a form-group div
    ;
}
```

This function can then be reused to create more complex formlets:

```typescript
const person: Formlet<LegalEntity> = Core
  .map3(
      text("First name" , "Like 'John' or 'Jane'")
    , text("Last name"  , "Like 'Doe'")
    , text("Social no"  , "Like '010130-23902'")
    , mkPerson
    ).then(t => Enhance.withLabeledCard(t, "Person"))

const company: Formlet<LegalEntity> = Core
  .map2(
      text(Validate.notEmpty, "Company name"  , "Like 'Amazon'")
    , text(Validate.notEmpty, "Company no"    , "Like 'MVA120934'")
    , mkCompany
    ).then(t => Enhance.withLabeledCard(t, "Company"))
```

Letting users switch between different formlet the developer can use a select input.

```typescript
const options = [{key: "Person", value: person}, {key: "Company", value: company}];

// Is rendered as an select input and depending on the selection allows user to fill
//  in either person or company information
const legalEntity: Formlet<LegalEntity> = Core
  .unwrap(Inputs.select(options).then(Enhance.withFormControl))
  .mapView(v => v.withAttributes({style: {marginBottom: "8px"}})) // Tweaks the view
  ;
```

State handling, validation are implicits, the formlet produces a type value and you can map it as it flows through the formlet.

## What is a formlet?

The `Formlet<T>` is defined as this:

```typescript
export class Formlet<T> extends BaseFormlet {
  readonly build: (context: FormletBuildContext, failureContext: FormletFailureContext, model: FormletModel) => FormletResult<T>;
  // Rest removed for brevity
}
```

This is just a wrapper around the function type: `(context: FormletBuildContext, failureContext: FormletFailureContext, model: FormletModel) => FormletResult<T>`

How to interpet this function type?

A formlet is a function that given:

1. FormletBuildContext - An object that contains useful functions for the build up process. For example; it has a method to generate element ids (used when creating labels).
2. FormletFailureContext - This keeps track of where in the form we currently are, used to to generate contextful validation messages.
3. FormletModel - The state of the formlet, is a tree structure that is decomposed during the build process

The formlet produces a `FormletResult<T>` which is defined like this:

```typescript
export class FormletResult<T> {
  readonly value: T;
  readonly failure: FormletFailure;
  readonly model: FormletModel;
  readonly view: FormletView;
  // Rest removed for brevity
}
```

A `FormletResult<T>` there is a tuple of:

1. T - The current result of the form input. Might be invalid.
2. FormletFailure - A tree describing the validation failures associated with the value. Empty if if the value is valid.
3. FormletModel - The model of the Formlet, the formlet might rewrite the model during buildup.
4. FormletView - A tree describing how we should render the formlet to HTML.

One way this Formlet design differs from many others is that a value is always produced but sometimes the value might be invalid. There are drawbacks to this approach but one of the benefits is that monadic bind is useful.

Let's see how basic formlet functions are defined:

```typescript
export class Core {
  static value<T>(value: T): Formlet<T> {
    return Core.formlet((c, fc, fm) => Core.result(value, FormletFailures.empty, FormletModels.empty, FormletViews.empty));
  }

  static failure<T>(failureValue: T, message: string): Formlet<T> {
    return Core.formlet((c, fc, fm) => Core.result(failureValue, FormletFailures.failure(fc, message), FormletModels.empty, FormletViews.empty));
  }
}
```

`value` constructs a formlet from a value. There are no failures associated with the value, no model nor a view.

`failure` constructs a formlet from a failure value and a message. The failure value is needed because in this design a formlet _always_ produces a value. From this a result a constructed that has a failure value and a simple failure tree (indicating the value is invalid), no model nor view is needed.

We mentioned monadic bind:

```typescript
export class Core {
  static bind<T, U>(t: Formlet<T>, uf: (tv: T) => Formlet<U>): Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const [tfm, ufm] = fm.asFork();
      const tr = t.build(c, fc, tfm);
      const u = uf(tr.value);
      const ur = u.build(c, fc, ufm);
      return tr.merge(ur, ur.value);
    });
  }
}
```

The expected model input here is a `Fork` so we try deconstruct the fork using `asFork`, if the model isn't not a `Fork` a fork will be created.

Then we run the `t` formlet on the left fork producing a result `tr`. Using the `tr.value` we can create `u` formlet, this we run on the right fork producing a value `ur`. Finally `tr` and `ur` is merged into a single result ensuring the value is `ur.value`.

The explicit requirement to always return a value allows us to always be able to construct `u`. If we couldn't create `u` then view couldn't be generated and the user would not be able to see the full form.

There's an implicit behavior which is important to know about as well.

```typescript
const [tfm, ufm] = fm.asFork();
```

If the model is a fork then the current state will be preserved, otherwise it will be discarded and a new empty state is created. This is because the formlet can change shape, like we were collection information about a person but the user changed their mind and now we are supposed to collect information about a company instead. The model for the person and the company doesn't match so person model is discarded (at least partially).

## TBW

