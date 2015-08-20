interface KnockoutBindingHandlers {
    semanticModal: KnockoutBindingHandler;
}

interface JQuery {
    modal(command:string):void;
}

ko.bindingHandlers.semanticModal = {
  init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    // wait one tick to allow time for the dialog contents to be bound
    setTimeout(() => $(element).modal('show'), 0);
  }
}
