(function ($) {
	$(function () {

		var imagecrate = imagecrate || {};

		// core
		var corePost = wp.media.view.MediaFrame.Post;

		// controllers
		imagecrate.ImageExchangeController = require('./controllers/image-exchange.js');
		imagecrate.GettyImagesController = require('./controllers/getty-images.js');

		//models
        imagecrate.ProviderAttachments = require('./models/attachments.js');

		// views
		imagecrate.ProviderToolbar = require('./views/toolbars/provider.js');
        imagecrate.ProviderPhotosBrowser = require('./views/browser/attachments.js');

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
                var state = this.state(),
                    id = state.get('id'),
                    collection = state.get('image_crate_photos'),
                    selection = state.get('selection');

                if (_.isUndefined(collection)) {
                    collection = new imagecrate.ProviderAttachments(
                        null,
                        {
                            props: state.get('library').props.toJSON()
                        }
                    );

                    // Reference the state if needed later
                    state.set('image_crate_photos', collection);
                }

                contentRegion.view = new imagecrate.ProviderPhotosBrowser({
                    tagName: 'div',
                    className: id + ' image-crate attachments-browser',
                    controller: this,
                    collection: collection,
                    selection: selection,
                    model: state,
                    filters: true,
                    search: true,
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
