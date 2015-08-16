module WorkshopPlanner {
  export interface Column {
    name: string;
    activities: KnockoutObservableArray<Activity>;
  }
}
