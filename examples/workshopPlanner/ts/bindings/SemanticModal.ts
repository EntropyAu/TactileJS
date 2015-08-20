interface KnockoutBindingHandlers {
    semanticModal: KnockoutBindingHandler;
}

ko.bindingHandlers.semanticModal = {
  update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    $(element).modal('show');
  }
}
