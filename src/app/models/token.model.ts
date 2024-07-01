export class DownloadToken {
  private readonly _token: string;
  private readonly _product: string;

  constructor(token: string, product: string) {
    this._token = token;
    this._product = product;
  }

  get token(): string {
    return this._token;
  }

  get product(): string {
    return this._product;
  }

  toJSON(): string {
    return JSON.stringify({
      _token: this._token,
      _product: this._product,
    });
  }

  static fromJSON(json: any): DownloadToken {
    const parsedJson = JSON.parse(json);

    return new DownloadToken(parsedJson._token, parsedJson._product);
  }
}
