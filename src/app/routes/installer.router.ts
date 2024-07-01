import express, { Router } from 'express';
import { RedisController } from '../controllers/redis.controller';
import { isProductSupported } from '../helpers/product.helper';
import { Password } from '../models/password.model';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

const router: Router = express.Router();
const redisController: RedisController = new RedisController();

router.get('/:product/:token', async (req, res) => {
  const product: string = req.params.product;
  const token: string = req.params.token;

  if (!isProductSupported(product)) {
    return res.status(400).send(`Unsupported product: ${product}`);
  }

  try {
    const password: Password | null = await redisController.getPassword(token);

    if (!password) {
      return res.status(500).send(`No password found for: ${token}`);
    }

    if (password.product !== product) {
      return res.status(403).send(`Invalid password for product: ${product}`);
    }

    let template = fs.readFileSync(path.join(__dirname, '../templates/wordpress-playground-plugin-installer.php'), 'utf8');

    template = template.replace('<PASSWORD>', password.password);
    template = template.replace('<PRODUCT>', product);

    const archive = archiver.create('zip', {
      zlib: { level: 8 },
    });

    archive.append(template, { name: 'wordpress-playground-plugin-installer/wordpress-playground-plugin-installer.php' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=wordpress-playground-plugin-installer.zip`);

    archive.pipe(res);

    await redisController.deleteByToken(password.token);
    await archive.finalize();
  } catch (error) {
    res.status(500).send(`Error storing token: ${error}`);
  }
});

export const installerRouter: Router = router;
