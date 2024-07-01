import express, { Router } from 'express';
import { v4 as uuid4 } from 'uuid';
import { DownloadToken } from '../models/token.model';
import { RedisController } from '../controllers/redis.controller';
import { isProductSupported } from '../helpers/product.helper';

const router: Router = express.Router();
const redisController: RedisController = new RedisController();

router.get('/:product', async (req, res) => {
  const product: string = req.params.product;

  if (!isProductSupported(product)) {
    return res.status(400).send(`Unsupported product: ${product}`);
  }

  const uuid: string = uuid4();
  const downloadToken: DownloadToken = new DownloadToken(uuid, product);

  try {
    await redisController.setToken(downloadToken);

    res.status(200).send(downloadToken.token);
  } catch (error) {
    res.status(500).send(`Error storing token: ${error}`);
  }
});

export const tokenRouter: Router = router;
