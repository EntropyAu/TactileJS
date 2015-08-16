module WorkshopPlanner {
  export interface Activity {
    name:string;
    shortDescription:string;
    tags:string[];
    duration:string;
    category:string;
    imageName:string;
  }
}
