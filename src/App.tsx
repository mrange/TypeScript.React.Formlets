import React from 'react';
import './App.css';
import { Core, Validate, Inputs, Enhance, FormletView, FormletViews, FormletComponent, Formlet } from './formlet';

const intoForm = (v : FormletView) => FormletViews.element("form", {}, v);
const intoFormGroup = (v : FormletView) => FormletViews.element("div", { "className" : "form-group" }, v);
const intoFormCheck = (v : FormletView) => FormletViews.element("div", { "className" : "form-group form-check" }, v);

class Person
{
  constructor(firstName: string, lastName: string, socialNo: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.socialNo = socialNo;
  }

  readonly firstName  : string;
  readonly lastName   : string;
  readonly socialNo   : string;
}

class Company
{
  constructor(companyName: string, companyNo: string) {
    this.companyName = companyName;
    this.companyNo = companyNo;
  }

  readonly companyName  : string;
  readonly companyNo    : string;
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

type Entity = Person | Company;

class NewUser {
  constructor(entity: Entity, invoiceAddress: Address, deliveryAddress?: Address) {
    this.entity = entity;
    this.invoiceAddress = invoiceAddress;
    this.deliveryAddress = deliveryAddress;
  }

  readonly entity           : Entity;
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

function checkbox<T>(label: string, unchecked: T, checked: T) {
  return Inputs
    .checkbox(unchecked, checked)
    .then(t => Enhance.withLabel(label, t, true))
    .mapView(intoFormCheck)
    ;
}

const person: Formlet<Entity> = Core
  .map3(
      text(Validate.notEmpty, "First name" , "Like 'John' or 'Jane'")
    , text(Validate.notEmpty, "Last name"  , "Like 'Doe'")
    , text(Validate.notEmpty, "Social no"  , "Like '010190-23902'")
    , (fn, ln, sno) => new Person(fn, ln, sno)
    ).then(t => Enhance.withLabeledBox("Person", t))

const company: Formlet<Entity> = Core
  .map2(
      text(Validate.notEmpty, "Company name"  , "Like 'Amazon'")
    , text(Validate.notEmpty, "Company no"    , "Like 'MVA120934'")
    , (cn, cno) => new Company(cn, cno)
    ).then(t => Enhance.withLabeledBox("Company", t))

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
      , (co, fn, ln, a, city, zip, c) => new Address(co, fn, ln, a, city, zip, c)
      ).then(t => Enhance.withLabeledBox(label, t))
      ;
}

const invoiceAddress = address("Invoice address");
const deliveryAddress = Core.unwrap(checkbox<Formlet<Address|undefined>>("Use delivery address?", Core.value(undefined), address("Delivery address")));

const newUser = Core.map3(entity, invoiceAddress, deliveryAddress, (e, ia, da) => new NewUser(e, ia, da));

const formlet =
    newUser
    .mapView(intoForm)
    ;

class MyFormletComponent extends FormletComponent<NewUser> {
  constructor(props: any) {
    super(props, formlet);
  }
}

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
