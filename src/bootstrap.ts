/*eslint-disable */
import { Core, Lists, FormletView, FormletViews, Formlet } from './formlet';

export class Enhance {
  static withFormControl<T>(t: Formlet<T>): Formlet<T> {
    return t.mapView(v => v.withAttributes({className: "form-control"}));
  }

  static withFormCheckInput<T>(t: Formlet<T>): Formlet<T> {
    return t.mapView(v => v.withAttributes({className: "form-check-input"}));
  }

  static withInputFeedback<T>(t: Formlet<T>): Formlet<T> {
    return Core.formlet((c, fc, fm) => {
        const tr = t.build(c, fc, fm);
        const f = tr.failure;
        if (f.isEmpty) {
          return tr.withView(tr.view.withAttributes({className: "is-valid"}));
        } else  {
          const fs: string[] = [];
          f.aggregateFailures(fs);
          const msg = fs.join("; ");
          const vl = tr.view.withAttributes({className: "is-invalid"});
          const vr = FormletViews
            .content(msg)
            .element("div", {className: "invalid-feedback"})
            ;
          return tr.withView(FormletViews.fork(vl, vr));
        }
      });
  }

  static withCard<T>(t: Formlet<T>): Formlet<T> {
    return Core.formlet((c, fc, fm) => {
      const tr = t.build(c, fc, fm);
      const body = tr
        .view
        .element("div", {className: "card-body"})
        ;
      const v = body
        .element("div", {className: "card mb-3"})
        ;
      return tr.withView(v);
    });
  }

  static withLabeledCard<T>(t: Formlet<T>, label: string): Formlet<T> {
    const header = FormletViews
      .content(label)
      .element("div", {className: "card-header"})
      ;
    return Core.formlet((c, fc, fm) => {
      const lfc = Lists.cons(label, fc);
      const tr = t.build(c, lfc, fm);
      const body = tr
        .view
        .element("div", {className: "card-body"})
        ;
      const v = FormletViews.fork(header, body)
        .element("div", {className: "card mb-3"})
        ;
      return tr.withView(v);
    });
  }

  static withSubmitHeader<T>(t: Formlet<T>): Formlet<T> {
    function button(label: string, className: string, onClick?: (e: React.FormEvent<HTMLInputElement>) => void) {
      const disabled = !onClick
      const props = {
        className: "btn " + className,
        disabled: disabled,
        onClick: onClick,
        style: {marginRight: "8px"},
        type: "button",
        value: label,
      };
      return FormletViews
        .element("input", props, FormletViews.empty)
        ;
    }

    function header(label: string, submit: FormletView, reset: FormletView) {
      const text = FormletViews.content(label);
      return FormletViews
        .group([submit, reset, text])
        .element("div", {className: "card-header" })
        ;
    }

    function td(content: string) {
      return FormletViews.content(content).element("td", {});
    }

    const disabledSubmit = button("Submit", "btn-dark");
    const goodBody = FormletViews
      .content("No problems found.")
      .element("div", {className: "card-body"})
      ;

    return Core.formlet((c, fc, fm) => {
      const tr = t.build(c, fc, fm);

      function onReset(e: React.FormEvent<HTMLInputElement>): void {
        c.resetForm();
      }

      function onSubmit(e: React.FormEvent<HTMLInputElement>): void {
        c.submitForm();
      }

      const reset = button("Reset", "btn-warning", onReset);

      if (tr.failure.isEmpty) {
        const submit = button("Submit", "btn-dark", onSubmit);
        const goodHeader = header("Ready to submit", submit, reset);
        const good = FormletViews
          .fork(goodHeader, goodBody)
          .element("div", {className: "card mb-3 text-white bg-success"})
          ;
        const v = FormletViews.fork(good, tr.view);

        return tr.withView(v);
      } else {
        const fs: [string, string][] = [];
        tr.failure.aggregateContextfulFailures(fs);
        const badHeader = header("Fix the validation error(s)", disabledSubmit, reset);
        const trs = fs.map(cm => FormletViews.group([td(cm[0]), td("->"), td(cm[1])]).element("tr", {}));
        const table = FormletViews.group(trs).element("tbody", {}).element("table", {});
        const badBody = table
          .element("div", {className: "card-body"})
          ;
        const bad = FormletViews.fork(badHeader, badBody)
          .element("div", {className: "card mb-3 text-white bg-danger"})
          ;

        const v = FormletViews.fork(bad, tr.view);
        return tr.withView(v);
      }
    });
  }
}
