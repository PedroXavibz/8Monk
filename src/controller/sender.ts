import WAWebJS, { Client } from 'whatsapp-web.js';
import Env from '../utils/env-var';
import Sticker from './sticker';
import Media from './media';

class Sender {
  private sticker: Sticker;
  private media: Media;

  constructor(client: Client) {
    this.sticker = new Sticker(client);
    this.media = new Media(client);
  }

  public async sendSticker(message: WAWebJS.Message) {
    const sender = this.getSender(message);

    if (!Env.allowedGroups.includes(sender)) return;

    switch (message.type) {
      case 'video':
        this.sticker.gifToSticker(sender, message);
        break;

      case 'image':
        this.sticker.imageToSticker(sender, message);
        break;

      case 'chat':
        this.sticker.urlToSticker(sender, message);
        break;

      default:
        break;
    }
  }

  public async sendMedia(message: WAWebJS.Message) {
    const sender = this.getSender(message);
    if (!Env.allowedGroups.includes(sender)) return;

    try {
      const url = message.body.split(' ')[1];
      const { hostname } = new URL(url);

      switch (hostname) {
        case 'www.instagram.com':
          await this.media.ig(url, sender, message);
          break;

        case 'www.tiktok.com':
        case 'vm.tiktok.com':
          await this.media.tk(url, sender, message);
          break;

        case 'twitter.com':
        case 'x.com':
          await this.media.x(url, sender, message);
          break;

        default:
          message.reply('*Ainda não implementado*');
          break;
      }
    } catch (e) {
      message.reply('*Isso não é um link, corno*');
    }
  }

  public sendMessage(message: WAWebJS.Message): void {
    const sender = this.getSender(message);
    if (!Env.allowedGroups.includes(sender)) return;
    message.reply('🐒🍌 *Pong*');
  }

  private getSender(message: WAWebJS.Message): string {
    return message.from.includes(Env.userPhone) ? message.to : message.from;
  }
}

export default Sender;
