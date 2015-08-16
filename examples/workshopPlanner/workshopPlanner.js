var WorkshopPlanner;
(function (WorkshopPlanner) {
    var ViewModel = (function () {
        function ViewModel() {
            var _this = this;
            this.query = ko.observable('');
            this.templates = ko.observableArray([]);
            this.selectedTag = ko.observable(null);
            this.columns = ko.observableArray([]);
            window['viewModel'] = this;
            this.filteredTemplates = ko.pureComputed(this.search.bind(this));
            this.tags = ko.pureComputed(function () {
                var tagHash = {};
                this.templates().forEach(function (template) { return (template.tags || []).forEach(function (t) { return tagHash[t] = true; }); });
                return Object.keys(tagHash);
            }.bind(this));
            this.selectedTag.subscribe(function (nv) { return nv !== null && _this.query(''); });
            this.query.subscribe(function (nv) { return nv !== '' && _this.selectedTag(null); });
            this.initialize();
            this.defaultColumns();
            this.bindEventHandlers();
        }
        ViewModel.prototype.initialize = function () {
            var self = this;
            function onSuccess(data) {
                self.templates(jsyaml.load(data).templates);
            }
            $.ajax('./workshopPlanner/templates.yaml', { dataType: "text", success: onSuccess });
        };
        ViewModel.prototype.defaultColumns = function () {
            for (var i = 0; i < 10; i++) {
                this.columns.push({ name: "Day " + (i + 1), activities: ko.observableArray([]) });
            }
        };
        ViewModel.prototype.bindEventHandlers = function () {
            document.addEventListener('drop', this.onDragDrop.bind(this));
        };
        ViewModel.prototype.onDragDrop = function (e) {
            var eventDetails = e.detail;
            var activityOrTemplate = ko.contextFor(eventDetails.el)['$data'];
            var sourceColumn = ko.contextFor(eventDetails.sourceEl)['$data'];
            if (sourceColumn && sourceColumn.activities) {
                sourceColumn.activities.remove(activityOrTemplate);
            }
            var targetColumn = ko.contextFor(eventDetails.targetEl)['$data'];
            if (targetColumn && targetColumn.activities) {
                targetColumn.activities.splice(eventDetails.targetIndex, 0, $.extend({}, activityOrTemplate));
            }
            e.returnValue = false;
        };
        ViewModel.prototype.search = function () {
            var _this = this;
            if (this.selectedTag()) {
                return this.templates().filter(function (t) { return t.tags && t.tags.indexOf(_this.selectedTag()) !== -1; });
            }
            else {
                return this.templates().filter(function (t) { return t.name && t.name.toLowerCase().indexOf(_this.query().toLowerCase()) !== -1; });
            }
        };
        return ViewModel;
    })();
    WorkshopPlanner.ViewModel = ViewModel;
})(WorkshopPlanner || (WorkshopPlanner = {}));
var WorkshopPlanner;
(function (WorkshopPlanner) {
    var viewModel = new WorkshopPlanner.ViewModel();
    ko.applyBindings(viewModel);
})(WorkshopPlanner || (WorkshopPlanner = {}));
//# sourceMappingURL=workshopPlanner.js.map