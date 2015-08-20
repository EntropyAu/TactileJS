module WorkshopPlanner {
  export interface Template {
    name:string;
    shortDescription:string;
    description:string;
    duration:string;
    category:string;
    imageName:string;
    notes:KnockoutObservable<string>;
  }
}
