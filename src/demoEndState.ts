/*eslint-disable */
import { Core, Validate, Inputs, FormletViews, FormletComponent, Formlet } from './formlets/formlet';
import { Enhance } from './formlets/bootstrap';

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

type LegalEntity = Person|Company;

function validateSocialNo(t: Formlet<string>): Formlet<string> {
  return Validate.regex(t, /^\d{6}-\d{5}$/, "Should look something like '010130-23902'")
}

function text(validator: (t: Formlet<string>) => Formlet<string>, label: string, placeholder: string) {
  return Inputs
    .text(placeholder)
    .map(v => v.trim())
    .then(Enhance.withFormControl)
    .then(validator)
    .then(Enhance.withInputFeedback)
    .then(t => Core.withLabel(t, label))
    .surroundWith("div", {className: "form-group"})
    ;
}

function checkbox<T>(label: string, unchecked: T, checked: T) {
  return Inputs
    .checkbox(unchecked, checked)
    .then(Enhance.withFormCheckInput)
    .then(t => Core.withLabel(t, label, true))
    .surroundWith("div", {className: "form-group form-check"})
    ;
}

const person: Formlet<LegalEntity> = Core
  .map3(
      text(Validate.notEmpty, "First name" , "Like 'John' or 'Jane'")
    , text(Validate.notEmpty, "Last name"  , "Like 'Doe'")
    , text(validateSocialNo , "Social no"  , "Like '010130-23902'")
    , mkPerson
    ).then(t => Enhance.withLabeledCard(t, "Person"))

const company: Formlet<LegalEntity> = Core
  .map2(
      text(Validate.notEmpty, "Company name"  , "Like 'Amazon'")
    , text(Validate.notEmpty, "Company no"    , "Like 'MVA120934'")
    , mkCompany
    ).then(t => Enhance.withLabeledCard(t, "Company"))

const options = [{key: "Person", value: person}, {key: "Company", value: company}];

const legalEntity = Inputs
  .select(options)
  .then(Enhance.withFormControl)
  .mapView(v => v.withAttributes({style: {marginBottom: "8px"}}))
  ;

export const formlet = Core
  .unwrap(legalEntity)
  .then(Enhance.withSubmitHeader)
  ;
