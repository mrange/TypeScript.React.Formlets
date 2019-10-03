import React from 'react';
import './App.css';
import { Core, Validate, Inputs, Enhance, FormletView, FormletViews, FormletComponent, Formlet } from './formlet';

const intoForm = (v : FormletView) => FormletViews.element("form", {}, v);
const intoFormGroup = (v : FormletView) => FormletViews.element("div", { "className" : "form-group" }, v);

class Person
{
  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  readonly firstName  : string;
  readonly lastName   : string;
}

class Address
{
  constructor(
      carryOver : string
    , firstName : string
    , lastName  : string
    , address   : string
    , city      : string
    , zip       : string
    , country   : string
    ) {
    this.carryOver  = carryOver;
    this.firstName  = firstName;
    this.lastName   = lastName ;
    this.address    = address  ;
    this.city       = city     ;
    this.zip        = zip      ;
    this.country    = country  ;
  }

  readonly carryOver  : string;
  readonly firstName  : string;
  readonly lastName   : string;
  readonly address    : string;
  readonly city       : string;
  readonly zip        : string;
  readonly country    : string;
}

class NewUser {
  constructor(person: Person, invoiceAddress: Address, deliveryAddress?: Address) {
    this.person = person;
    this.invoiceAddress = invoiceAddress;
    this.deliveryAddress = deliveryAddress;
  }

  readonly person           : Person;
  readonly invoiceAddress   : Address;
  readonly deliveryAddress? : Address;
}

function text(validator: (t: Formlet<string>) => Formlet<string>, label: string, placeholder: string) {
  return Inputs
    .text(placeholder, "")
    .then<string>(validator)  // TODO: Why is the type argument needed?
    .then(Enhance.withValidation)
    .then(t => Enhance.withLabel(label, t))
    .mapView(intoFormGroup)
    ;
}

const person = Core
  .map2(
      text(Validate.notEmpty, "First name" , "Like 'John' or 'Jane'")
    , text(Validate.notEmpty, "Last name"  , "Like 'Doe'")
    , (fn, ln) => new Person(fn, ln)
    ).then(t => Enhance.withLabeledBox("Person", t))

const address = Core
  .map7(
      text(Validate.ok      , "C/O"        , "Like 'Mom Doe'")
    , text(Validate.notEmpty, "First name" , "Like 'John' or 'Jane'")
    , text(Validate.notEmpty, "Last name"  , "Like 'Doe'")
    , text(Validate.notEmpty, "Address"    , "Like 'Wall st.'")
    , text(Validate.notEmpty, "City"       , "Like 'New york'")
    , text(Validate.notEmpty, "Zip"        , "Like 'NY12345'")
    , text(Validate.ok      , "Country"    , "Like 'USA'")
    , (co, fn, ln, a, city, zip, c) => new Address(co, fn, ln, a, city, zip, c)
    ).then(t => Enhance.withLabeledBox("Address", t))

const newUser = Core.map2(person, address, (p, a) => new NewUser(p, a, undefined));

const formlet =
    newUser
    .mapView(intoForm)
    ;

class MyFormletComponent extends FormletComponent<NewUser> {
  constructor(props: any) {
    super(props, formlet);
  }
}

//        <DelayedTextInputComponent placeholder="Hello" initial="There"/>
const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <MyFormletComponent/>
      </header>
    </div>
  );
}

export default App;
