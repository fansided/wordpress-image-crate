/**
 * wp.media.view.StockPhotosBrowser
 *
 * @class
 * @augments wp.media.view.AttachmentsBrowser
 */
var ImageCrateSearch = require( './search.js' ),
	NoResults = require( './no-results.js' ),
	VerticalsFilter = require( './verticals-filter.js' ),
	coreAttachmentsInitialize = wp.media.view.AttachmentsBrowser.prototype.initialize,
	ProviderPhotosBrowser;

ProviderPhotosBrowser = wp.media.view.AttachmentsBrowser.extend( {

	initialize: function() {
		coreAttachmentsInitialize.apply( this, arguments );

		this.createToolBar();
		this.createUploader( true );
	},

	updateContent: function() {
		var view = this,
			noItemsView;

		noItemsView = view.uploader;

		if ( !this.collection.length ) {
			this.toolbar.get( 'spinner' ).show();
			noItemsView.$el.hide();
			this.toolbar.get( 'search' ).$el.show();

			this.dfd = this.collection.more().done( function() {
				if ( !view.collection.length ) {
					noItemsView.$el.show();
				} else {
					noItemsView.$el.hide();
				}
				view.toolbar.get( 'spinner' ).hide();
			} );

		} else {
			noItemsView.$el.addClass( 'hidden' );
			view.toolbar.get( 'spinner' ).hide();
		}
	},

	/**
	 * Override core toolbar view rendering.
	 *
	 * Change events are auto assigned to select fields and text inputs. Any form change will send
	 * new values to the backend via an ajax call.
	 */
	createToolBar: function() {
		// Labels are display visually, but they are rendered for accessibility.
		// this.toolbar.set( 'VerticalsFilterLabel', new wp.media.view.Label( {
		// 	value: 'Verticals Label',
		// 	attributes: {
		// 		'for': 'media-attachment-vertical-filters'
		// 	},
		// 	priority: -75
		// } ).render() );
		//
		// this.toolbar.set( 'VerticalsFilter', new VerticalsFilter( {
		// 	controller: this.controller,
		// 	model: this.collection.props,
		// 	priority: -75
		// } ).render() );

		var model =  this.collection.props;

		this.toolbar.unset( 'dateFilterLabel', {} );
		this.toolbar.unset( 'dateFilter', {} );
		this.toolbar.unset( 'search', {} );

		this.toolbar.set( 'search', new ImageCrateSearch( {
			controller: this.controller,
			model: this.collection.props,
			priority: -70
		} ).render() );

		this.views.add( this.toolbar );

		if ( !this.collection.length && ! model.get( 'searchActive' ) ) {
			this.toolbar.get( 'search' ).$el.hide();
		}
	},

	/**
	 * Override core uploader method.
	 */
	createUploader: function( render ) {
		var shouldRender = ( !_.isUndefined( render ) );

		this.uploader = new NoResults( {
			controller: this.controller,
			model: this.collection.props,
			collection: this.collection,
			shouldRender: shouldRender
		} );

		this.views.add( this.uploader );
	}

} );

module.exports = ProviderPhotosBrowser;