import { Client } from 'whatsapp-web.js';
import Qrcode from 'qrcode-terminal';

import Sender from './controller/sender';
import Env from './utils/env-var';

export default function startClient(sender: Sender, client: Client, { start = false }) {
  client.on('qr', qr => {
    Qrcode.generate(qr, { small: true });
  });

  client.on('ready', async () => {
    console.log('Client is ready!');
    await client.sendMessage(Env.allowedGroups[0], '*Tô on papai, equeça tudo*');
  });

  client.on('message_create', async message => {
    const command = message.body.split(' ')[0];

    switch (command) {
      case '!ping':
        sender.sendMessage(message);
        break;

      case '/sticker':
        await sender.sendSticker(message);
        break;

      case '/show':
        await sender.sendMedia(message);
        break;

      case '/sala':
        sender.sendGradeInfo(message);
        break;

      case '/hj':
        sender.sendClassGrade(message);
        break;
      case '!hj':
        sender.updateClassGrade(message);
        break;
    }
  });

  start && client.initialize();
}
