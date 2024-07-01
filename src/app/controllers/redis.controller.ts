import { createClient, RedisClientType } from 'redis';
import { DownloadToken } from '../models/token.model';
import { Password } from '../models/password.model';

export class RedisController {
  private readonly client: RedisClientType;
  private readonly tokenExpiration: number = Number(process.env.TOKEN_EXPIRATION) || 30;
  private readonly passwordExpiration: number = Number(process.env.PASSWORD_EXPIRATION) || 120;

  constructor() {
    const host: string = process.env.REDIS_HOST || 'localhost';
    const port: number = Number(process.env.REDIS_PORT) || 6379;

    this.client = createClient({
      url: `redis://${host}:${port}`,
    });
  }

  async setToken(downloadToken: DownloadToken): Promise<void> {
    try {
      await this.client.connect();
      await this.client.set(downloadToken.token, downloadToken.toJSON(), {
        EX: this.tokenExpiration,
      });
      await this.client.disconnect();
    } catch (error) {
      throw new Error(`Error setting token in Redis: ${error}`);
    }
  }

  async setPassword(password: Password): Promise<void> {
    try {
      await this.client.connect();
      await this.client.set(password.token, password.toJSON(), {
        EX: this.passwordExpiration,
      });
      await this.client.disconnect();
    } catch (error) {
      throw new Error(`Error setting password in Redis: ${error}`);
    }
  }

  async getToken(token: string): Promise<DownloadToken | null> {
    try {
      await this.client.connect();
      const tokenString = await this.client.get(token);
      await this.client.disconnect();

      if (!tokenString) {
        return null;
      }

      return DownloadToken.fromJSON(tokenString);
    } catch (error) {
      throw new Error(`Error getting token from Redis: ${error}`);
    }
  }

  async getPassword(token: string): Promise<Password | null> {
    try {
      await this.client.connect();
      const tokenString = await this.client.get(token);
      await this.client.disconnect();

      if (!tokenString) {
        return null;
      }

      return Password.fromJSON(tokenString);
    } catch (error) {
      throw new Error(`Error getting password from Redis: ${error}`);
    }
  }

  async deleteByToken(token: string): Promise<void> {
    try {
      await this.client.connect();
      await this.client.del(token);
      await this.client.disconnect();
    } catch (error) {
      throw new Error(`Error deleting by token from Redis: ${error}`);
    }
  }
}
