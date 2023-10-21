import WAWebJS, { Client, MessageMedia } from 'whatsapp-web.js';

class Sticker {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
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

  public async urlToSticker(sender: string, message: WAWebJS.Message) { }
}

export default Sticker;
