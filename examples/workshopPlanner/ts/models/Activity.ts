module WorkshopPlanner {
  export class Activity {
    name:KnockoutObservable<string>             = ko.observable<string>("");
    shortDescription:KnockoutObservable<string> = ko.observable<string>("");
    description:KnockoutObservable<string>      = ko.observable<string>("");
    tags:KnockoutObservableArray<string>        = ko.observableArray<string>([]);
    duration:KnockoutObservable<string>         = ko.observable<string>("");
    category:KnockoutObservable<string>         = ko.observable<string>("");
    imageName:KnockoutObservable<string>        = ko.observable<string>("");
    notes:KnockoutObservable<string>            = ko.observable<string>("");

    constructor(data:any) {
      this.apply(data);
    }

    apply(data:any) {
      for (let prop in data)
        if (ko.isObservable(this[prop]))
          this[prop](data[prop]);
    }

    public toJS():any {
      let result:any = {}
      for (let prop in this)
        if (ko.isObservable(this[prop]))
          result[prop] = ko.unwrap(this[prop]);
      return result;
    }
  }
}
