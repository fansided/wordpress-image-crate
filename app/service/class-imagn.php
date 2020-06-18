<?php

namespace ImageCrate\Service;

/**
 * Class Imagn
 *
 * @package ImageCrate\Service
 */
class Imagn {

	/**
	 * API base URL
	 *
	 * @var string
	 */
	private $api_url;

	/**
	 * API key
	 *
	 * @var string
	 */
	private $api_key;

	/**
	 * API secret key
	 *
	 * @var string
	 */
	private $api_secret;

	/**
	 * API OAuth2 token
	 *
	 * @var string
	 */
	private $api_token;

	/**
	 * If site has premium access.
	 *
	 * @var string
	 */
	private $access_type;

	public function __construct() {

//		if ( defined( 'IMAGN_API_KEY' ) ) {
//			$this->api_key = IMAGN_API_KEY;
//		}
//
//		if ( defined( 'IMAGN_CLIENT_SECRET' ) ) {
//			$this->api_secret = IMAGN_CLIENT_SECRET;
//		}

		$this->api_url = 'https://imagn.com';

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

		// Only make an API request if a search term has been set.
		if ( empty( $search_term ) ) {
			return [];
		}

		$request_url = "{$this->api_url}/rest/search/" .
//		               "?file_types=jpg" .
//		               "?offset={$page}" .
		               "?limit={$posts_per_page}" .
		               "&terms={$search_term}";
//		               "&sort_order=newest" .
//		               "&product_types={$this->access_type}" .
//		               "&fields=detail_set,largest_downloads,max_dimensions,date_submitted";

		$request_url = str_replace( ' ', '%20', $request_url );

		$response = wp_remote_get(
			$request_url,
			[
				'timeout'       => 10,
				'headers'       => [
//					'Api-Key'       => "$this->api_key",
					'Authorization' => "Bearer $this->api_token",
				],
				'wp-rest-cache' => 'exclude',
			]
		);

		$response_code = wp_remote_retrieve_response_code( $response );

		if ( is_wp_error( $response ) ) {
			return wp_send_json_error( $response->get_error_message(), 500 );
		}

		try {
			if ( $response_code != '200' ) {
				throw new \Exception(
					"{$response_code} response from Imagn API - Request URL: {$request_url}"
				);
			}
		} catch ( \Exception $e ) {
			if ( function_exists( 'newrelic_notice_error' ) ) {
				newrelic_notice_error( $e );
			}
			error_log( $e );
		}

		$results = json_decode( $response['body'], true );

		// If there are no image results return nothing
		if ( ! isset( $results['response']['payload'] ) ) {
			return [];
		}

		$results = $results['response']['payload']['results']['item'];
//		$results = $results['item'];

		$images = [];

		foreach ( $results as $image ) {
			$images[] = [
				'id'          => $image[0]['imgId'],
				'title'       => $image[0]['headline'],
				'filename'    => $image[0]['headline'],
				'caption'     => $image[0]['caption'],
				'description' => $image[0]['caption'],
				'type'        => 'image',
				'sizes'       => [
					'thumbnail' => [
						'url'    => $image[0]['thumbUrl'],
						'width'  => '250',
						'height' => '250',
					],
				],
				'url'         => $image[0]['fullUrl'],
				'max_width'   => $image[0]['width'],
				'max_height'  => $image[0]['height'],
				'date'        => strtotime( $image[0]['dateCreate'] )
			];
		}

		return $images;
	}

	/**
	 * Get image download link for single image
	 *
	 * @param string $imgId
	 *
	 * @return string
	 */
	public function download_single( $imgId ) {

	    return 'https://imagn.com/rest/download/?imageID=' . $imgId;
//
//	    $request_url = $download_url .
//                       "?auto_download=false" .
//                       "&product_type={$this->access_type}";
//

//		$response = wp_remote_get(
//            $request_url,
//			[
//				'timeout'       => 10,
//				'headers'       => [
////					'Api-Key'       => "$this->api_key",
//					'Authorization' => "Bearer $this->api_token",
//				],
//				'wp-rest-cache' => 'exclude',
//			]
//		);
//
//		$response_code = wp_remote_retrieve_response_code( $response );
//
//		if ( is_wp_error( $response ) ) {
//			return wp_send_json_error( $response->get_error_message(), 500 );
//		}
//
//		try {
//			if ( $response_code != '200' ) {
//				throw new \Exception(
//					"Error requesting single download from Imagn API." .
//					"Response code: {$response_code} - Request URL: {$request_url}"
//				);
//			}
//		} catch ( \Exception $e ) {
//			if ( function_exists( 'newrelic_notice_error' ) ) {
//				newrelic_notice_error( $e );
//			}
//			error_log( $e );
//		}
//
//		$results = json_decode( $response['body'], true );
//
//		return $results['uri'];
	}

	/**
	 * Get OAuth2 token from Getty Images
	 */
	private function get_access_token() {
//		$response = wp_remote_post(
//			"{$this->api_url}/oauth2/token",
//			[
//				'method'        => 'POST',
//				'timeout'       => 5,
//				'headers'       => [ 'Content-Type: application/x-www-form-urlencoded' ],
//				'wp-rest-cache' => 'exclude',
//				'body'          => [
//					'grant_type'    => 'client_credentials',
//					'client_id'     => $this->api_key,
//					'client_secret' => $this->api_secret,
//				],
//			]
//		);
//
//		$response_code = wp_remote_retrieve_response_code( $response );
//
//		if ( is_wp_error( $response ) ) {
//			return wp_send_json_error( $response->get_error_message(), 500 );
//		}
//
//		try {
//			if ( $response_code != '200' ) {
//				throw new \Exception(
//					"Error getting access token from Imagn API. Response code: {$response_code}"
//				);
//			}
//		} catch ( \Exception $e ) {
//			if ( function_exists( 'newrelic_notice_error' ) ) {
//				newrelic_notice_error( $e );
//			}
//			error_log( $e );
//		}
//
//		$body = json_decode( $response['body'], true );
//
//		$this->api_token = $body['access_token'];
        $this->api_token = 'ad7828416dc69b4713e83bdad8805724fcbbf580';
	}
}