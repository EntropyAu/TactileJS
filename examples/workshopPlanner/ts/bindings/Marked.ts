interface KnockoutBindingHandlers {
    marked: KnockoutBindingHandler;
}

ko.bindingHandlers.marked = {
  update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    let markdown = <string>ko.unwrap(valueAccessor());
    element.innerHTML = markdown ? marked(markdown) : '';
  }
}
