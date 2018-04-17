<?php

namespace ImageCrate\Service;

class Getty_Images {

	private $api_url;

	private $api_key;

	private $api_secret;

	private $api_token;

	public function __construct() {

		if ( defined( 'GETTY_API_KEY' ) ) {
			$this->api_key = GETTY_API_KEY;
		}

		if ( defined( 'GETTY_CLIENT_SECRET' ) ) {
			$this->api_secret = GETTY_CLIENT_SECRET;
		}

		$this->api_url = 'https://api.gettyimages.com';

		$this->get_access_token();

	}

	/**
	 * Fetch image list from API
	 *
	 * @param string $search_term    The image search term
	 * @param int    $page           The request page number
	 * @param int    $posts_per_page The images per page
	 *
	 * @return array
	 */
	public function fetch( $search_term = '', $page = 1, $posts_per_page = 40 ) {

		$response = wp_remote_get(
			"{$this->api_url}/v3/search/images/editorial" .
			"?file_types=jpg" .
			"&page={$page}" .
			"&page_size={$posts_per_page}" .
			"&phrase={$search_term}".
			"&fields=detail_set,largest_downloads,max_dimensions",
			[
				'timeout' => 10,
				'headers' => array(
					'Api-Key'       => "$this->api_key",
					'Authorization' => "Bearer $this->api_token",
				),
			]
		);

		if ( is_wp_error( $response ) ) {
			// TODO: Add New Relic notice

			$error_code = ( ! empty( $response->get_error_code() ) ? $response->get_error_code() : 500 );
			return wp_send_json_error( $response->get_error_message(), $error_code );
		}

		$results = json_decode( $response['body'], true );

		$images = [];

		foreach ( $results['images'] as $image ) {
			$images[] = [
				'id'           => $image['id'],
				'title'        => $image['title'],
				'filename'     => $image['title'],
				'caption'      => $image['caption'],
				'description'  => '',
				'type'         => 'image',
				'sizes'        => [
					'thumbnail' => [
						'url'    => $image['display_sizes'][0]['uri'],
						'width'  => '150',
						'height' => '150',
					],
//					'full'      => array(
//						'url'    => $image['display_sizes'][0]['uri'],
//						'width'  => '268',
//						'height' => '162',
//					),
//					'large'     => array(
//						'url'    => $image['display_sizes'][0]['uri'],
//						'width'  => '3500',
//						'height' => '2329',
//					),
				],
				'url'        => $image['display_sizes'][0]['uri'],
				'max_width'  => $image['max_dimensions']['width'],
				'max_height' => $image['max_dimensions']['height'],
			];
		}

		return $images;
	}

	/**
	 * Get OAuth2 token from Getty Images
	 */
	private function get_access_token() {
		$response = wp_remote_post(
			"{$this->api_url}/oauth2/token",
			[
				'method'  => 'POST',
				'timeout' => 5,
				'headers' => [ 'Content-Type: application/x-www-form-urlencoded' ],
				'body'    => [
					'grant_type'    => 'client_credentials',
					'client_id'     => $this->api_key,
					'client_secret' => $this->api_secret,
				],
			]
		);

		if ( is_wp_error( $response ) ) {
			// TODO: Add New Relic notice

			$error_code = ( ! empty( $response->get_error_code() ) ? $response->get_error_code() : 500 );
			return wp_send_json_error( $response->get_error_message(), $error_code );
		}

		$body = json_decode( $response['body'], true );

		$this->api_token = $body['access_token'];
	}
}