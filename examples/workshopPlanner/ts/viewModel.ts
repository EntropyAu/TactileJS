module WorkshopPlanner {
  export class ViewModel {
    foo: KnockoutObservable<String>;

    constructor() {
      this.foo = ko.observable('bar');
    }
  }
}
