# Formlets for TypeScript/React [Highly experimental]

Formlets is a cool idea and I want to explore how formlets can look in Typescript/React.

```typescript
function text(label: string, placeholder: string) {
  return Inputs.text(placeholder).then(t => Core.withLabel(t, label));
}

const person = Core
  .map2(
      text("First name" , "Like 'John' or 'Jane'")
    , text("Last name"  , "Like 'Doe'")
    , mkPerson
    ).then(t => Enhance.withLabeledCard(t, "Person"))
    ;

const address = Core
  .map7(
      text("C/O"        , "Like 'Mom Doe'")
    , text("First name" , "Like 'John' or 'Jane'")
    , text("Last name"  , "Like 'Doe'")
    , text("Address"    , "Like 'Wall st.'")
    , text("City"       , "Like 'New york'")
    , text("Zip"        , "Like 'NY12345'")
    , text("Country"    , "Like 'USA'")
    , mkAddress
    ).then(t => Enhance.withLabeledCard(t, "Company"))
    ;

const newUser = Core.map2(person, address, mkNewUser);

class NewUserComponent extends FormletComponent<NewUser> {
  constructor(props: any) {
    super(props, formlet);
  }

  onSubmit(v: NewUser): void {
    console.log("Cool a new user!");
    console.log(v);
  }
}
```

# TODO

1. Nail the API (style, naming)
2. DelayedTextInputComponent bugs fixed
6. Examples
7. Handle side-effects (like server validation or server lookup)
9. Add tests
10. Fix warning: Each child in a list should have a unique "key" prop.
11. Remove React dependency from core (solve render)

# INPROGRESS

5. Document formlet design

# DONE

3. Break dependency between Core and Bootstrap
4. Add Bootstrap module (for easy integration Boostrap forms)
8. Merge style attributes



This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
