import WAWebJS, { MessageMedia, Client } from 'whatsapp-web.js';
import Axios from 'axios';
import X from 'get-twitter-media';
import { TiktokDL } from '@tobyg74/tiktok-api-dl';
import Ig from '../utils/ig';

interface Content {
  url: string;
  type: string;
  sender: string;
  message: WAWebJS.Message;
}

interface Data {
  type: string;
  url: string;
}

class Media {
  private readonly client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  private async sendMedia({ message, sender, url, type }: Content) {
    try {
      const message_down = await message.reply('*Tô baixando esse krai...*');
      const { data } = await Axios.get(url, { responseType: 'arraybuffer' });
      await message_down.delete(true);
      await message_down.delete();

      const returned =
        type === 'video'
          ? Buffer.from(data, 'binary').toString('base64') : Buffer.from(data).toString('base64');
      const mimetype = type === 'video' ? 'video/mp4' : 'image/jpeg';

      const message_send = await message.reply('*Ja tô enviando chefia...*');
      const media = new MessageMedia(mimetype, returned, `media.${type}`);
      const caption = message.body
        .split(' ')
        .slice(2)
        .filter(str => !str.includes(','))
        .filter(str => Object.is(Number(str), NaN))
        .join(' ');
      await this.client.sendMessage(sender, media, { caption });
      await message_send.delete(true);
      await message_send.delete();
    } catch (e) {
      message.reply('*Deu pau aqui tenta, dnv dps*');
      console.log(e);
    }
  }

  private getPostsIndexes(message: WAWebJS.Message): number[] {
    const indexes = message.body.split(' ').at(-1)?.split(',');

    if (!indexes) return [];

    const filteredIndexes = indexes
      .map(i => Number(i))
      .filter(value => !Object.is(value, NaN));

    return filteredIndexes;
  }

  public async ig(url: string, sender: string, message: WAWebJS.Message) {
    try {
      const post = await Ig(url);

      if (!post.found) {
        message.reply('*Vê se o post não foi excluido, neandertal*');
        return;
      }

      const indexes = this.getPostsIndexes(message);
      if (indexes.length == 0) {
        post.data.forEach(async ({ type, url }: Data) => {
          await this.sendMedia({ type, url, message, sender });
        });
        return;
      }

      indexes.forEach(async i => {
        const post_index = post.data.at(i);
        if (i >= post.data.length || !post_index) return;

        const { type, url } = post_index;
        await this.sendMedia({ type, url, message, sender });
      });
    } catch (e) {
      message.reply('*Não foi possível manipular URL desse post [IG]*');
      console.log(e);
    }
  }

  public async tk(url: string, sender: string, message: WAWebJS.Message) {
    try {
      const { status, result }  = await TiktokDL(url, { version: 'v1' });

      if (status !== 'success' || !result) {
        message.reply('*Vê se o post não foi excluido, neandertal*');
        return;
      }

      const type = result.type;
      if (type === 'video' && result.video) {
        await this.sendMedia({ type, url: result.video, sender, message });
      } else if (type == 'image' && result.images) {
        console.log(result.images);
        // result.images.forEach({url})
        // await this.sendMedia({ type, url: result.video, sender, message });
      }
    } catch (e) {
      message.reply('*Não foi possível manipular URL desse post [Tk]*');
    }
  }

  public async x(url: string, sender: string, message: WAWebJS.Message) {
    try {
      const post = await X.getTwitterMedia(url, { text: true });
      if (!post.found) {
        message.reply('*Vê se o post não foi excluido, neandertal*');
        return;
      }

      const type = post.type.toLowerCase();
      post.media.forEach(async value => {
        const url_post = value.url;
        await this.sendMedia({ type, url: url_post, sender, message });

      });

    } catch (e) {
      message.reply('*Não foi possível manipular URL desse post [X]*');
    }
  }
}

export default Media;
