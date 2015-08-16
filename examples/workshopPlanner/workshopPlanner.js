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
        }
        ViewModel.prototype.initialize = function () {
            var self = this;
            function onSuccess(data) {
                self.templates(jsyaml.load(data).templates);
            }
            $.ajax('./workshopPlanner/templates.yaml', { dataType: "text", success: onSuccess });
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