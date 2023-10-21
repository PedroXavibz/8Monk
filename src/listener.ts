import { Client } from 'whatsapp-web.js';
import Qrcode from 'qrcode-terminal';

import Sender from './controller/sender';

export default function startClient(sender: Sender, client: Client, { start = false }) {
  client.on('qr', qr => {
    Qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('Client is ready!');
  });

  client.on('message_create', async message => {
    const command = message.body.split(' ')[0];

    switch (command) {
      case '/sticker':
        await sender.sendSticker(message);
        break;

      case '/show':
        await sender.sendMedia(message);
        break;

      case '!ping':
        sender.sendMessage(message);
        break;
    }
  });

  start && client.initialize();
}
