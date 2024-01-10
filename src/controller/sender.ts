import WAWebJS, { Client } from 'whatsapp-web.js';
import Env from '../utils/env-var';
import Sticker from './sticker';
import Media from './media';
import Grade from './grade';

class Sender {
  private sticker: Sticker;
  private media: Media;
  private grade: Grade;

  constructor(client: Client) {
    this.media = new Media(client);
    this.sticker = new Sticker(client, this.media);
    this.grade = new Grade();
  }

  private getSender(message: WAWebJS.Message): string {
    return message.from.includes(Env.userPhone) ? message.to : message.from;
  }

  public async sendSticker(message: WAWebJS.Message) {
    const sender = this.getSender(message);
    if (!Env.allowedGroups.includes(sender)) return;

    if (message.hasQuotedMsg)
      message = await message.getQuotedMessage();

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

    if (message.hasQuotedMsg)
      message = await message.getQuotedMessage();

    try {
      const url = message.body.split(' ')[1];
      const { hostname } = new URL(url);

      switch (hostname) {
        case 'www.instagram.com':
          try {
            const post = await this.media.getPostIg(url);
            this.media.handlePostAttachement(post, sender, message);
          } catch (e) {
            console.error(e);
            message.reply('*Não foi possível manipular URL desse post [IG]*');
          }
          break;

        case 'www.tiktok.com':
        case 'vm.tiktok.com':
          try {
            const post = await this.media.getPostTk(url);
            this.media.handlePostAttachement(post, sender, message);
          } catch (e) {
            console.error(e);
            message.reply('*Não foi possível manipular URL desse post [Tk]*');
          }
          break;

        case 'twitter.com':
        case 'x.com':
          try {
            const post = await this.media.getPostX(url);
            this.media.handlePostAttachement(post, sender, message);
          } catch (e) {
            console.error(e);
            message.reply('*Não foi possível manipular URL desse post [X]*');
          }
          break;

        default:
          message.reply('*Ainda não implementado, meu pau te quer sentado*');
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

  public sendGradeInfo(message: WAWebJS.Message): void {
    const [ _, ...rest] = message.body.split(' ');
    rest ? message.reply(this.grade.info(rest.join(' '))) : message.reply('Comando inválido!');
  }

  public sendClassGrade(message: WAWebJS.Message): void { }

  public updateClassGrade(message: WAWebJS.Message): void { }
}

export default Sender;
