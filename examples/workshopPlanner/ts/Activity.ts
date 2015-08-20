module WorkshopPlanner {
  export interface Activity {
    name:string;
    shortDescription:string;
    description:string;
    tags:string[];
    duration:string;
    category:string;
    imageName:string;
    notes:KnockoutObservable<string>;
  }
}
