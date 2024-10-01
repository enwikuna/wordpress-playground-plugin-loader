# WordPress Playgrund Plugin Downloader

Contributors: Johannes F. Gmelin\
Author URI: https://agency.enwikuna.de\
Stable tag: 1.0.0\
License: GPLv3\
License URI: https://www.gnu.org/licenses/gpl-3.0.html

If you like this project, please consider donating to support the development of this service and other open-source projects:

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://paypal.me/enwikuna)

## Description

This service is a Node.js service which runs on a server providing an endpoint which can be used inside a WordPress Playground Blueprint to securely download a plugin from a protected folder on the server e.g. to provide
a plugin demo.

If you need help with the implementation, feel free do contact us on [agency.enwikuna.de](https://agency.enwikuna.de), and we will help you!

## Features

- Token generation
- Download of free or protected plugins
- Protected installation of plugins

## Installation

Read the installation instructions to install and set up the WordPress Playground Plugin Downloader.

### Minimum Requirements

* Ubuntu server (20.04 LTS or later is recommended)
* Node.js 17.9.1 or greater is recommended
* Apache installed and running
* Git installed
* A domain/subdomain (download.your-domain.com) pointing to your server's IP address
* OpenSSL installed (usually pre-installed on most Ubuntu systems)
* Redis installed and running

### Installation of the downloader

Note: We recommend using Plesk to create a new domain or subdomain on your server.
This way, you can easily manage the domain and SSL certificates. Also, there is a Node.js extension available for Plesk which makes it easy to manage Node.js services.
The following instructions are for a manual setup without Plesk on an Ubuntu server.

First, ensure that your server is up to date:

```bash
  sudo apt update && sudo apt upgrade -y
```

Next, create a new directory on your server for the downloader. The name of the folder should match your final target domain.
If you change the folder name, you need to use this name at any point and not `download.your-domain.com`!
You can do this by running the following command:

```bash
sudo mkdir -p /var/www/vhosts/download.your-domain.com
```

Enter the directory:

```bash
cd /var/www/vhosts/download.your-domain.com
```

Now, you need to clone the repository to get the files:

```bash
git clone https://github.com/enwikuna/wordpress-playground-plugin-loader.git .
```

After cloning the repository, you need to install the dependencies and build the service:

```bash
npm install && npm run build
```

Now, test the service by running the following command:

```bash
node dist/index.js
```

The service should start, typically on `localhost` and port `3000`. If everything works, you can stop it using `Ctrl + C` for now.
It can happen that you need to adjust the port using environment variables if port `3000` is already in use.
We will talk about this in the next steps.

After testing the service, we need to configure Apache to serve the service on the domain/subdomain you have set up. For that,
we need to create a new folder for the SSL certificate to secure our service. You can do this by running the following command:

```bash
sudo mkdir -p /etc/apache2/ssl
```

Next, generate the SSL certificates:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/apache2/ssl/downloader.key -out /etc/apache2/ssl/downloader.crt
```

Since the SSL certificates are self-signed, you will be asked to provide some information. Also, the certificate will not be fully trusted by browsers.
I recommend buying a certificate from a trusted certificate authority for production use. Also, you can use Let's Encrypt to get a free SSL certificate.

After generating the SSL certificate, you need to ensure that the Apache SSL module is enabled. You can do this by running the following command:

```bash
sudo a2enmod proxy proxy_http ssl
sudo systemctl restart apache2
```

Now we need to create a new configuration file for the service to be able to serve it via Apache:

```bash
sudo nano /etc/apache2/sites-available/download.your-domain.com.conf
```

Add the following configuration to the file:

```apache
<VirtualHost *:443>
    ServerName download.your-domain.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/downloader.crt
    SSLCertificateKeyFile /etc/apache2/ssl/downloader.key
</VirtualHost>
```

Please note that whenever you change the port of the service, you need to adjust the `ProxyPass` and `ProxyPassReverse` directives accordingly.
Otherwise, the service can not be reached.

After adding the configuration, save the file and exit the editor. Next, enable the site and restart Apache:

```bash
sudo a2ensite download.your-domain.com
sudo systemctl restart apache2
```

### Starting the downloader

When it comes to starting the downloader, it's important to know the list of environment variables you can use to configure the service:

| **Variable**                                       | **Description**                                                                                                                                                                          | **Example Value**                             |
|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `SERVER_HOST` (optional)                           | The host on which the download service should run. The default is `localhost`.                                                                                                           | `10.0.0.1`                                    |
| `SERVER_PORT` (optional)                           | The port on which the download service should run. The default is `3000`.                                                                                                                | `3100`                                        |
| `REDIS_HOST` (optional)                            | The host on which Redis runs. The default is `localhost`.                                                                                                                                | `10.0.0.1`                                    |
| `REDIS_PORT` (optional)                            | The port on which Redis runs. The default is `6379`.                                                                                                                                     | `6380`                                        |
| `BASIC_AUTH_USER` (optional)                       | The username for basic authentication in case you want to add a second security layer.                                                                                                   | `downloader`                                  |
| `BASIC_AUTH_PASS` (optional)                       | The password for basic authentication in case you want to add a second security layer. You should use a secure password here.                                                            | `keg8qkj_baj8uwt@PWZ`                         |
| `PROTECTED_PRODUCTS` (required/optional)           | Comma-separated list of protected products available for download. The names must match the names of the ZIP file placed inside the protected folder path.                               | `plugin-a,plugin-b`                           |
| `PROTECTED_PRODUCTS_BASE_PATH` (required/optional) | The directory path where protected products are stored. Put ZIP files in here which should only be downloadable by going through the token verification and secure installation process. | `/var/www/vhosts/anyfolder/plugins/protected` |
| `FREE_PRODUCTS` (required/optional)                | Comma-separated list of free products available for download.                                                                                                                            | `plugin-c`                                    |
| `FREE_PRODUCTS_BASE_PATH` (required/optional)      | The directory path where free products are stored. Put ZIP files in here which should be downloadable without any token verification and secure installation process.                    | `/var/www/vhosts/anyfolder/plugins`           |
| `TOKEN_EXPIRATION` (optional)                      | The token expiration time in seconds. This defines how long the download token generated during product download should be valid. The default is `30`.                                   | `120`                                         |
| `PASSWORD_EXPIRATION` (optional)                   | The password expiration time in seconds. The default is `120`.                                                                                                                           | `300`                                         |
| `PASSWORD_ENCRYPTION_SALT` (required)              | Salt used for password encryption. You need to set a random and strong alpha-numeric string here.                                                                                        | `28113eef17e60bd13cefca2a1b8e1369`            |

Please note that either `PROTECTED_PRODUCTS` or `FREE_PRODUCTS` must be set belong their respective `*_BASE_PATH` environment variables.
If you want to use both, you can to set both. If you set none, you've lost the purpose of the downloader and some time of your life ;-).

To start the downloader, you can use a process manager like `pm2` to keep the service running in the background.
You can install `pm2` by running the following command:

```bash
sudo npm install -g pm2
```

Start the service using `pm2`:

```bash
pm2 start index.js --name "wp-playground-plugin-downloader" --env production -- \
  --BASIC_AUTH_USER=downloader \
  --BASIC_AUTH_PASS=keg8qkj_baj8uwt@PWZ \
  --PROTECTED_PRODUCTS=plugin-a,plugin-b \
  --PROTECTED_PRODUCTS_BASE_PATH=/var/www/vhosts/anyfolder/plugins/protected \
  --FREE_PRODUCTS=plugin-c \
  --FREE_PRODUCTS_BASE_PATH=/var/www/vhosts/anyfolder/plugins \
  --PASSWORD_ENCRYPTION_SALT=28113eef17e60bd13cefca2a1b8e1369
```

You should also enable `pm2` to start the service on system boot:

```bash
pm2 startup systemd
```

To stop the service, you can use the following command:

```bash
pm2 stop wp-playground-plugin-downloader
```

To restart the service, you can use the following command:

```bash
pm2 restart wp-playground-plugin-downloader
```

### Using the service inside WordPress Playground Blueprints

Congratulations! You have successfully set up the WordPress Playground Plugin Downloader.
Now you can use it inside your WordPress Playground Blueprints to download plugins securely.

At this point we consider that you have already set up a WordPress Playground Blueprint and know how to use it.
You can find more information about WordPress Playground Blueprints in the [official documentation](https://wordpress.github.io/wordpress-playground/developers/apis/).

For the next steps we assume that you have a file inside the protected folder path `/var/www/vhosts/anyfolder/plugins/protected` named `protected.zip` and a file inside the free folder path
`/var/www/vhosts/anyfolder/plugins` named `free.zip`. The goal is to use the downloader to download the free and protected plugin.

To build our blueprint, we build a simple PHP script running on a WordPress page:

```php
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
```

The above PHP script creates a blueprint which downloads the free plugin and the protected plugin.
The function `get_blueprint` returns the blueprint as a JSON string. You can use that JSON to pass it to the WordPress Playground API to create a new playground.

The function `get_steps` returns the steps for the blueprint. The function `get_download_token` is used to get a download token for the protected plugin.

**The basic idea is:**

1) The first protected step downloads the protected plugin file to the WordPress Playground virtual file system using a generated token. At the time of download, the download server encrypts the ZIP file with a generated
   token. This means, that the ZIP file is downloaded but can not be used outside the WordPress Playground without knowing the token to decrypt the ZIP file.
2) The next step downloads a little generated helper plugin by using the same token. The plugin includes all required information to decrypt the ZIP file and copying the decrypted ZIP file to the plugins directory of
   the WordPress Playground.
3) Since the ZIP file is packed multiples times, the next step unpacks the no longer encrypted ZIP file to the plugins directory.
4) The last step installs the plugin by using the unpacked ZIP file which includes a ZIP file with the final plugin.

I know this seems to be very complex but it's the only way to securely download and install a plugin in a WordPress Playground without exposing the plugin to the public. We gave the best to make it as easy as possible.
Also, we put the downloader to a test by letting very good programmers try to break it. They've spent some hours to understand and break it at the end. So, we are confident that the downloader is secure. If there is
someone who really wants to spend a lot of time to break it, they can - in our eyes - keep the plugin. At the end you should not forget that the WordPress Playground is still running inside the browser of your potential
customer and not on your server. So at the end, the binary file system can also be broken by a good programmer and the plugin can be extracted. But this is not the goal of the downloader. The goal is to make it as hard
as possible to a semi-good programmer to extract the plugin.

If you have any questions or need help with the implementation, feel free to contact us on [agency.enwikuna.de](https://agency.enwikuna.de). If you want to contribute to the project, feel free to create a pull request.
