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