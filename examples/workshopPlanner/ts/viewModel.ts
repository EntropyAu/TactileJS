module WorkshopPlanner {

  interface Template {
    name:string;
    shortDescription:string;
    tags:string[];
    duration:string;
  }

  interface Activity {
    name:string;
    shortDescription:string;
    duration:string;
  }

  interface Column {
    name: string;
    activities: Activity[];
  }

  export class ViewModel {
    query: KnockoutObservable<string> = ko.observable('');
    templates: KnockoutObservableArray<Template> = ko.observableArray([]);
    selectedTag: KnockoutObservable<string> = ko.observable(null);

    filteredTemplates: KnockoutComputed<Template[]>;
    tags: KnockoutComputed<string[]>;

    columns: KnockoutObservableArray<Column> = ko.observableArray([])

    constructor() {
      window['viewModel'] = this;
      this.filteredTemplates = <KnockoutComputed<Template[]>>ko.pureComputed(this.search.bind(this));
      this.tags = <KnockoutComputed<string[]>>ko.pureComputed(function() {
        let tagHash:any = {};
        this.templates().forEach((template) => (template.tags || []).forEach((t) => tagHash[t] = true));
        return Object.keys(tagHash);
      }.bind(this));

      this.selectedTag.subscribe((nv) => nv !== null && this.query(''));
      this.query.subscribe((nv) => nv !== '' && this.selectedTag(null));

      this.initialize();
    }

    private initialize() {
      let self = this;
      function onSuccess(data:any) {
        self.templates(<Template[]>jsyaml.load(data).templates);
      }
      $.ajax('./workshopPlanner/templates.yaml', { dataType:"text", success: onSuccess });
    }

    private search():Template[] {
      if (this.selectedTag()) {
        return this.templates().filter((t) => t.tags && t.tags.indexOf(this.selectedTag()) !== -1);
      } else {
        return this.templates().filter((t) => t.name && t.name.toLowerCase().indexOf(this.query().toLowerCase()) !== -1);
      }
    }
  }
}
