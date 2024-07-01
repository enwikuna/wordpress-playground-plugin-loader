import express, { Router } from 'express';
import { isProductSupported, getProductFilePath } from '../helpers/product.helper';
import { RedisController } from '../controllers/redis.controller';
import { DownloadToken } from '../models/token.model';
import { Password } from '../models/password.model';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import archiver from 'archiver';

const router: Router = express.Router();
const redisController: RedisController = new RedisController();

archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));

router.get('/:product/:token', async (req, res) => {
  const product: string = req.params.product;
  const token: string = req.params.token;

  if (!isProductSupported(product)) {
    return res.status(400).send(`Unsupported product: ${product}`);
  }

  try {
    const downloadToken: DownloadToken | null = await redisController.getToken(token);

    if (!downloadToken) {
      return res.status(500).send(`No token found for: ${token}`);
    }

    if (downloadToken.product !== product) {
      return res.status(403).send(`Invalid token for product: ${product}`);
    }

    const filePath = getProductFilePath(product);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    const filename = path.basename(filePath);

    if (!filename) {
      return res.status(500).send('Error getting filename');
    }

    let filePassword = crypto.randomBytes(32).toString('hex');

    let archive = archiver.create('zip-encrypted', {
      zlib: { level: 8 },
      // @ts-ignore
      encryptionMethod: 'zip20',
      password: filePassword,
    });

    archive.file(filePath, { name: filename });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    archive.pipe(res);

    if (process.env.PASSWORD_ENCRYPTION_SALT) {
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.PASSWORD_ENCRYPTION_SALT), Buffer.from(process.env.PASSWORD_ENCRYPTION_SALT.slice(0, 16)));
      let encrypted = cipher.update(filePassword, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      filePassword = encrypted;
    }

    const password: Password = new Password(token, product, filePassword);

    await redisController.deleteByToken(downloadToken.token);
    await redisController.setPassword(password);
    await archive.finalize();
  } catch (error) {
    res.status(500).send(`${error}`);
  }
});

router.get('/:product', async (req, res) => {
  const product: string = req.params.product;

  if (!isProductSupported(product, true)) {
    return res.status(400).send(`Unsupported product: ${product}`);
  }

  const filePath = getProductFilePath(product, true);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.download(filePath);
});

export const downloadRouter: Router = router;
