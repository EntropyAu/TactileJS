interface VelocityUtilities {
  removeData(el:HTMLElement, keys:string[]);
}

interface Velocity {
  (el:HTMLElement|HTMLElement[], properties:any, options?:any):void;
  Utilities:VelocityUtilities;
}

declare var Velocity:Velocity;
