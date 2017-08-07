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