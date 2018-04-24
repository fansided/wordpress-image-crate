<?php

namespace ImageCrate\Admin;

/**
 * Class Usage_Tracking
 * @package ImageCrate\Admin
 */
class Usage_Tracking {

	/**
	 * Image crate provider class names
	 */
	const PROVIDER_CLASS_LIST = [
		'Provider_Getty_Images',
		'Provider_Image_Exchange'
	];

	/**
	 * Array of provider
	 *
	 * @var array
	 */
	private $providers = [];

	/**
	 * The current site ID
	 *
	 * @var string
	 */
	private $current_site_id;

	/**
	 * Track image usage
	 *
	 * @param $post_id
	 * @param $post
	 */
	public function track( $post_id, $post ) {

		$current_post_type   = get_post_type( $post_id );
		$post_types_to_track = [ 'post', 'list', 'page' ];

		if ( $post->post_status !== 'publish' || ! in_array( $current_post_type, $post_types_to_track ) ) {
			return;
		}

		$this->current_site_id = get_current_blog_id();

		$this->providers_to_track();

		$image_occurrences = $this->image_occurrences( $post->post_content );

		$this->update_attachments_meta( $post_id, $image_occurrences );

	}

	/**
	 * Get the providers that require tracking
	 *
	 * @return array
	 */
	private function providers_to_track() {
		$providers_to_track = [];

		foreach ( self::PROVIDER_CLASS_LIST as $provider ) {
			$fqcn = "\\ImageCrate\\Admin\\Providers\\{$provider}";

			if ( ! $fqcn::TRACKING ) {
				continue;
			}

			$providers_to_track[ $fqcn::CUSTOM_DIRECTORY ] = $fqcn::PROVIDER;
		}

		$this->providers = $providers_to_track;
	}

	/**
	 * Find uses of provider images in content HTML.
	 *
	 * @param string $content The post content
	 *
	 * @return array
	 */
	private function image_occurrences( $content ) {

		$providers_dirs = array_keys( $this->providers );

		$search_pattern = '/' . implode( '|', $providers_dirs ) . '/';

		$dom = new \DOMDocument();
		@$dom->loadHTML( mb_convert_encoding( $content, 'HTML-ENTITIES', 'UTF-8' ) );

		// make sure to only grab the image elements
		foreach ( $dom->getElementsByTagName( 'img' ) as $node ) {
			$src = $node->getAttribute( 'src' );

			preg_match( $search_pattern, $src, $provider_found );

			if ( isset( $provider_found[0] ) ) {
				preg_match( '/(\/' . $provider_found[0] . '\/)(\d+\/)(\d+\/)(\d+)/', $src, $filename );

				// outputs array, format: [ 'name' => 74564352, 'provider' => 'getty-images' ]
				$filenames[] = [ 'name' => $filename[4], 'provider' => $provider_found[0] ];
			}
		}

		if ( ! isset( $filenames ) ) {
			return [];
		}

		// Make sure duplicate file names are removed before sending
		return array_intersect_key( $filenames, array_unique( array_map( 'serialize', $filenames ) ) );

	}

	/**
	 * Update the post meta for each attachment
	 *
	 * @param string $post_id
	 * @param array  $image_occurrences
	 */
	private function update_attachments_meta( $post_id, array $image_occurrences ) {

		$master_site     = get_current_site();
		$current_site_id = $this->current_site_id;

		switch_to_blog( $master_site->id );

		$image_occurrences = $this->get_attachments( $image_occurrences );

		foreach ( $image_occurrences as $image_occurrence ) {
			$this->increment_attachment_meta( $post_id, $image_occurrence );
		}

		switch_to_blog( $current_site_id );

	}

	/**
	 * Gets the image attachments IDs from master site
	 *
	 * Must be executed inside switch_to_blog()
	 *
	 * @param array $image_occurrences
	 *
	 * @return array
	 */
	private function get_attachments( array $image_occurrences ) {

		global $wpdb;

		$post_names = array_map( function ( $occurrence ) {
			return $occurrence['name'];
		}, $image_occurrences );

		$in_str_arr = array_fill( 0, count( $post_names ), '%s' );
		$in_str     = implode( ',', $in_str_arr );

		$attachment_results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_name FROM $wpdb->posts WHERE post_name IN ( $in_str );",
				$post_names
			),
			ARRAY_A
		);

		// Index attachments by post_name
		$attachments = [];
		foreach ( $attachment_results as $attachment ) {
			$attachments[ $attachment['post_name'] ] = $attachment;
		}

		// Add post ID to the $image_occurrences array
		return array_map( function ( $occurrence ) use ( $attachments ) {
			if ( isset( $attachments[ $occurrence['name'] ] ) ) {
				return $occurrence = [
					'name'          => $occurrence['name'],
					'provider'      => $occurrence['provider'],
					'attachment_id' => $attachments[ $occurrence['name'] ]['ID'],
				];
			}

			return null;
		}, $image_occurrences );

	}

	/**
	 * Increment image usage in post_meta
	 *
	 * Must be executed inside switch_to_blog()
	 *
	 * @param $post_id
	 * @param $image_occurrence
	 */
	private function increment_attachment_meta( $post_id, $image_occurrence ) {

		if ( empty( $image_occurrence ) ) {
			return;
		}

		$provider      = $this->providers[ $image_occurrence['provider'] ];
		$attachment_id = $image_occurrence['attachment_id'];

		$usage = get_post_meta( $attachment_id, "{$provider}_usage", true );
		$usage = $this->transform_legacy_getty_tracking( $usage );

		// Increment attached amount
		$usage['attached_amount'] = intval( $usage['attached_amount'] ) + 1;

		// Add post ID to attached_to_posts

		// Meta format: siteID_postID
		$attached_meta = $this->current_site_id . '_' . $post_id;
		if ( ! in_array( $attached_meta, $usage['attached_to_posts'] ) ) {
			array_push( $usage['attached_to_posts'], $attached_meta );
		}

		update_post_meta( $attachment_id, "{$provider}_usage", $usage );

	}

	/**
	 * Transforms forms the legacy getty images tracking to new data format.
	 *
	 * @param array $usage The existing meta data.
	 *
	 * @return array
	 */
	private function transform_legacy_getty_tracking( array $usage ) {

		if ( isset( $usage['api_hit_amount'] ) ) {
			return $usage;
		}

		$usage_count = [
			'api_hit_amount'    => ( $usage['getty_api_hit_amount'] ? $usage['getty_api_hit_amount'] : 1 ),
			'attached_amount'   => ( $usage['getty_attached_amount'] ? $usage['getty_attached_amount'] : 0 ),
			'file_id'           => ( $usage['getty_file_id'] ? $usage['getty_file_id'] : '' ),
			'attached_to_posts' => ( $usage['getty_to_posts'] ? $usage['getty_to_posts'] : [] )
		];

		return $usage_count;

	}

}