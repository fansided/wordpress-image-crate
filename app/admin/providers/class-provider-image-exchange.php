<?php

namespace ImageCrate\Admin\Providers;


class Provider_Image_Exchange extends Provider {

	/**
	 * The provider name
	 */
	const PROVIDER = 'image_exchange';

	/**
	 * If image provider should be tracked.
	 */
	const TRACKING = false;

	/**
	 * The directory images will be saved to.
	 */
	const CUSTOM_DIRECTORY = 'image-exchange';

	/**
	 * Retrieve image data from provider.
	 *
	 * @return mixed
	 */
	function fetch( $query ) {
		// TODO: Implement fetch() method.
	}

	/**
	 * Download the selected image
	 *
	 * @return mixed
	 */
	function download( $query ) {
		// TODO: Implement download() method.
	}

	/**
	 * Manipulate results to format WordPress expects
	 *
	 * @return mixed
	 */
	function prepare_for_collection() {
		// TODO: Implement prepare_for_collection() method.
	}

}