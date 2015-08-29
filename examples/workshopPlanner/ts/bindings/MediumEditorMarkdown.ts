interface KnockoutBindingHandlers {
    mediumEditorMarkdown: KnockoutBindingHandler;
}

ko.bindingHandlers.mediumEditorMarkdown = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    let value = valueAccessor();
    let options = allBindingsAccessor().editorOptions || {};

    let markdown = ko.unwrap(value);
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
      extensions: { markdown: new MeMarkdown((markdown) => value(markdown)) }
    });
    ko.utils.domNodeDisposal.addDisposeCallback(element, () => editor.destroy());
  }
};
