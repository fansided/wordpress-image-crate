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
        priority: 200,
        content: 'upload',
        router: 'browse',
        state: 'upload',
        toolbar: 'image-provider',
        button: 'Download Getty Image'
    }, wp.media.controller.Library.prototype.defaults),

    initialize: function () {
        if (!this.get('library')) {
            this.set('library', wp.media.query({
                    provider: 'getty-images'
                })
            );
        }
        wp.media.controller.Library.prototype.initialize.apply(this, arguments);
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
        priority: 220,
        content: 'upload',
        router: 'browse',
        toolbar: 'image-provider',
        button: 'Download FanSided Image'
    }, wp.media.controller.Library.prototype.defaults),

    initialize: function () {
        if (!this.get('library')) {
            this.set('library', wp.media.query({
                    provider: 'image-exchange'
                })
            );
        }
        wp.media.controller.Library.prototype.initialize.apply(this, arguments);
    }
});

module.exports = ImageExchangeController;
},{}],3:[function(require,module,exports){
(function ($) {
    $(function () {

        var imagecrate = imagecrate || {};

        // core
        var coreMediaFrame = wp.media.view.MediaFrame.Post;

        // controllers
        imagecrate.ImageExchangeController = require('./controllers/image-exchange.js');
        imagecrate.GettyImagesController = require('./controllers/getty-images.js');

        // views
        imagecrate.ProviderToolbar = require('./views/toolbars/provider.js');

        /**
         * Add controllers to the media modal Post Frame
         */
        wp.media.view.MediaFrame.Post = coreMediaFrame.extend({

            initialize: function () {

                coreMediaFrame.prototype.initialize.apply(this, arguments);

                // Adding new tab
                this.states.add([
                    new imagecrate.GettyImagesController,
                    new imagecrate.ImageExchangeController
                ]);
            },

            bindHandlers: function () {
                coreMediaFrame.prototype.bindHandlers.apply(this, arguments);

                this.on('toolbar:create:image-provider', this.createToolbar, this);
                this.on('toolbar:render:image-provider', imagecrate.ProviderToolbar, this);
            }

        });
    });
})(jQuery);

},{"./controllers/getty-images.js":1,"./controllers/image-exchange.js":2,"./views/toolbars/provider.js":4}],4:[function(require,module,exports){
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

            controller.close();
            state.trigger('insert', selection).reset();
        }
    });
};

module.exports = ProviderToolbar;
},{}]},{},[3]);
