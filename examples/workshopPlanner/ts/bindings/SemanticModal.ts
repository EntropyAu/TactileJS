interface KnockoutBindingHandlers {
    semanticModal: KnockoutBindingHandler;
}

interface JQuery {
    modal(command:string):void;
}

ko.bindingHandlers.semanticModal = {
  update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    $(element).modal('show');
  }
}
