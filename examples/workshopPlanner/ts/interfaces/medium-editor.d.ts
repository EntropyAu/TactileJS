interface MediumEditorStatic {
  new(el:HTMLElement, options:any):any;
}

declare var MediumEditor: MediumEditorStatic;

declare module "MediumEditor" {
	export = MediumEditor;
}
