import React from 'react';
import './App.css';
import { Core, DelayedTextInputComponent, Inputs, Enhance, FormletView, FormletViews, FormletComponent } from './formlet';

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

function text(label: string, placeholder: string) {
  return Enhance.withLabel(label, Inputs.text(placeholder, "")).mapView(intoFormGroup);
}

const person = Enhance.withLabeledBox("Person", Core
  .map2(
      text("First name" , "Like 'John' or 'Jane'")
    , text("Last name"  , "Like 'Doe'")
    , (fn, ln) => new Person(fn, ln)
    ));

const address = Enhance.withLabeledBox("Address", Core
  .map7(
      text("C/O"        , "Like 'Mom Doe'")
    , text("First name" , "Like 'John' or 'Jane'")
    , text("Last name"  , "Like 'Doe'")
    , text("Address"    , "Like 'Wall st.'")
    , text("City"       , "Like 'New york'")
    , text("Zip"        , "Like 'NY12345'")
    , text("Country"    , "Like 'USA'")
    , (co, fn, ln, a, city, zip, c) => new Address(co, fn, ln, a, city, zip, c)
    ));

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
