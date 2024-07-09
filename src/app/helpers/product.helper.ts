export function isProductSupported(product: string, isFree: boolean = false): boolean {
  let supportedProducts: string[];

  console.log(
    "isFree",
    isFree,
    process.env.FREE_PRODUCTS,
    process.env.FREE_PRODUCTS_BASE_PATH,
    process.env.PROTECTED_PRODUCTS,
    process.env.PROTECTED_PRODUCTS_BASE_PATH
  );
  if (isFree) {
    supportedProducts = process.env.FREE_PRODUCTS ? process.env.FREE_PRODUCTS.split(',') : [];
  } else {
    supportedProducts = process.env.PROTECTED_PRODUCTS ? process.env.PROTECTED_PRODUCTS.split(',') : [];
  }

  return !(supportedProducts.length === 0 || !supportedProducts.includes(product));
}

export function getProductFilePath(product: string, isFree: boolean = false): string {
  let basePath: string;

  if (isFree) {
    basePath = process.env.FREE_PRODUCTS_BASE_PATH || '';
  } else {
    basePath = process.env.PROTECTED_PRODUCTS_BASE_PATH || '';
  }

  return `${basePath.replace(/\/$/, '')}/${product}.zip`;
}
