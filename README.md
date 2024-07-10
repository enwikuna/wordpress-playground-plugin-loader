# WordPress Playgrund Plugin Downloader

Contributors: Johannes F. Gmelin\
Stable tag: 1.0.0\
License: GPLv3\
License URI: https://www.gnu.org/licenses/gpl-3.0.html

## Description

This service is a Node.js service which runs on a server providing an endpoint which can be used inside a WordPress Playground Blueprint to securely download a plugin from a protected folder on the server e.g. to provide
a plugin demo.

If you need help with the implementation, feel free do contact us on agency.enwikuna.de, and we will help you!

## Features

- Token generation
- Download of products

## Development

### Requirements

- Node.js
- npm
- Docker

### Installation

To install the project run the following command:

```bash
npm install
```

### Testing

To test the server create a `.env` file in the root directory of the project and add the following content:

```bash
FREE_PRODUCTS=free
FREE_PRODUCTS_BASE_PATH=/free.zip
PROTECTED_PRODUCTS=protected
PROTECTED_PRODUCTS_BASE_PATH=/protected.zip
```

Then run the following command:

```bash
npm run dev
```

This will start the server on `http://localhost:3000`.