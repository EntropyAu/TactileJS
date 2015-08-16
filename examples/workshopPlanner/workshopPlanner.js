var WorkshopPlanner;
(function (WorkshopPlanner) {
    var ViewModel = (function () {
        function ViewModel() {
            this.foo = ko.observable('bar');
        }
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