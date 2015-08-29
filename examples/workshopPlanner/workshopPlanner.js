ko.bindingHandlers.semanticModal = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        setTimeout(function () { return $(element).modal('show'); }, 0);
    }
};
ko.bindingHandlers.mediumEditorMarkdown = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor();
        var options = allBindingsAccessor().editorOptions || {};
        var markdown = ko.unwrap(value);
        $(element).html(marked(markdown));
        var editor = new MediumEditor(element, {
            buttons: ['bold',
                'italic',
                'underline',
                'quote',
                'anchor',
                'unorderedlist',
                'orderedlist',
                'outdent',
                'indent'],
            buttonLabels: false,
            placeholder: options.initialText,
            extensions: { markdown: new MeMarkdown(function (markdown) { return value(markdown); }) }
        });
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () { return editor.destroy(); });
    }
};
ko.bindingHandlers.marked = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var markdown = ko.unwrap(valueAccessor());
        element.innerHTML = markdown ? marked(markdown) : '';
    }
};
var WorkshopPlanner;
(function (WorkshopPlanner) {
    var Activity = (function () {
        function Activity(data) {
            this.name = ko.observable("");
            this.shortDescription = ko.observable("");
            this.description = ko.observable("");
            this.tags = ko.observableArray([]);
            this.duration = ko.observable("");
            this.category = ko.observable("");
            this.imageName = ko.observable("");
            this.notes = ko.observable("");
            this.apply(data);
        }
        Activity.prototype.apply = function (data) {
            for (var prop in data)
                if (ko.isObservable(this[prop]))
                    this[prop](data[prop]);
        };
        Activity.prototype.toJS = function () {
            var result = {};
            for (var prop in this)
                if (ko.isObservable(this[prop]))
                    result[prop] = ko.unwrap(this[prop]);
            return result;
        };
        return Activity;
    })();
    WorkshopPlanner.Activity = Activity;
})(WorkshopPlanner || (WorkshopPlanner = {}));
var WorkshopPlanner;
(function (WorkshopPlanner) {
    var Day = (function () {
        function Day(data) {
            this.name = ko.observable("");
            this.activities = ko.observableArray([]);
            for (var prop in data) {
                if (ko.isObservable(this[prop]) && prop !== 'activities')
                    this[prop](data[prop]);
            }
            var activities = [];
            for (var _i = 0, _a = data.activities || []; _i < _a.length; _i++) {
                var activity = _a[_i];
                activities.push(new WorkshopPlanner.Activity(activity));
            }
            this.activities(activities);
        }
        Day.prototype.toJS = function () {
            var result = {};
            for (var prop in this) {
                if (ko.isObservable(this[prop]) && prop !== 'activities')
                    result[prop] = ko.unwrap(this[prop]);
            }
            result.activities = [];
            for (var _i = 0, _a = this.activities(); _i < _a.length; _i++) {
                var activity = _a[_i];
                result.activities.push(activity.toJS());
            }
            return result;
        };
        return Day;
    })();
    WorkshopPlanner.Day = Day;
})(WorkshopPlanner || (WorkshopPlanner = {}));
var WorkshopPlanner;
(function (WorkshopPlanner) {
    var Workshop = (function () {
        function Workshop(data) {
            this.name = ko.observable("");
            this.days = ko.observableArray([]);
            for (var prop in data) {
                if (ko.isObservable(this[prop]) && prop !== 'days')
                    this[prop](data[prop]);
            }
            var days = [];
            for (var _i = 0, _a = data.days || []; _i < _a.length; _i++) {
                var day = _a[_i];
                days.push(new WorkshopPlanner.Day(day));
            }
            this.days(days);
        }
        Workshop.prototype.toJS = function () {
            var result = {};
            for (var prop in this)
                if (ko.isObservable(this[prop]) && prop !== 'days')
                    result[prop] = ko.unwrap(this[prop]);
            result.days = [];
            for (var _i = 0, _a = this.days(); _i < _a.length; _i++) {
                var day = _a[_i];
                result.days.push(day.toJS());
            }
            return result;
        };
        return Workshop;
    })();
    WorkshopPlanner.Workshop = Workshop;
})(WorkshopPlanner || (WorkshopPlanner = {}));
var WorkshopPlanner;
(function (WorkshopPlanner) {
    var ViewModel = (function () {
        function ViewModel() {
            var _this = this;
            this.query = ko.observable('');
            this.templates = ko.observableArray([]);
            this.selectedTag = ko.observable(null);
            this.openActivity = ko.observable(null);
            this.editingActivity = ko.observable(null);
            this.workshop = ko.observable(null);
            window['viewModel'] = this;
            this.filteredTemplates = ko.pureComputed(this.search.bind(this));
            this.tags = ko.pureComputed(function () {
                var tagHash = {};
                this.templates().forEach(function (ActivityTemplate) { return ActivityTemplate.category && (tagHash[ActivityTemplate.category] = true); });
                return Object.keys(tagHash);
            }.bind(this));
            this.selectedTag.subscribe(function (nv) { return nv !== null && _this.query(''); });
            this.query.subscribe(function (nv) { return nv !== '' && _this.selectedTag(null); });
            this.initialize();
            if (!this.tryLoad())
                this.defaultWorkshop();
            this.bindEventHandlers();
            ko.watch(this.workshop, { depth: -1 }, function () { return _this.save(); });
        }
        ViewModel.prototype.doOpenActivity = function (activity) {
            this.editingActivity(null);
            this.openActivity(activity);
        };
        ViewModel.prototype.doEditActivity = function () {
            this.editingActivity(new WorkshopPlanner.Activity(this.openActivity().toJS()));
        };
        ViewModel.prototype.doSaveActivity = function () {
            this.openActivity().apply(this.editingActivity().toJS());
            this.editingActivity(null);
        };
        ViewModel.prototype.initialize = function () {
            this.loadTemplatesFromLocal(this.templates);
            this.loadTemplatesFromGoogleSheets(this.templates);
        };
        ViewModel.prototype.loadTemplatesFromLocal = function (templates) {
            function onSuccess(data) {
                templates(jsyaml.load(data).templates);
            }
            $.ajax('./templates.yaml', { dataType: "text", success: onSuccess });
        };
        ViewModel.prototype.loadTemplatesFromGoogleSheets = function (templates) {
            var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1Ax95IyMyL42FF7YHA1NgBLUkiTDcZjrMbCmxlOyRZ2U/pubhtml';
            function showInfo(data, tabletop) {
                templates(data.Sheet1.all());
            }
            var tabletop = Tabletop.init({ key: public_spreadsheet_url,
                callback: showInfo,
                simpleSheet: false,
                parseNumbers: true });
        };
        ViewModel.prototype.defaultWorkshop = function () {
            this.workshop(new WorkshopPlanner.Workshop({ name: "My Workshop" }));
            for (var i = 0; i < 10; i++)
                this.workshop().days.push(new WorkshopPlanner.Day({ name: "Day " + (i + 1) }));
        };
        ViewModel.prototype.bindEventHandlers = function () {
            document.addEventListener('tactile:dragstart', this.onDragStart.bind(this));
            document.addEventListener('tactile:dragend', this.onDragEnd.bind(this));
            document.addEventListener('tactile:drop', this.onDragDrop.bind(this));
        };
        ViewModel.prototype.onDragStart = function (e) {
            $(document.body).addClass("show-activity-bin");
        };
        ViewModel.prototype.onDragEnd = function (e) {
            $(document.body).removeClass("show-activity-bin");
        };
        ViewModel.prototype.onDragDrop = function (e) {
            var eventDetails = e.detail;
            var context = ko.contextFor(eventDetails.el)['$data'];
            if (context instanceof WorkshopPlanner.Activity) {
                var activity = context;
                var sourceColumn = ko.contextFor(eventDetails.sourceEl)['$data'];
                var targetColumn = ko.contextFor(eventDetails.targetEl)['$data'];
                if (sourceColumn)
                    sourceColumn.activities.remove(activity);
                if (targetColumn)
                    targetColumn.activities.splice(eventDetails.targetIndex, 0, activity);
            }
            else {
                var activityTemplate = context;
                var targetColumn = ko.contextFor(eventDetails.targetEl)['$data'];
                if (targetColumn)
                    targetColumn.activities.splice(eventDetails.targetIndex, 0, new WorkshopPlanner.Activity(activityTemplate));
            }
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
            var workshopData = this.workshop().toJS();
            var workshopJson = JSON.stringify(workshopData);
            localStorage.setItem('workshop', workshopJson);
        };
        ViewModel.prototype.tryLoad = function () {
            var jsonString = localStorage.getItem('workshop');
            if (jsonString) {
                var workshopData = JSON.parse(jsonString);
                var workshop = new WorkshopPlanner.Workshop(workshopData);
                this.workshop(workshop);
                return true;
            }
            return false;
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