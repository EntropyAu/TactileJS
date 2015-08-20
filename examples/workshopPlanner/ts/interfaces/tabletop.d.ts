interface TableTopStatic {
  init(any):any;
}

declare var Tabletop: TableTopStatic;

declare module "Tabletop" {
	export = Tabletop;
}
