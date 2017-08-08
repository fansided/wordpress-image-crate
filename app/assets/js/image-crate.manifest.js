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
