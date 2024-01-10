import { Message, MessageMedia, Client } from 'whatsapp-web.js';
import Axios from 'axios';
import { TiktokDL } from '@tobyg74/tiktok-api-dl';
import Ig from '../utils/ig';
const x = require('get-twitter-media');

interface Content {
  url: string;
  type: string;
  sender: string;
  message: Message;
}

interface Data {
  type: string;
  url: string;
}

interface Post {
  found: boolean,
  data: Data[]
}

interface TwitterResult {
  found: boolean,
  type: 'video' | 'image',
  media: [{ url: string }]
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
      await message_send.delete(true);
      await message_send.delete();

      await this.client.sendMessage(sender, media, { caption });
    } catch (e) {
      message.reply('*Deu pau aqui tenta, dnv dps*');
      console.error(e);
    }
  }

  public handlePostAttachement(post: Post, sender: string, message: Message) {
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
  }

  public getPostsIndexes(message: Message): number[] {
    const indexes = message.body.split(' ').at(-1)?.split(',');

    if (!indexes) return [];

    const filteredIndexes = indexes
      .map(i => Number(i))
      .filter(value => !Object.is(value, NaN));

    return filteredIndexes;
  }

  public async getPostIg(url: string): Promise<Post> {
    const { found, data } = await Ig(url);
    const post: Post = {
      found: found,
      data: data,
    };

    return post;
  }

  public async getPostTk(url: string): Promise<Post> {
    const { status, result } = await TiktokDL(url, { version: 'v1' });
    const post: Post = {
      found: status === 'success' ? true : false,
      data: []
    };

    result?.images?.forEach(url => post.data.push({ type: 'image', url }));
    if (result?.video)
      post.data.push({ type: 'video', url: result.video[0] });

    return post;
  }

  public async getPostX(url: string) {
    const { found, type, media }: TwitterResult = await x(url, { text: true });
    const post: Post = {
      found,
      data: []
    };

    if (found)
      media.forEach(({ url }) => {
        const data: Data = { url, type };
        post.data.push(data);
      });

    return post;
  }
}

export default Media;
