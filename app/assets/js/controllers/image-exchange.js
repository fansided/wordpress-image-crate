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