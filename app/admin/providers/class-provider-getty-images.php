<?php

namespace ImageCrate\Admin\Providers;


class Provider_Getty_Images extends Provider {

	private $hello;

	function __construct( $hello ) {

		$this->hello = $hello;
	}

	function getHello() {
		return $this->hello;
	}


	/**
	 * Retrieve image data from provider.
	 *
	 * @return mixed
	 */
	function fetch() {
		// TODO: Implement fetch() method.
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