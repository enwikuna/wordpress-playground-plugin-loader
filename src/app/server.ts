import express, { Express } from 'express';
import "dotenv/config";
import bodyParser from 'body-parser';
import cors from 'cors';
import { serverRouter } from './routes/server.router';

export class Server {
  private server: Express;

  constructor() {
    this.server = express();
    this.server.use(express.static("public"));
    this.server.set('host', process.env.SERVER_HOST || 'localhost');
    this.server.set('port', process.env.SERVER_PORT || 3000);
    this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({ extended: true }));
    this.server.use(cors());
    this.server.use(serverRouter);
  }

  public start(): void {
    const host: string = this.server.get('host');
    const port: number = this.server.get('port');

    this.server.listen(port, host, () => {
      console.log(`Server started at ${host}:${port}`);
    });
  }
}
