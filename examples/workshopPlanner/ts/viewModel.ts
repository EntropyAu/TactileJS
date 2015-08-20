module WorkshopPlanner {
  export class ViewModel {
    query: KnockoutObservable<string> = ko.observable('');
    templates: KnockoutObservableArray<ActivityTemplate> = ko.observableArray([]);
    selectedTag: KnockoutObservable<string> = ko.observable(null);
    filteredTemplates: KnockoutComputed<ActivityTemplate[]>;
    tags: KnockoutComputed<string[]>;
    openActivityOrTemplate: KnockoutObservable<ActivityTemplate> = ko.observable(null);
    workshop: KnockoutObservable<Workshop> = ko.observable(null);

    constructor() {
      window['viewModel'] = this;
      this.filteredTemplates = <KnockoutComputed<ActivityTemplate[]>>ko.pureComputed(this.search.bind(this));
      this.tags = <KnockoutComputed<string[]>>ko.pureComputed(function() {
        let tagHash:any = {};
        this.templates().forEach((ActivityTemplate) => ActivityTemplate.category && (tagHash[ActivityTemplate.category] = true));
        return Object.keys(tagHash);
      }.bind(this));

      this.selectedTag.subscribe((nv) => nv !== null && this.query(''));
      this.query.subscribe((nv) => nv !== '' && this.selectedTag(null));
      this.initialize();
      if (!this.tryLoad()) this.defaultWorkshop();
      this.bindEventHandlers();

      ko.watch(this.workshop, { depth: -1 }, () => this.save());
    }

    private initialize() {
      this.loadTemplatesFromLocal(this.templates);
      this.loadTemplatesFromGoogleSheets(this.templates);
    }

    private loadTemplatesFromLocal(templates):void {
      function onSuccess(data:any) {
        templates(<ActivityTemplate[]>jsyaml.load(data).templates);
      }
      $.ajax('./templates.yaml', { dataType:"text", success: onSuccess });
    }

    private loadTemplatesFromGoogleSheets(templates):void {
      var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1Ax95IyMyL42FF7YHA1NgBLUkiTDcZjrMbCmxlOyRZ2U/pubhtml'
      function showInfo(data, tabletop) {
        templates(<ActivityTemplate[]>data.Sheet1.all());
      }
      var tabletop = Tabletop.init( { key: public_spreadsheet_url,
                                      callback: showInfo,
                                      simpleSheet: false,
                                      parseNumbers: true } )
    }

    private defaultWorkshop() {
      this.workshop(new Workshop({ name: "My Workshop" }));
      for (let i = 0; i < 10; i++)
        this.workshop().days.push(new Day({ name: "Day " + (i + 1) }));
    }

    private bindEventHandlers() {
      document.addEventListener('drop', this.onDragDrop.bind(this));
    }

    private onDragDrop(e:CustomEvent) {
      let eventDetails = e.detail;
      let context = ko.contextFor(eventDetails.el)['$data'];
      if (context instanceof Activity) {
        let activity = <Activity>context;
        let sourceColumn = <Day>ko.contextFor(eventDetails.sourceEl)['$data'];
        let targetColumn = <Day>ko.contextFor(eventDetails.targetEl)['$data'];
        if (sourceColumn) sourceColumn.activities.remove(activity);
        if (targetColumn) targetColumn.activities.splice(eventDetails.targetIndex, 0, activity);
      } else {
        let activityTemplate = <ActivityTemplate>context;
        let targetColumn = <Day>ko.contextFor(eventDetails.targetEl)['$data'];
        if (targetColumn) targetColumn.activities.splice(eventDetails.targetIndex, 0, new Activity(activityTemplate));
      }
      e.returnValue = false;
    }

    private search():ActivityTemplate[] {
      if (this.selectedTag()) {
        return this.templates().filter((t) => t.category && t.category.indexOf(this.selectedTag()) !== -1);
      } else {
        return this.templates().filter((t) => t.name && t.name.toLowerCase().indexOf(this.query().toLowerCase()) !== -1);
      }
    }

    private save():void {
      let workshopData = this.workshop().toJS();
      let workshopJson = JSON.stringify(workshopData);
      localStorage.setItem('workshop', workshopJson);
    }

    private tryLoad():boolean {
      let jsonString:string = localStorage.getItem('workshop');
      if (jsonString) {
        let workshopData = JSON.parse(jsonString);
        let workshop = new Workshop(workshopData);
        this.workshop(workshop)
        return true;
      }
      return false;
    }
  }
}
