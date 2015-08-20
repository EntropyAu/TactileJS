module WorkshopPlanner {
  export class Day {
    name:KnockoutObservable<String> = ko.observable("");
    activities:KnockoutObservableArray<Activity> = ko.observableArray([]);

    constructor(data:any) {
      for (let prop in data) {
        if (ko.isObservable(this[prop]) && prop !== 'activities')
          this[prop](data[prop]);
      }
      let activities = [];
      for (let activity of data.activities || []) activities.push(new Activity(activity))
      this.activities(activities);
    }

    public toJS():any {
      let result:any = {}
      for (let prop in this) {
        if (ko.isObservable(this[prop]) && prop !== 'activities')
          result[prop] = ko.unwrap(this[prop]);
      }
      result.activities = [];
      for (let activity of this.activities()) result.activities.push(activity.toJS());
      return result;
    }
  }
}
