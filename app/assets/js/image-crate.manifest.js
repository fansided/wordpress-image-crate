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
