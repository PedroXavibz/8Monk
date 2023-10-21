import Axios from 'axios';
import cheerio from 'cheerio';
import querystring from 'querystring';


interface Data {
  type: string,
  url: string
}

interface Result {
  found: boolean,
  data: Data[]
}

async function getPost(url: string): Promise<Result> {
  const query = querystring.stringify({ q: url, t: 'media', lang: 'en' });

  const json = await Axios.post('https://saveig.app/api/ajaxSearch', query,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://saveig.app/en',
        'Referer': 'https://saveig.app/en',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'User-Agent': 'PostmanRuntime/7.31.1'
      }
    }
  );

  const $ = cheerio.load(json.data.data);
  const data: Data[] = [];

  const btn = $('div[class="download-items__btn"]');
  btn.each((_, e) => {
    const a = $(e).find('a');
    const href = a.attr('href');

    if (a && href) {
      data.push({
        type: href.match('.jpg') ? 'image' : 'video',
        url: href
      });
    }
  });

  if (!data.length) {
    return {
      found: false,
      data: []
    };
  }

  return {
    found: true,
    data
  };
}

export default getPost;
