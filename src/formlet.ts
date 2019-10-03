/*eslint-disable */
import React from 'react';
//import React = require('react')

export class Unit {
  static readonly value = new Unit();
}

export abstract class List<T> {
}

class List_Empty<T> extends List<T> {
}

class List_Cons<T> extends List<T> {
  readonly head: T;
  readonly tail: List<T>;

  constructor(head: T, tail: List<T>) {
    super();
    this.head = head;
    this.tail = tail;
  }
}

export class Lists {
  static readonly empty = new List_Empty<undefined>();
  static cons<T>(head: T, tail: List<T>): List<T> {
    return new List_Cons<T>(head, tail);
  }
}

export class FormletBuildContext {
  readonly redraw: () => void
  private currentId = 0;

  constructor(redraw: () => void) {
    this.redraw = redraw;
  }

  createId(): string {
    ++this.currentId;
    return `id_${this.currentId}`;
  }
}

export class FormletRenderContext {
}

export type FormletFailureContext = List<string>;

export abstract class FormletFailure {
  abstract isEmpty: boolean;

  abstract aggregatedMessage(): string;

  join(r: FormletFailure): FormletFailure {
    const te = this.isEmpty;
    const re = r.isEmpty;
    if (te && re) {
      return FormletFailures.empty;
    } else if (te) {
      return r;
    } else if (re) {
      return this;
    } else {
      return FormletFailures.fork(this, r);
    }
  }
}

class FormletFailure_Empty extends FormletFailure {
  readonly isEmpty = true;

  aggregatedMessage(): string {
    return "";
  }
}

class FormletFailure_Failure extends FormletFailure {
  readonly isEmpty = false;
  readonly context: FormletFailureContext;
  readonly message: string;

  constructor(context: FormletFailureContext, message: string) {
    super();
    this.context = context;
    this.message = message;
  }

  aggregatedMessage(): string {
    return this.message;
  }
}

class FormletFailure_Fork extends FormletFailure {
  readonly isEmpty = false;
  readonly left: FormletFailure;
  readonly right: FormletFailure;

  constructor(left: FormletFailure, right: FormletFailure) {
    super();
    this.left = left;
    this.right = right;
  }

  aggregatedMessage(): string {
    const l = this.left.aggregatedMessage();
    const r = this.right.aggregatedMessage();

    if (l && r) {
      return l + "; " + r;
    } else if (l) {
      return l;
    } else {
      return r;
    }
  }
}

export class FormletFailures {
  static readonly empty: FormletFailure = new FormletFailure_Empty();

  static failure(context: FormletFailureContext, message: string): FormletFailure {
    return new FormletFailure_Failure(context, message);
  }

  static fork(l: FormletFailure, r: FormletFailure): FormletFailure {
    return new FormletFailure_Fork(l, r);
  }
}

export abstract class FormletModel {
  abstract asValue(initial: string): FormletModel_Value;
  abstract asFork(): [FormletModel, FormletModel];

  join(r: FormletModel): FormletModel {
    return FormletModels.fork(this, r);
  }
}

class FormletModel_Empty extends FormletModel {
  asValue(initial: string): FormletModel_Value {
    return new FormletModel_Value(initial);
  }

  asFork(): [FormletModel, FormletModel] {
    return [FormletModels.empty, FormletModels.empty];
  }
}

export class FormletModel_Value extends FormletModel {
  constructor(value: string) {
    super();
    this.value = value;
  }

  asValue(initial: string): FormletModel_Value {
    return this;
  }

  asFork(): [FormletModel, FormletModel] {
    return [FormletModels.empty, FormletModels.empty];
  }

  // Intentionally mutable
  value: string;
}

class FormletModel_Fork extends FormletModel {
  readonly left: FormletModel;
  readonly right: FormletModel;

  constructor(left: FormletModel, right: FormletModel) {
    super();
    this.left = left;
    this.right = right;
  }

  asValue(initial: string): FormletModel_Value {
    return new FormletModel_Value(initial);
  }

  asFork(): [FormletModel, FormletModel] {
    return [this.left, this.right];
  }
}

export class FormletModels {
  static readonly empty = new FormletModel_Empty();

  static value(value: string): FormletModel {
    return new FormletModel_Value(value);
  }

  static fork(l: FormletModel, r: FormletModel): FormletModel {
    return new FormletModel_Fork(l, r);
  }
}

export abstract class FormletView {
  join(r: FormletView): FormletView {
    return FormletViews.fork(this, r);
  }

  abstract render(context: FormletRenderContext, container: any[], attributes: object, id?: string): void;

  withId(id: string): FormletView {
    return FormletViews.withId(id, this);
  }

  withAttributes(attributes: object): FormletView {
    return FormletViews.withAttributes(attributes, this);
  }

  content(content: string): FormletView {
    return FormletViews.content(content);
  }

  element(element: any, attributes: object): FormletView {
    return FormletViews.element(element, attributes, this);
  }

  static mergeAttributes(left: any, right: any): any {
    const a = Object.assign({}, left, right);
    const lc = left.className;
    const rc = right.className;
    if (lc && rc) {
      a.className = lc + " " + rc;
    }
    return a;
  }
}

class FormletView_Empty extends FormletView {
  render(context: FormletRenderContext, container: any[], attributes: object, id?: string): void {
  }
}

class FormletView_WithId extends FormletView {
  private readonly _id: string;
  private readonly _view: FormletView;

  constructor(id: string, view: FormletView) {
    super();
    this._id = id;
    this._view = view;
  }

  render(context: FormletRenderContext, container: any[], attributes: object, id?: string): void {
    this._view.render(context, container, attributes, this._id);
  }
}

class FormletView_WithAttributes extends FormletView {
  private readonly _attributes: object;
  private readonly _view: FormletView;

  constructor(attributes: object, view: FormletView) {
    super();
    this._attributes = attributes;
    this._view = view;
  }

  render(context: FormletRenderContext, container: any[], attributes: object, id?: string): void {
    const merged = FormletView.mergeAttributes(this._attributes, attributes);
    this._view.render(context, container, merged, id);
  }
}

class FormletView_Content extends FormletView {
  private readonly _content: string;

  constructor(content: string) {
    super();
    this._content = content;
  }

  render(context: FormletRenderContext, container: any[], attributes: object, id?: string): void {
    container.push(this._content);
  }
}

class FormletView_Element extends FormletView {
  private readonly _element: any;
  private readonly _attributes: object;
  private readonly _view: FormletView;

  constructor(element: any, attributes: object, view: FormletView) {
    super();
    this._element = element;
    this._attributes = attributes;
    this._view = view;
  }

  render(context: FormletRenderContext, container: any[], attributes: object, id?: string): void {
    const i: any[] = [];
    this._view.render(context, i, {});
    const merged = FormletView.mergeAttributes(this._attributes, attributes);
    if (id) {
      merged.id = id;
    }
    if (i.length == 0) {
      container.push(React.createElement(this._element, merged, null));
    } else if (i.length == 1) {
      container.push(React.createElement(this._element, merged, i[0]));
    } else {
      container.push(React.createElement(this._element, merged, i));
    }
  }
}

class FormletView_Fork extends FormletView {
  private readonly _left: FormletView;
  private readonly _right: FormletView;

  constructor(left: FormletView, right: FormletView) {
    super();
    this._left = left;
    this._right = right;
  }

  render(context: FormletRenderContext, container: any[], attributes: object, id?: string): void {
    this._left.render(context, container, attributes, id);
    this._right.render(context, container, attributes, undefined);
  }
}

class FormletView_Group extends FormletView {
  readonly _views: FormletView[];

  constructor(views: FormletView[]) {
    super();
    this._views = views;
  }

  render(context: FormletRenderContext, container: any[], attributes: object, id?: string): void {
    const vs = this._views;
    if (vs.length > 0) {
      vs[0].render(context, container, attributes, id);
      for(let i = 1; i < vs.length; ++i) {
        const v = vs[i];
        v.render(context, container, attributes, undefined);
      }
    }
  }
}

export abstract class FormletViews {
  static readonly empty = new FormletView_Empty();

  static withId(id: string, view: FormletView): FormletView {
    return new FormletView_WithId(id, view);
  }

  static withAttributes(attributes: object, view: FormletView): FormletView {
    return new FormletView_WithAttributes(attributes, view);
  }

  static content(content: string): FormletView {
    return new FormletView_Content(content);
  }

  static element(element: any, attributes: object, view: FormletView): FormletView {
    return new FormletView_Element(element, attributes, view);
  }

  static fork(l: FormletView, r: FormletView): FormletView {
    return new FormletView_Fork(l, r);
  }

  static group(vs: FormletView[]): FormletView {
    return new FormletView_Group(vs);
  }
}

export class FormletResult<T> {
  readonly value: T;
  readonly failure: FormletFailure;
  readonly model: FormletModel;
  readonly view: FormletView;

  constructor(value: T, failure: FormletFailure, model: FormletModel, view: FormletView) {
    this.value = value;
    this.failure = failure;
    this.model = model;
    this.view = view;
  }

  merge<U, V>(r: FormletResult<U>, v: V): FormletResult<V> {
    return new FormletResult<V>(
      v,
      this.failure.join(r.failure),
      this.model.join(r.model),
      this.view.join(r.view)
    );
  }

  withValue<V>(v: V): FormletResult<V> {
    return new FormletResult<V>(
      v,
      this.failure,
      this.model,
      this.view
    );
  }

  withFailure(failure: FormletFailure): FormletResult<T> {
    return new FormletResult<T>(
      this.value,
      failure,
      this.model,
      this.view
    );
  }

  withView(view: FormletView): FormletResult<T> {
    return new FormletResult<T>(
      this.value,
      this.failure,
      this.model,
      view
    );
  }
}

export class BaseFormlet {
}

export class Formlet<T> extends BaseFormlet {
  readonly build: (context: FormletBuildContext, failureContext: FormletFailureContext, model: FormletModel) => FormletResult<T>;

  constructor(build: (context: FormletBuildContext, failureContext: FormletFailureContext, model: FormletModel) => FormletResult<T>) {
    super ();
    this.build = build;
  }

  // TODO: How to add these as extension methods

  bind<U>(uf: (tv: T) => Formlet<U>) : Formlet<U> {
    return Core.bind(this, uf);
  }

  map<U>(m: (tv: T) => U) : Formlet<U> {
    return Core.map(this, m);
  }

  mapView(m: (tv: FormletView) => FormletView): Formlet<T> {
    return Core.mapView(this, m);
  }

  andAlso<U>(u: Formlet<U>): Formlet<[T, U]> {
    return Core.andAlso(this, u);
  }

  then<U>(f: (t: Formlet<T>) => Formlet<U>): Formlet<U> {
    return f(this);
  }
}

export class Core {

  static result<T>(value: T, failure: FormletFailure, model: FormletModel, view: FormletView): FormletResult<T> {
    return new FormletResult<T>(value, failure, model, view);
  }

  static formlet<T>(build: (context: FormletBuildContext, failureContext: FormletFailureContext, model: FormletModel) => FormletResult<T>): Formlet<T> {
    return new Formlet<T>(build);
  }

  static value<T>(value: T) : Formlet<T> {
    return Core.formlet((c, fc, fm) => Core.result(value, FormletFailures.empty, FormletModels.empty, FormletViews.empty));
  }

  static failure<T>(failureValue: T, message: string) : Formlet<T> {
    return Core.formlet((c, fc, fm) => Core.result(failureValue, FormletFailures.failure(fc, message), FormletModels.empty, FormletViews.empty));
  }

  static bind<T, U>(t: Formlet<T>, uf: (tv: T) => Formlet<U>) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const [tfm, ufm] = fm.asFork();
      const tr = t.build(c, fc, tfm);
      const u = uf(tr.value);
      const ur = u.build(c, fc, ufm);
      return tr.merge(ur, ur.value);
    });
  }

  static apply<T, U>(f: Formlet<(v: T) => U>, t: Formlet<T>) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const [ffm, tfm] = fm.asFork();
      const fr = f.build(c, fc, ffm);
      const tr = t.build(c, fc, tfm);
      return fr.merge(tr, fr.value(tr.value));
    });
  }

  static map1<T0, U>(t0: Formlet<T0>, m: ((tv0: T0) => U)) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const tr = t0.build(c, fc, fm);
      return tr.withValue(m(tr.value));
    });
  }

  static map2<T0, T1, U>(
      t0: Formlet<T0>
    , t1: Formlet<T1>
    , m: ((tv0: T0, tv1: T1) => U)) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const tr = t0
        .andAlso(t1)
        .build(c, fc, fm)
        ;
      const [tv0, tv1] = tr.value;
      return tr.withValue(m(tv0, tv1));
    });
  }

  static map3<T0, T1, T2, U>(
      t0: Formlet<T0>
    , t1: Formlet<T1>
    , t2: Formlet<T2>
    , m: ((tv0: T0, tv1: T1, tv2: T2) => U)) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const tr = t0
        .andAlso(t1.andAlso(t2))
        .build(c, fc, fm)
        ;
      const [tv0, [tv1, tv2]] = tr.value;
      return tr.withValue(m(tv0, tv1, tv2));
    });
  }

  static map4<T0, T1, T2, T3, U>(
      t0: Formlet<T0>
    , t1: Formlet<T1>
    , t2: Formlet<T2>
    , t3: Formlet<T3>
    , m: ((tv0: T0, tv1: T1, tv2: T2, tv3: T3) => U)) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const tr = t0.andAlso(t1).andAlso(t2.andAlso(t3))
        .build(c, fc, fm)
        ;
      const [[tv0, tv1], [tv2, tv3]] = tr.value;
      return tr.withValue(m(tv0, tv1, tv2, tv3));
    });
  }

  static map5<T0, T1, T2, T3, T4, U>(
      t0: Formlet<T0>
    , t1: Formlet<T1>
    , t2: Formlet<T2>
    , t3: Formlet<T3>
    , t4: Formlet<T4>
    , m: ((tv0: T0, tv1: T1, tv2: T2, tv3: T3, tv4: T4) => U)) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const tr = t0.andAlso(t1).andAlso(t2.andAlso(t3.andAlso(t4)))
        .build(c, fc, fm)
        ;
      const [[tv0, tv1], [tv2, [tv3, tv4]]] = tr.value;
      return tr.withValue(m(tv0, tv1, tv2, tv3, tv4));
    });
  }

  static map6<T0, T1, T2, T3, T4, T5, U>(
      t0: Formlet<T0>
    , t1: Formlet<T1>
    , t2: Formlet<T2>
    , t3: Formlet<T3>
    , t4: Formlet<T4>
    , t5: Formlet<T5>
    , m: ((tv0: T0, tv1: T1, tv2: T2, tv3: T3, tv4: T4, tv5: T5) => U)) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const tr = t0.andAlso(t1).andAlso(t2.andAlso(t3).andAlso(t4.andAlso(t5)))
        .build(c, fc, fm)
        ;
      const [[tv0, tv1], [[tv2, tv3], [tv4, tv5]]] = tr.value;
      return tr.withValue(m(tv0, tv1, tv2, tv3, tv4, tv5));
    });
  }

  static map7<T0, T1, T2, T3, T4, T5, T6, U>(
      t0: Formlet<T0>
    , t1: Formlet<T1>
    , t2: Formlet<T2>
    , t3: Formlet<T3>
    , t4: Formlet<T4>
    , t5: Formlet<T5>
    , t6: Formlet<T6>
    , m: ((tv0: T0, tv1: T1, tv2: T2, tv3: T3, tv4: T4, tv5: T5, tv6: T6) => U)) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const tr = t0.andAlso(t1.andAlso(t2)).andAlso(t3.andAlso(t4).andAlso(t5.andAlso(t6)))
        .build(c, fc, fm)
        ;
      const [[tv0, [tv1, tv2]], [[tv3, tv4], [tv5, tv6]]] = tr.value;
      return tr.withValue(m(tv0, tv1, tv2, tv3, tv4, tv5, tv6));
    });
  }

  static map8<T0, T1, T2, T3, T4, T5, T6, T7, U>(
      t0: Formlet<T0>
    , t1: Formlet<T1>
    , t2: Formlet<T2>
    , t3: Formlet<T3>
    , t4: Formlet<T4>
    , t5: Formlet<T5>
    , t6: Formlet<T6>
    , t7: Formlet<T7>
    , m: ((tv0: T0, tv1: T1, tv2: T2, tv3: T3, tv4: T4, tv5: T5, tv6: T6, tv7: T7) => U)) : Formlet<U> {
    return Core.formlet((c, fc, fm) => {
      const tr = t0.andAlso(t1).andAlso(t2.andAlso(t3)).andAlso(t4.andAlso(t5).andAlso(t6.andAlso(t7)))
        .build(c, fc, fm)
        ;
      const [[[tv0, tv1], [tv2, tv3]], [[tv4, tv5], [tv6, tv7]]] = tr.value;
      return tr.withValue(m(tv0, tv1, tv2, tv3, tv4, tv5, tv6, tv7));
    });
  }

  static map<T, U>(t: Formlet<T>, m: ((tv: T) => U)) : Formlet<U> {
      return Core.map1(t, m);
    }

  static mapView<T>(t: Formlet<T>, m: (tv: FormletView) => FormletView) : Formlet<T> {
    return Core.formlet((c, fc, fm) => {
      const tr = t.build(c, fc, fm);
      return tr.withView(m(tr.view));
    });
  }

  static andAlso<T, U>(t: Formlet<T>, u: Formlet<U>) : Formlet<[T, U]> {
    return Core.formlet((c, fc, fm) => {
      const [tfm, ufm] = fm.asFork();
      const tr = t.build(c, fc, tfm);
      const ur = u.build(c, fc, ufm);
      return tr.merge(ur, [tr.value, ur.value]);
    });
  }

  static unwrap<T>(t: Formlet<Formlet<T>>) : Formlet<T> {
    return Core.formlet((c, fc, fm) => {
      const [tfm, ifm] = fm.asFork();
      const tr = t.build(c, fc, tfm);
      const ir = tr.value.build(c, fc, ifm);
      return tr.merge(ir, ir.value);
    });
  }

  static build<T>(redraw: () => void, t: Formlet<T>, model: FormletModel): FormletResult<T> {
    const ctx = new FormletBuildContext(redraw);
    return t.build(ctx, [], model);
  }

  static render(v: FormletView): any {
    const ctx = new FormletRenderContext();
    const i : any[] = [];
    v.render(ctx, i, {}, undefined)
    if (i.length == 0) {
      return React.createElement("div", {}, null);
    } else if (i.length == 1) {
      return React.createElement("div", {}, i[0]);
    } else {
      return React.createElement("div", {}, i);
    }
  }
}

export class Validate {
  static validate<T> (validator: (v: T) => string|undefined, t: Formlet<T>): Formlet<T> {
    return Core.formlet((c, fc, fm) => {
      const tr = t.build(c, fc, fm);
      const v = validator(tr.value);
      if (v) {
        return tr.withFailure(tr.failure.join(FormletFailures.failure(fc, v)));
      } else {
        return tr;
      }
    });
  }

  static ok<T>(t : Formlet<T>): Formlet<T> {
    return t;
  }

  static notEmpty(t : Formlet<string>): Formlet<string> {
    return Validate.validate(v => v.length == 0 ? "Must not be empty" : undefined, t);
  }

  static regex(r: RegExp, msg: string, t : Formlet<string>): Formlet<string> {
    return Validate.validate(v => !r.test(v) ? msg : undefined, t);
  }
}

export class Enhance {
  static withLabel<T>(label: string, t: Formlet<T>, appendLabel?: boolean): Formlet<T> {
    return Core.formlet((c, fc, fm) => {
        const id = c.createId();
        const lfc = Lists.cons(label, fc);
        const tr = t.build(c, lfc, fm);
        const lv = FormletViews
          .content(label)
          .element("label", {"htmlFor": id})
          ;
        const tv = tr.view.withId(id);
        const v = appendLabel ? FormletViews.fork(tv, lv) : FormletViews.fork(lv, tv);
        return tr.withView(v);
      });
  }

  static withValidation<T>(t: Formlet<T>): Formlet<T> {
    return Core.formlet((c, fc, fm) => {
        const tr = t.build(c, fc, fm);
        const f = tr.failure;
        if (f.isEmpty) {
          return tr.withView(tr.view.withAttributes({"className": "is-valid"}));  // TODO: Break this dependency on bootstrap
        } else  {
          const msg = f.aggregatedMessage();
          const vl = tr.view.withAttributes({"className": "is-invalid"}); // TODO: Break this dependency on bootstrap
          const vr = FormletViews
            .content(msg)
            .element("div", { "className": "invalid-feedback"}) // TODO: Break this dependency on bootstrap
            ;
          return tr.withView(FormletViews.fork(vl, vr));
        }
      });
  }

  static withBox<T>(t: Formlet<T>): Formlet<T> {
    return Core.formlet((c, fc, fm) => {
        const tr = t.build(c, fc, fm);
        const body = tr
          .view
          .element("div", { "className" : "card-body"})
          ;
        const v = body
          .element("div", { "className" : "card mb-3"})
          ;
        return tr.withView(v);
      });
  }

  static withLabeledBox<T>(label: string, t: Formlet<T>): Formlet<T> {
    const header = FormletViews
      .content(label)
      .element("div", { "className" : "card-header"})
      ;
    return Core.formlet((c, fc, fm) => {
      const lfc = Lists.cons(label, fc);
      const tr = t.build(c, lfc, fm);
        const body = tr
          .view
          .element("div", { "className" : "card-body"})
          ;
        const v = FormletViews.fork(header, body)
          .element("div", { "className" : "card mb-3"})
          ;
        return tr.withView(v);
      });
  }
}

type SelectOption<T> = {
  key: string;
  value: T;
}

export class Inputs {
  static text(placeholder: string, initial: string): Formlet<string> {
    return Core.formlet((c, fc, fm) => {
        const model = fm.asValue(initial);
        const failure = FormletFailures.empty;
        function onChange(value: string) {
          model.value = value;
          c.redraw();
        }

        // TODO: Break the bootstrap dep "form-control"
        const props = { "initial": model.value, "placeholder": placeholder, "className": "form-control", "onChange": onChange };
        const view = FormletViews
          .element(DelayedTextInputComponent, props, FormletViews.empty)
          ;
        return Core.result(model.value, failure, model, view)
      });
  }

  static checkbox<T>(unchecked: T, checked: T): Formlet<T> {
    return Core.formlet((c, fc, fm) => {
        const model = fm.asValue("off");
        const failure = FormletFailures.empty;
        function onChange(e: React.FormEvent<HTMLInputElement>) {
          model.value = e.currentTarget.value;
          c.redraw();
        }

        // TODO: Break the bootstrap dep "form-check-input"
        const props = { "type": "checkbox", "className": "form-check-input", "onChange": onChange };
        const view = FormletViews
          .element("input", props, FormletViews.empty)
          ;
        return Core.result(model.value == "on" ? checked : unchecked, failure, model, view)
      });
  }

  static select<T>(options: SelectOption<T>[]): Formlet<T> {
    if (options.length == 0) {
      throw new Error("select - expected at least one option");
    }
    const content = FormletViews.group(options.map(o => FormletViews.content(o.key).element("option", {})));
    return Core.formlet((c, fc, fm) => {
        const model = fm.asValue(options[0].key);
        const failure = FormletFailures.empty;
        function onChange(e: React.FormEvent<HTMLSelectElement>) {
          model.value = e.currentTarget.value;
          c.redraw();
        }

        const o = options.find(o => o.key == model.value);
        const v = o ? o.value : options[0].value;

        // TODO: Break the bootstrap dep "form-control"
        const props = { "className": "form-control", "onChange": onChange };
        const view = FormletViews
          .element("select", props, content)
          ;
        return Core.result(v, failure, model, view)
      });
  }
}

export class BaseFormletComponentState {
  readonly model: FormletModel;
  readonly failure: FormletFailure;
  readonly view: FormletView;

  constructor(model: FormletModel, failure: FormletFailure, view: FormletView) {
    this.model = model;
    this.failure = failure;
    this.view = view;
  }
}

export class FormletComponentState<T> extends BaseFormletComponentState {
  readonly formlet : Formlet<T>;

  constructor(formlet : Formlet<T>, model: FormletModel, failure: FormletFailure, view: FormletView) {
    super(model, failure, view);
    this.formlet = formlet;
  }
}

export class FormletComponent<T> extends React.Component<{}, FormletComponentState<T>> {
  constructor(props: any, formlet: Formlet<T>) {
    super(props);
    const fr = Core.build(() => this.redraw(), formlet, FormletModels.empty);
    this.state = new FormletComponentState<T>(formlet, fr.model, fr.failure, fr.view);
    this.redraw = this.redraw.bind(this);
  }

  redraw() {
    console.log("redraw");
    const fr = Core.build(() => this.redraw(), this.state.formlet, this.state.model);
    this.setState(new FormletComponentState<T>(this.state.formlet, fr.model, fr.failure, fr.view));
    this.forceUpdate();
  }

  render(): any {
    const r = Core.render(this.state.view);
    return r;
  }
}

export type DelayedTextInputProps = {
  placeholder? : string;
  initial? : string;
  className? : string;
  onChange? : (value: string) => void;
}

export type DelayedTextInputState = {
  value : string;
}

export class DelayedTextInputComponent extends React.Component<DelayedTextInputProps, DelayedTextInputState> {
  constructor(props: DelayedTextInputProps) {
    super(props);
    const value = props.initial ? props.initial : "";
    this.state = { value: value };
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onChange(e: React.FormEvent<HTMLInputElement>) {
    this.setState({ value: e.currentTarget.value });
  }

  onBlur(e: React.FormEvent<HTMLInputElement>) {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(this.state.value);
    }
  }

  render(): any {
    return React.createElement(
      "input",
      {
        "type": "text",
        "value": this.state.value,
        "placeholder": this.props.placeholder,
        "className" : this.props.className,
        "onChange" : this.onChange,
        "onBlur" : this.onBlur,
      });
  }
}