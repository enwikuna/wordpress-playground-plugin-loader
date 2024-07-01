<?php
/**
 * Plugin Name: WordPress Playground Plugin Installer
 * Description: Helps to install a plugin on the WordPress Playground.
 * Version: 1.0.0
 * Author: Enwikuna
 * Author URI: https://agency.enwikuna.de/en/
 */

register_activation_hook( __FILE__, 'install' );
function install() {
    $password = '<PASSWORD>';
    $plugin   = '<PRODUCT>';
    $zipPath  = '/tmp/' . $plugin . '.zip';

    unzip( $zipPath, '/wordpress/wp-content/plugins/', $password );
    unlink( $zipPath );
    delete_plugins( array( plugin_basename( __FILE__ ) ) );
}

function unzip( $zipPath, $toPath, $password ) {
    $zip = new ZipArchive;
    $res = $zip->open( $zipPath );

    if ( $res === true ) {
        $salt     = md5( ABSPATH . DB_NAME );
        $iv       = substr( $salt, 0, 16 );
        $key      = substr( $salt, 0, 32 );
        $password = openssl_decrypt( hex2bin( $password ), 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv );

        $zip->setPassword( $password );
        $zip->extractTo( $toPath );
        $zip->close();
    }
}
