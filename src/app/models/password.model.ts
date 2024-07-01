export class Password {
  private readonly _token: string;
  private readonly _product: string;
  private readonly _password: string;

  constructor(token: string, product: string, password: string) {
    this._token = token;
    this._product = product;
    this._password = password;
  }

  get token(): string {
    return this._token;
  }

  get product(): string {
    return this._product;
  }

  get password(): string {
    return this._password;
  }

  toJSON(): string {
    return JSON.stringify({
      _token: this._token,
      _product: this._product,
      _password: this._password,
    });
  }

  static fromJSON(json: any): Password {
    const parsedJson = JSON.parse(json);

    return new Password(parsedJson._token, parsedJson._product, parsedJson._password);
  }
}
