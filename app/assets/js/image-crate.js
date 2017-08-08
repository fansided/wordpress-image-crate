(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * wp.media.controller.GettyImagesController
 *
 * A state for downloading images from an external image source
 *
 * @augments wp.media.controller.Library
 */
var Library = wp.media.controller.Library,
    GettyImagesController;

GettyImagesController = Library.extend({
    defaults: _.defaults({
        id: 'getty-images',
        title: 'Getty Images (IC)',
        priority: 300,
        content: 'provider',
        router: 'image-provider',
        toolbar: 'image-provider',
        button: 'Download Getty Image',
        library: wp.media.query({ provider: 'getty-images'} )
    }, Library.prototype.defaults ),

    activate: function () {
        this.set('mode', this.id );
    }
});

module.exports = GettyImagesController;
},{}],2:[function(require,module,exports){
/**
 * wp.media.controller.ImageExchangeController
 *
 * A state for downloading images from an external image source
 *
 * @augments wp.media.controller.Library
 */
var Library = wp.media.controller.Library,
    ImageExchangeController;

ImageExchangeController = Library.extend({
    defaults: _.defaults({
        id: 'image-exchange',
        title: 'Image Exchange',
        priority: 320,
        content: 'provider',
        router: 'image-provider',
        toolbar: 'image-provider',
        button: 'Download FanSided Image',
        library: wp.media.query({ provider: 'image-exchange' })
    }, Library.prototype.defaults ),

    activate: function () {
        this.set( 'mode', this.id );
    }
});

module.exports = ImageExchangeController;
},{}],3:[function(require,module,exports){
(function ($) {
	$(function () {

		var imagecrate = imagecrate || {};

		// core
		var corePost = wp.media.view.MediaFrame.Post;

		// controllers
		imagecrate.ImageExchangeController = require('./controllers/image-exchange.js');
		imagecrate.GettyImagesController = require('./controllers/getty-images.js');

		//models
        imagecrate.StockPhotoThumb = require('./views/browser/image-crate-photo.js'),
        imagecrate.StockPhotosModel = require('./models/image-crate-photo-model.js'),
        imagecrate.StockPhotoBrowser = require('./views/browser/image-crate-photos.js'),

		// views
		imagecrate.ProviderToolbar = require('./views/toolbars/provider.js');

		/**
		 * Add controllers to the media modal Post Frame
		 */
		wp.media.view.MediaFrame.Post = corePost.extend({

            createStates: function () {
				corePost.prototype.createStates.apply(this, arguments);

				this.states.add([
					new imagecrate.GettyImagesController,
					new imagecrate.ImageExchangeController
				]);
			},

			bindHandlers: function () {
				corePost.prototype.bindHandlers.apply(this, arguments);

				this.on('toolbar:create:image-provider', this.createToolbar, this);
				this.on('toolbar:render:image-provider', imagecrate.ProviderToolbar, this);

                this.on('router:create:image-provider', this.createRouter, this);
                this.on('router:render:image-provider', this.providerRouter, this);

                this.on('content:create:provider', this.providerContent, this);
			},

            providerContent: function( contentRegion ) {
                var state = this.state();

                this.$el.removeClass('hide-toolbar');

                // Browse our library of attachments.
                contentRegion.view = new imagecrate.StockPhotoBrowser({
                    controller: this,
                    collection: state.get('library'),
                    selection: state.get('selection'),
                    model: state,
                    sortable: state.get('sortable'),
                    search: state.get('searchable'),
                    filters: state.get('filterable'),
                    date: state.get('date'),
                    display: state.has('display') ? state.get('display') : state.get('displaySettings'),
                    dragInfo: state.get('dragInfo'),

                    idealColumnWidth: state.get('idealColumnWidth'),
                    suggestedWidth: state.get('suggestedWidth'),
                    suggestedHeight: state.get('suggestedHeight'),

                    AttachmentView: imagecrate.StockPhotoThumb
                });
            },

            providerRouter: function (routerView) {
                routerView.set({
                    provider: {
                        text: 'Provider',
                        priority: 20
                    }
                });
            }

		});
	});
})(jQuery);

},{"./controllers/getty-images.js":1,"./controllers/image-exchange.js":2,"./models/image-crate-photo-model.js":4,"./views/browser/image-crate-photo.js":6,"./views/browser/image-crate-photos.js":7,"./views/toolbars/provider.js":11}],4:[function(require,module,exports){
/**
 * wp.media.model.StockPhotosQuery
 *
 * A collection of attachments.
 *
 * @class
 * @augments wp.media.model.Attachments
 */
var StockPhotosQuery = require('./image-crate-photos-query');

var StockPhotos = wp.media.model.Attachments.extend({

    initialize: function (models, options) {
        wp.media.model.Attachments.prototype.initialize.call(this, models, options);
    },
    _requery: function (refresh) {
        var props;

        if ( this.props.get('query') ) {
            props = this.props.toJSON();
            props.cache = ( true !== refresh );
            this.mirror( StockPhotosQuery.get( props ) );
        }
    }
});

module.exports = StockPhotos;

},{"./image-crate-photos-query":5}],5:[function(require,module,exports){
/**
 * wp.media.model.Query
 *
 * A collection of attachments from the external data source.
 *
 * @augments wp.media.model.Query
 */
var StockPhotosQuery = wp.media.model.Query.extend({

        /**
         * Overrides wp.media.model.Query.sync
         * Overrides Backbone.Collection.sync
         * Overrides wp.media.model.Attachments.sync
         *
         * @param {String} method
         * @param {Backbone.Model} model
         * @param {Object} [options={}]
         * @returns {Promise}
         */
        sync: function (method, model, options) {
            var args;

            // Overload the read method so Attachment.fetch() functions correctly.
            if ('read' === method) {
                options = options || {};
                options.context = this;
                options.data = _.extend(options.data || {}, {
                    action: 'image_crate_get',
                    _ajax_nonce: imagecrate.nonce
                });

                // Clone the args so manipulation is non-destructive.
                args = _.clone(this.args);

                // Determine which page to query.
                if (-1 !== args.posts_per_page) {
                    args.paged = Math.round(this.length / args.posts_per_page) + 1;
                }

                options.data.query = args;
                return wp.media.ajax(options);

                // Otherwise, fall back to Backbone.sync()
            } else {
                /**
                 * Call wp.media.model.Attachments.sync or Backbone.sync
                 */
                fallback = Attachments.prototype.sync ? Attachments.prototype : Backbone;
                return fallback.sync.apply(this, arguments);
            }
        }
    },
    {
        /**
         * Overriding core behavior
         */
        get: (function () {
            /**
             * @static
             * @type Array
             */
            var queries = [];

            /**
             * @returns {Query}
             */
            return function (props, options) {
                var someprops = props;
                var Query = StockPhotosQuery,
                    args = {},
                    query,
                    cache = !!props.cache || _.isUndefined(props.cache);

                // Remove the `query` property. This isn't linked to a query,
                // this *is* the query.
                delete props.query;
                delete props.cache;

                // Generate the query `args` object.
                // Correct any differing property names.
                _.each(props, function (value, prop) {
                    if (_.isNull(value)) {
                        return;
                    }
                    args[prop] = value;
                });

                // Fill any other default query args.
                _.defaults(args, Query.defaultArgs);

                // Search the query cache for a matching query.
                if (cache) {
                    query = _.find(queries, function (query) {
                        return _.isEqual(query.args, args);
                    });
                } else {
                    queries = [];
                }

                // Otherwise, create a new query and add it to the cache.
                if (!query) {
                    query = new Query([], _.extend(options || {}, {
                        props: props,
                        args: args
                    }));
                    queries.push(query);
                }
                return query;
            };
        }())
    });

module.exports = StockPhotosQuery;

},{}],6:[function(require,module,exports){
/**
 * wp.media.view.StockPhotoThumb
 *
 * @augments wp.media.view.Attachment
 */
var StockPhotoThumb = wp.media.view.Attachment.extend({

    render: function () {
        var options = _.defaults(this.model.toJSON(), {
            orientation: 'landscape',
            uploading: false,
            type: '',
            subtype: '',
            icon: '',
            filename: '',
            caption: '',
            title: '',
            dateFormatted: '',
            width: '',
            height: '',
            compat: false,
            alt: '',
            description: ''
        }, this.options);

        options.buttons = this.buttons;
        options.describe = this.controller.state().get('describe');

        if ('image' === options.type) {
            options.size = this.imageSize('thumbnail');
        }

        options.can = {};
        if (options.nonces) {
            options.can.remove = !!options.nonces['delete'];
            options.can.save = !!options.nonces.update;
        }

        if (this.controller.state().get('allowLocalEdits')) {
            options.allowLocalEdits = true;
        }

        if (options.uploading && !options.percent) {
            options.percent = 0;
        }

        this.views.detach();
        this.$el.html(this.template(options));

        this.$el.toggleClass('uploading', options.uploading);

        if (options.uploading) {
            this.$bar = this.$('.media-progress-bar div');
        } else {
            delete this.$bar;
        }

        // Check if the model is selected.
        this.updateSelect();

        // Update the save status.
        this.updateSave();

        this.views.render();

        return this;
    },
});

module.exports = StockPhotoThumb;

},{}],7:[function(require,module,exports){
/**
 * wp.media.view.StockPhotosBrowser
 *
 * @class
 * @augments wp.media.view.AttachmentsBrowser
 */
var ImageCrateSearch = require('./search.js'),
    NoResults = require('./no-results.js'),
    VerticalsFilter = require('./verticals-filter.js'),
    coreAttachmentsInitialize  = wp.media.view.AttachmentsBrowser.prototype.initialize,
    StockPhotosBrowser;

StockPhotosBrowser = wp.media.view.AttachmentsBrowser.extend({
    tagName: 'div',
    className: 'image-crate attachments-browser',

    defaults: _.defaults({
        filters: false,
        search: false,
        date: false,
        display: false,
        sidebar: true,
    }, wp.media.view.AttachmentsBrowser.prototype.defaults),

    initialize: function () {
        coreAttachmentsInitialize.apply(this, arguments);
        this.createToolBar();
        this.createUploader();
    },

    createToolBar: function() {
        this.toolbar.set('VerticalsFilterLabel', new wp.media.view.Label({
            value: 'Verticals Label',
            attributes: {
                'for': 'media-attachment-vertical-filters'
            },
            priority: -75
        }).render());
        this.toolbar.set('VerticalsFilter', new VerticalsFilter({
            controller: this.controller,
            model: this.collection.props,
            priority: -75
        }).render());

        this.toolbar.set('search', new ImageCrateSearch({
            controller: this.controller,
            model: this.collection.props,
            priority: 60
        }).render())
    },

    // todo: clean this up and review entire file
    // createUploader: function () {
    //     this.uploader = new NoResults({
    //         controller: this.controller,
    //         status: false,
    //         message: 'Sorry, No images were found.'
    //     });
    //
    //     this.uploader.hide();
    //     this.views.add(this.uploader);
    // },
});

module.exports = StockPhotosBrowser;
},{"./no-results.js":8,"./search.js":9,"./verticals-filter.js":10}],8:[function(require,module,exports){
/**
 * wp.media.view.NoResults
 *
 * @augments wp.media.view.UploaderInline
 */
var UploaderInline = wp.media.view.UploaderInline,
    NoResults;

NoResults = UploaderInline.extend({
    tagName: 'div',
    className: 'image-crate-no-results uploader-inline',
    template: wp.template('image-crate-no-results'),

    ready: function () {
        var $browser = this.options.$browser,
            $placeholder;

        if (this.controller.uploader) {
            $placeholder = this.$('.browser');

            // Check if we've already replaced the placeholder.
            if ($placeholder[0] === $browser[0]) {
                return;
            }

            $browser.detach().text($placeholder.text());
            $browser[0].className = 'browser button button-hero';
            $placeholder.replaceWith($browser.show());
        }

        this.refresh();
        return this;
    }
});

module.exports = NoResults;

},{}],9:[function(require,module,exports){
/**
 * wp.media.view.ImageCrateSearch
 *
 * @augments wp.media.view.Search
 */
var ImageCrateSearch = wp.media.View.extend({
    tagName: 'input',
    className: 'search ic-search',
    id: 'media-search-input',

    attributes: {
        type: 'search',
        placeholder: 'Search Images'
    },

    events: {
        'input': 'search',
        'keyup': 'search'
    },

    initialize: function() {
        if ( this.model.get( 'search' ) === undefined ) {
            this.model.set( 'search', imagecrate.default_search );
        }
    },

    /**
     * @returns {wp.media.view.Search} Returns itself to allow chaining
     */
    render: function () {
        this.el.value = this.model.get( 'search' ) === undefined ? imagecrate.default_search : this.model.escape( 'search' );
        return this;
    },

    search: function (event) {
        this.deBounceSearch(event);
    },

    /**
     * There's a bug in core where searches aren't de-bounced in the media library.
     * Normally, not a problem, but with external api calls or tons of image/users, ajax
     * calls could effect server performance. This fixes that for now.
     */
    deBounceSearch: _.debounce(function (event) {
        if (event.target.value) {
            this.model.set('search', event.target.value);
        } else {
            this.model.unset('search');
        }
    }, 500)

});

module.exports = ImageCrateSearch;
},{}],10:[function(require,module,exports){
/**
 * wp.media.view.VerticalsFilter
 *
 * @augments wp.media.view.AttachmentFilters
 */
var VerticalsFilter = wp.media.view.AttachmentFilters.extend( {
    id: 'media-attachment-vertical-filters',

    createFilters: function () {
        var filters = {};
        var verticals = [
            { vertical: 'NFL', text: '- NFL' },
            { vertical: 'NBA', text: '- NBA' },
            { vertical: 'MLB', text: '- MLB' },
            { vertical: 'NHL', text: '- NHL' },
            { vertical: 'NCAA Basketball', text: '- NCAA: Basketball' },
            { vertical: 'NCAA Football', text: '- NCAA: Football' },
            { vertical: 'SOCCER', text: '- Soccer' },
            { vertical: 'ENT', text: 'Entertainment '}
        ];

        _.each(verticals || {}, function ( value, index ) {
            filters[ index ] = {
                text: value.text,
                props: {
                    vertical: value.vertical
                }
            };
        });

        filters.all = {
            text: 'All Sports',
            props: {
                vertical: false
            },
            priority: 10
        };
        this.filters = filters;
    }
});

module.exports = VerticalsFilter;
},{}],11:[function(require,module,exports){
/**
 * wp.media.controller.GettyImagesController
 *
 * Custom Toolbar for downloading images
 *
 * @augments wp.media.controller.Library
 */
var ProviderToolbar = function (view) {
    var controller = this,
        state = controller.state();

    this.selectionStatusToolbar(view);

    view.set(state.get('id'), {
        style: 'primary',
        priority: 80,
        text: state.get('button'),
        requires: {selection: true},

        /**
         * @fires wp.media.controller.State#insert
         */
        click: function () {
            var selection = state.get('selection');

            // todo: download image here

            controller.close();
            state.trigger('insert', selection).reset();
        }
    });
};

module.exports = ProviderToolbar;
},{}]},{},[3]);
