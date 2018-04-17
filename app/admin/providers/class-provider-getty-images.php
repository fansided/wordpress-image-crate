<?php

namespace ImageCrate\Admin\Providers;


use ImageCrate\Service\Getty_Images;

class Provider_Getty_Images extends Provider {

	private $service;

	public function __construct() {
		$this->service = new Getty_Images();
	}

	/**
	 * Retrieve image data from provider.
	 *
	 * @return mixed
	 */
	function fetch( $query ) {

		$search_term    = ( ! empty ( $query['search'] ) ? $query['search'] : '' );
		$paged          = ( ! empty ( $query['paged'] ) ? intval( $query['paged'] ) : 1 );
		$posts_per_page = ( ! empty ( $query['posts_per_page'] ) ? intval( $query['posts_per_page'] ) : 40 );

		$images = $this->service->fetch( $search_term, $paged, $posts_per_page );

		return $images;
	}

	/**
	 * Download the selected image
	 *
	 * @return mixed
	 */
	function download() {
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