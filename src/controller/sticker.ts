import WAWebJS, { Client, MessageMedia } from 'whatsapp-web.js';
import axios from 'axios';
import Media from './media';

class Sticker {
  private client: Client;
  private media: Media;

  constructor(client: Client, media: Media) {
    this.client = client;
    this.media = media;
  }


  public async gifToSticker(sender: string, message: WAWebJS.Message) {
    try {
      const { data } = await message.downloadMedia();
      const media = new MessageMedia('video/mp4', data, 'video.mp4');
      await this.client.sendMessage(sender, media, {
        sendMediaAsSticker: true,
      });
    } catch (e) {
      message.reply('*Erro ao processar o vídeo!*');
    }
  }

  public async imageToSticker(sender: string, message: WAWebJS.Message) {
    try {
      const { data } = await message.downloadMedia();
      const image = new MessageMedia('image/jpg', data, 'image.jpg');
      await this.client.sendMessage(sender, image, {
        sendMediaAsSticker: true,
      });
    } catch (e) {
      message.reply('*Erro ao processar imagem!*');
    }
  }

  public async urlToSticker(sender: string, message: WAWebJS.Message) {
    const url = message.body.split(' ')[1];
    try {
      const { hostname } = new URL(url);

      if (hostname == 'www.instagram.com') {
        const posts = await this.media.getPostIg(url);

        const indexes = this.media.getPostsIndexes(message);
        if (indexes.length === 0) {
          posts.data.forEach(async post => {
            if (post.type == 'image') this.sendStickerUrl(post.url, sender);
          });
        }

        indexes.forEach(async i => {
          const post = posts.data.at(i);
          if (i >= posts.data.length || !post) return;

          if (post.type === 'image')
            await this.sendStickerUrl(post.url, sender);
        });
      } else {
        await this.sendStickerUrl(url, sender);
      }
    } catch (e) {
      console.error(e);
      message.reply('*Isso é la link, cu de sola*');
    }
  }

  private async sendStickerUrl(url: string, sender: string) {
    try {
      const { data } = await axios.get(url, { responseType: 'arraybuffer' });
      const returnedB64 = Buffer.from(data).toString('base64');
      const image = new MessageMedia('image/jpeg', returnedB64, 'image.jpg');
      await this.client.sendMessage(sender, image, { sendMediaAsSticker: true });
    } catch (e) {
      console.error(e);
      await this.client.sendMessage(sender, '*Deu ruim patrão*');
    }
  }
}

export default Sticker;
