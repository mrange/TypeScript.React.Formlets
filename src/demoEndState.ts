/*eslint-disable */
import { Core, Validate, Inputs, FormletViews, FormletComponent, Formlet } from './formlet';
import { Enhance } from './bootstrap';

export const formlet = Inputs
  .text("Hello world!")
  ;
/*
import { Core, Validate, Inputs, Enhance, FormletViews, FormletComponent, Formlet, SelectOption } from './formlet';

function validateSocialNo(t: Formlet<string>) {
  return Validate.regex(t, /\d{6}-\d{5}/, "Invalid social no, expected something like 100101-23989");
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

type Person = {
  firstName: string;
  lastName: string;
  socialNo: string;
}
function mkPerson(fn: string, ln: string, sno: string): Person {
  return {firstName: fn, lastName: ln, socialNo: sno};
}

type Company = {
  name: string;
  companyNo: string;
}
function mkCompany(n: string, cno: string): Company {
  return {name: n, companyNo: cno};
}

type Entity = Person|Company;

const person : Formlet<Entity> =
  Core.map3(
      text(Validate.notEmpty, "First Name", "Like 'John' or 'Jane'")
    , text(Validate.notEmpty, "Last Name" , "Like 'Doe'")
    , text(validateSocialNo , "Social no" , "Like '200101-32050'")
    , mkPerson
    ).then(t => Enhance.withLabeledBox(t, "Person"));

const company : Formlet<Entity> =
  Core.map2(
      text(Validate.notEmpty, "Company name", "Like 'Schibsted A/S'")
    , text(Validate.notEmpty, "Company no"  , "Like 'MVA109034'")
    , mkCompany
    ).then(t => Enhance.withLabeledBox(t, "Company"));

const options : SelectOption<Formlet<Entity>>[] = [{"key": "Person", "value": person}, {"key": "Company", "value": company}];
const select = Inputs.select(options).mapView(v => v.withAttributes({"style": {"marginBottom": "8px"}}));

export const formlet =
  Core.unwrap(select)
  .then(Enhance.withSubmit)
  ;
*/