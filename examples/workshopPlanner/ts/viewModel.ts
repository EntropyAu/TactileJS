module WorkshopPlanner {

  interface Template {
    name:string;
    shortDescription:string;
    tags:string[];
    duration:string;
    category:string;
    imageName:string;
  }

  interface Activity {
    name:string;
    shortDescription:string;
    duration:string;
    category:string;
    imageName:string;
  }

  interface Column {
    name: string;
    activities: KnockoutObservableArray<Activity>;
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
        this.templates().forEach((template) => template.category && (tagHash[template.category] = true));
        return Object.keys(tagHash);
      }.bind(this));

      this.selectedTag.subscribe((nv) => nv !== null && this.query(''));
      this.query.subscribe((nv) => nv !== '' && this.selectedTag(null));

      this.initialize();
      if (!this.tryLoad()) {
        this.defaultColumns();
      }
      this.bindEventHandlers();
    }

    private initialize() {
      let self = this;
      function onSuccess(data:any) {
        self.templates(<Template[]>jsyaml.load(data).templates);
      }
      $.ajax('./workshopPlanner/templates.yaml', { dataType:"text", success: onSuccess });
    }

    private defaultColumns() {
      for (let i = 0; i < 10; i++) {
        this.columns.push({ name: "Day " + (i + 1), activities: ko.observableArray([]) });
      }
    }

    private bindEventHandlers() {
      document.addEventListener('drop', this.onDragDrop.bind(this));
    }

    private onDragDrop(e:CustomEvent) {
      let eventDetails = e.detail;
      let activityOrTemplate = <Activity|Template>ko.contextFor(eventDetails.el)['$data'];

      let sourceColumn = <Column>ko.contextFor(eventDetails.sourceEl)['$data'];
      if (sourceColumn && sourceColumn.activities) {
        sourceColumn.activities.remove(activityOrTemplate);
      }

      let targetColumn = <Column>ko.contextFor(eventDetails.targetEl)['$data'];
      if (targetColumn && targetColumn.activities) {
        targetColumn.activities.splice(eventDetails.targetIndex, 0, $.extend({}, activityOrTemplate));
      }
      this.save();
      e.returnValue = false;
    }

    private search():Template[] {
      if (this.selectedTag()) {
        return this.templates().filter((t) => t.category && t.category.indexOf(this.selectedTag()) !== -1);
      } else {
        return this.templates().filter((t) => t.name && t.name.toLowerCase().indexOf(this.query().toLowerCase()) !== -1);
      }
    }

    private save():void {
      let jsonData:string = ko.mapping.toJS(this.columns)
      let jsonString:string = JSON.stringify(jsonData);
      localStorage.setItem('workshopColumns', jsonString);
    }

    private tryLoad():boolean {
      let jsonString:string = localStorage.getItem('workshopColumns');
      if (jsonString) {
        let jsonData = JSON.parse(jsonString);
        let asObservable = ko.mapping.fromJS(jsonData)
        this.columns(asObservable())
        return true;
      }
      return false;
    }
  }
}
