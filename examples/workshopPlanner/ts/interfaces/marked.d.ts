interface MarkedStatic {
    (string):string;
}

declare var marked: MarkedStatic;

declare module "marked" {
	export = marked;
}
