interface MediumEditorMarkdown {
  new(any):any;
}

declare var MeMarkdown: MediumEditorMarkdown;

declare module "MeMarkdown" {
	export = MeMarkdown;
}
