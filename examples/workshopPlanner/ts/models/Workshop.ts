module WorkshopPlanner {
  export class Workshop {
    name:KnockoutObservable<String> = ko.observable("");
    days:KnockoutObservableArray<Day> = ko.observableArray([]);

    constructor(data:any) {
      for (let prop in data) {
        if (ko.isObservable(this[prop]) && prop !== 'days')
          this[prop](data[prop]);
      }
      let days = [];
      for (let day of data.days) days.push(new Day(day))
      this.days(days);
    }

    public toJS():any {
      let result:any = {}
      for (let prop in this)
        if (ko.isObservable(this[prop]) && prop !== 'days')
          result[prop] = ko.unwrap(this[prop]);
      result.days = [];
      for (let day of this.days()) result.days.push(day.toJS());
      return result;
    }
  }
}
