import dotenv from 'dotenv';
import { Client, LocalAuth } from 'whatsapp-web.js';

dotenv.config();
import Env from './utils/env-var';
import Sender from './controller/sender';
import startClient from './listener';

const client = new Client({
  puppeteer: {
    executablePath: Env.chromeLocation
  },
  authStrategy: new LocalAuth()
});

const sender = new Sender(client);

startClient(sender, client, { start: true });
