/*
 * gistbook-view
 * -------------
 * The publicly exposed view from this library.
 * It is a composite view that renders the Gistbook.
 *
 */

var GistbookView = Marionette.CompositeView.extend({

  // Create our collection from the gistbook's blocks
  initialize: function(options) {
    var gistblocks = options.model.get('blocks');
    this.collection = new Backbone.Collection(gistblocks);
    this.collection.uniqueId = _.uniqueId();
    this.collectionController = new CollectionController({
      collection: this.collection
    });
    this.authorized = radio.reqres.request('global', 'authorized');
    this.gistbookCh = radio.channel(channelName(this.collection));
  },

  // Silently update the collection based on the new DOM indices
  resortByDom: function() {
    var newCollection = {};
    var newArray = [];
    var index, view;
    this.collection.each(function(model, i) {
      view = this.children.findByModel(model);
      index = this.ui.container.children().index(view.el);
      newCollection[index] = model;
      newArray = _.sortBy(newCollection, function(key, i) {
        return i;
      });
      // Update the internal cached index
      view._index = index;
    }, this);
    this.collection.reset(newArray, {silent: true});
  },

  template: gistbookTemplates.gistbookView,

  ui: {
    container: '.gistbook-container'
  },

  childViewContainer: '.gistbook-container',

  // Never used; just here to prevent errors
  childView: Marionette.ItemView.extend({
    template: _.template('')
  }),

  className: 'gistbook',

  // Determine the view based on the authorization
  // and model info
  getChildView: function(model) {;
    var viewType = model.get('type');
    return this['_'+viewType+'View']();
  },

  _textView: function() {
    if (this.authorized) {
      this.childViewOptions = {
        InertView: InertTextView
      };
      return ProcessedEditView;
    }

    else {
      this.childViewOptions = {};
      return InertTextView.extend({
        tagName: 'li'
      });
    }

  },

  // Make it sortable if we're authorized
  onRender: function() {
    this._setUpSortable();
  },

  _setUpSortable: function() {
    if (this.authorized) {
      this.ui.container.sortable({
        handle: '.gistblock-move'
      });
      this.ui.container.on('sortupdate', _.bind(this.resortByDom, this));
    }
  },

  _javascriptView: function() {
    if (this.authorized) {
      var CustomAceEditor = AceEditorView.extend({
        className: 'gistblock gistblock-javascript'
      });
      this.childViewOptions = {
        InertView: CustomAceEditor,
        editOptions: {
          edit: false,
          delete: true,
          move: true
        }
      };
      return ProcessedEditView;
    }

    else {
      this.childViewOptions = {
        readOnly: true,
        hideCursor: true,
        className: 'gistblock gistblock-javascript'
      };
      return AceEditorView.extend({
        tagName: 'li'
      });
    }
  },

  onBeforeDestroy: function() {
    // Shut down sortable
    this.ui.container.sortable('destroy');
  }
});
