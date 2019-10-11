import React from 'react';
import './App.css';
import { Core, Validate, Inputs, Enhance, FormletView, FormletViews, FormletComponent, Formlet, Unit } from './formlet';
import * as demo from './demo';

type Person  = {
  firstName : string,
  lastName  : string,
  socialNo  : string,
}
function mkPerson(fn: string, ln: string, sno: string): Person {
  return { firstName: fn, lastName: ln, socialNo: sno };
}

type Company  = {
  companyName : string,
  companyNo   : string,
}
function mkCompany(cn: string, cno: string): Company {
  return { companyName: cn, companyNo: cno };
}

type Entity = Person | Company;

type Address = {
  carryOver  : string,
  firstName  : string,
  lastName   : string,
  address    : string,
  city       : string,
  zip        : string,
  country    : string,
}
function mkAddress(co: string, fn: string, ln: string, a: string, c: string, z: string, ct: string) : Address {
  return {
    carryOver  : co,
    firstName  : fn,
    lastName   : ln,
    address    : a ,
    city       : c ,
    zip        : z ,
    country    : ct,
  }
}

type NewUser = {
  entity           : Entity,
  invoiceAddress   : Address,
  deliveryAddress? : Address,
}
function mkNewUser(e: Entity, ia: Address, da?: Address): NewUser {
  return { entity: e, invoiceAddress: ia, deliveryAddress: da };
}

function text(validator: (t: Formlet<string>) => Formlet<string>, label: string, placeholder: string) {
  return Inputs
    .text(placeholder, "")
    .then(validator)
    .then(Enhance.withValidation)
    .then(t => Enhance.withLabel(t, label))
    .surroundWith("div", { "className": "form-group" })
    ;
}

function checkbox<T>(label: string, unchecked: T, checked: T) {
  return Inputs
    .checkbox(unchecked, checked)
    .then(t => Enhance.withLabel(t, label, true))
    .surroundWith("div", { "className": "form-group form-check" })
    ;
}

const person: Formlet<Entity> = Core
  .map3(
      text(Validate.notEmpty, "First name" , "Like 'John' or 'Jane'")
    , text(Validate.notEmpty, "Last name"  , "Like 'Doe'")
    , text(Validate.notEmpty, "Social no"  , "Like '010190-23902'")
    , mkPerson
    ).then(t => Enhance.withLabeledBox(t, "Person"))

const company: Formlet<Entity> = Core
  .map2(
      text(Validate.notEmpty, "Company name"  , "Like 'Amazon'")
    , text(Validate.notEmpty, "Company no"    , "Like 'MVA120934'")
    , mkCompany
    ).then(t => Enhance.withLabeledBox(t, "Company"))

const options = [{"key": "Person", "value": person}, {"key": "Company", "value": company}];

const entity = Core.unwrap(Inputs.select(options)).mapView(v => v.withAttributes({"style": {"marginBottom": "8px"}}));

function address(label: string) {
  return Core
    .map7(
        text(Validate.ok      , "C/O"        , "Like 'Mom Doe'")
      , text(Validate.notEmpty, "First name" , "Like 'John' or 'Jane'")
      , text(Validate.notEmpty, "Last name"  , "Like 'Doe'")
      , text(Validate.notEmpty, "Address"    , "Like 'Wall st.'")
      , text(Validate.notEmpty, "City"       , "Like 'New york'")
      , text(Validate.notEmpty, "Zip"        , "Like 'NY12345'")
      , text(Validate.ok      , "Country"    , "Like 'USA'")
      , mkAddress
      ).then(t => Enhance.withLabeledBox(t, label))
      ;
}

const invoiceAddress = address("Invoice address");
const deliveryAddress = Core.unwrap(checkbox<Formlet<Address|undefined>>("Use delivery address?", Core.value(undefined), address("Delivery address")));

const newUser = Core.map3(
    entity
  , invoiceAddress
  , deliveryAddress
  , mkNewUser);

const formlet =
  newUser
    .then(Enhance.withSubmit)
    .surroundWith("form", {})
    ;

class NewUserComponent extends FormletComponent<NewUser> {
  constructor(props: any) {
    super(props, formlet);
  }

  onSubmit(v: NewUser): void {
    console.log("Cool a new user!");
    console.log(v);
  }

}

const demoFormlet = demo
  .formlet
  .map(v => Unit.value)
  .surroundWith("form", {})
  ;

class DemoComponent extends FormletComponent<Unit> {
  constructor(props: any) {
    super(props, demoFormlet);
  }

  onSubmit(v: Unit): void {
  }

}

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <NewUserComponent/>
      </header>
    </div>
  );
}

export default App;
