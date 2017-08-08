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