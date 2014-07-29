/*
 * edit-header-view
 * ----------------
 * The edit view for the title.
 *
 */

var EditTitleView = Marionette.ItemView.extend({
  template: gistbookTemplates.editTitleView,

  className: 'edit-title-view',

  ui: {
    input: 'input',
    save: 'button',
    cancel: 'a'
  },

  events: {
    'keypress input': 'onKeypress'
  },

  triggers: {
    'click @ui.save': 'save',
    'click @ui.cancel': 'cancel'
  },

  onSave: function() {
    var newTitle = this.ui.input.val();
    this.model.set('title', newTitle);
  },

  onKeypress: function(e) {
    if (e.keyCode !== 13) {
      return;
    }
    this.triggerMethod('save');
  }
});