import express, { Router } from 'express';
import { tokenRouter } from './token.router';
import { downloadRouter } from './download.router';
import basicAuth from 'express-basic-auth';
import { installerRouter } from './installer.router';

const router: Router = express.Router();

if (process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASS) {
  const basicAuthMiddleware = basicAuth({
    users: { [process.env.BASIC_AUTH_USER]: process.env.BASIC_AUTH_PASS },
    challenge: true,
  });

  router.use('/token', basicAuthMiddleware);
}

router.use('/token', tokenRouter);
router.use('/download', downloadRouter);
router.use('/installer', installerRouter);

export const serverRouter: Router = router;
