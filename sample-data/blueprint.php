<?php

/**
 * Returns the blueprint
 *
 * @return string
 */
function get_blueprint(): string {
	$blueprint = array(
		'preferredVersions' => array(
			'php' => '8.0',
			'wp'  => '6.5',
		),
		'steps'             => get_steps(),
	);

	return 'const blueprint = ' . json_encode( $blueprint, JSON_UNESCAPED_SLASHES ) . ';';
}

/**
 * Returns the steps for the blueprint
 *
 * @return array
 */
function get_steps(): array {
	$steps = array(
		array(
			'step'     => 'login',
			'username' => 'admin',
			'password' => 'password',
		),
		array(
			'step'          => 'installPlugin',
			'pluginZipFile' => array(
				'resource' => 'url',
				'url'      => 'https://download.your-domain.com/download/free/',
			),
			'options'       => array(
				'activate' => true,
			),
		),
		array(
			'step'   => 'defineWpConfigConsts',
			'consts' => array(
				'DISALLOW_FILE_EDIT' => true,
			),
		),
	);

	$download_token = get_download_token( 'protected' );

	if ( ! empty( $download_token ) ) {
		$protected_steps = array(
			array(
				'step' => 'writeFile',
				'path' => '/tmp/protected.zip',
				'data' => array(
					'resource' => 'url',
					'url'      => 'https://download.your-domain.com/download/protected/' . $download_token,
					'caption'  => 'Downloading Protected',
				),
			),
			array(
				'step'          => 'installPlugin',
				'pluginZipFile' => array(
					'resource' => 'url',
					'url'      => 'https://download.your-domain.com/installer/protected/' . $download_token,
				),
				'options'       => array(
					'activate' => true,
				),
			),
            array(
                'step'          => 'unzip',
                'zipFile'       => array(
                    'resource' => 'vfs',
                    'path'     => '/wordpress/wp-content/plugins/protected.zip',
                ),
                'extractToPath' => '/wordpress/wp-content/plugins',
            ),
			array(
				'step'          => 'installPlugin',
				'pluginZipFile' => array(
					'resource' => 'vfs',
					'path'     => '/wordpress/wp-content/plugins/protected.zip',
				),
				'options'       => array(
					'activate' => true,
				),
			),
		);

		$steps = wp_parse_args( $protected_steps, $steps );
	}

	return $steps;
}

/**
 * Returns a download token for the given product
 *
 * @param string $product
 *
 * @return string|null
 */
function get_download_token( string $product ): ?string {
	$response = wp_remote_get(
		'https://download.your-domain.com/token/' . $product,
		array(
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'downloader:keg8qkj_baj8uwt@PWZ' ),
			),
		)
	);

	if ( ! is_wp_error( $response ) ) {
		return wp_remote_retrieve_body( $response );
	}

	return null;
}
