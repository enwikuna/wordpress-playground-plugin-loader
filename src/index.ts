import { Server } from './app/server';

async function main() {
  try {
    const server = new Server();

    server.start();
  } catch (error) {
    return error;
  }
}

main()
  .then(() => {})
  .catch(error => console.error(`Error starting application: ${error}`));
