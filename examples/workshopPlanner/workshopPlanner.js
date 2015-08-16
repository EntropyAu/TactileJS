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
                this.templates().forEach(function (template) { return template.category && (tagHash[template.category] = true); });
                return Object.keys(tagHash);
            }.bind(this));
            this.selectedTag.subscribe(function (nv) { return nv !== null && _this.query(''); });
            this.query.subscribe(function (nv) { return nv !== '' && _this.selectedTag(null); });
            this.initialize();
            var columns = this.load();
            if (columns) {
                for (var i = 1; i < columns.length; i++) {
                    this.columns.push({ name: columns[i].name, activities: ko.observableArray(columns[i].activities) });
                }
            }
            else {
                this.defaultColumns();
            }
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
            this.save();
            e.returnValue = false;
        };
        ViewModel.prototype.search = function () {
            var _this = this;
            if (this.selectedTag()) {
                return this.templates().filter(function (t) { return t.category && t.category.indexOf(_this.selectedTag()) !== -1; });
            }
            else {
                return this.templates().filter(function (t) { return t.name && t.name.toLowerCase().indexOf(_this.query().toLowerCase()) !== -1; });
            }
        };
        ViewModel.prototype.save = function () {
            var jsonData = ko.toJSON(this);
            console.log(jsonData);
            localStorage.setItem('workshopViewModel', jsonData);
        };
        ViewModel.prototype.load = function () {
            var jsonData = localStorage.getItem('workshopViewModel');
            var jsonParsed = JSON.parse(jsonData);
            console.log(jsonData);
            return jsonParsed ? jsonParsed.columns : null;
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