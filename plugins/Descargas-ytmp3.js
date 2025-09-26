import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";
import crypto from "crypto";

// ================= OBJETO OGMp3 INTEGRADO =================
const ogmp3 = {
  api: {
    base: "https://api3.apiapi.lat",
    endpoints: {
      a: "https://api5.apiapi.lat",
      b: "https://api.apiapi.lat",
      c: "https://api3.apiapi.lat"
    }
  },
  headers: {
    'authority': 'api.apiapi.lat',
    'content-type': 'application/json',
    'origin': 'https://ogmp3.lat',
    'referer': 'https://ogmp3.lat/',
    'user-agent': 'Postify/1.0.0'
  },
  formats: {
    video: ['240', '360', '480', '720', '1080'],
    audio: ['64', '96', '128', '192', '256', '320']
  },
  default_fmt: {
    video: '720',
    audio: '320'
  },
  restrictedTimezones: new Set(["-330", "-420", "-480", "-540"]),
  utils: {
    hash: () => {
      const array = new Uint8Array(16);
      crypto.randomFillSync(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
    },
    encoded: (str) => {
      let result = "";
      for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) ^ 1);
      }
      return result;
    },
    enc_url: (url, separator = ",") => {
      const codes = [];
      for (let i = 0; i < url.length; i++) {
        codes.push(url.charCodeAt(i));
      }
      return codes.join(separator).split(separator).reverse().join(separator);
    }
  },
  isUrl: str => {
    try {
      const url = new URL(str);
      const hostname = url.hostname.toLowerCase();
      const b = [/^(.+\.)?youtube\.com$/, /^(.+\.)?youtube-nocookie\.com$/, /^youtu\.be$/];
      return b.some(a => a.test(hostname)) && !url.searchParams.has("playlist");
    } catch (_) {
      return false;
    }
  },
  youtube: url => {
    if (!url) return null;
    const b = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let a of b) {
      if (a.test(url)) return url.match(a)[1];
    }
    return null;
  },
  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const ae = Object.values(ogmp3.api.endpoints);
      const be = ae[Math.floor(Math.random() * ae.length)];
      const fe = endpoint.startsWith('http') ? endpoint : `${be}${endpoint}`;
      const { data: response } = await axios({
        method,
        url: fe,
        headers: ogmp3.headers,
        data: method === 'post' ? data : undefined
      });
      return { status: true, code: 200, data: response };
    } catch (error) {
      return { status: false, code: error.response?.status || 500, error: error.message };
    }
  },
  download: async (link, format, type = 'audio') => {
    if (!link || !ogmp3.isUrl(link)) return null;
    try {
      const res = await ogmp3.request(`/${ogmp3.utils.hash()}/init/${ogmp3.utils.enc_url(link)}/${ogmp3.utils.hash()}/`, {
        data: ogmp3.utils.encoded(link),
        format: type === 'audio' ? "0" : "1",
        mp3Quality: type === 'audio' ? format : null,
        mp4Quality: type === 'video' ? format : null,
        referer: "https://ogmp3.cc",
        userTimeZone: new Date().getTimezoneOffset().toString()
      });
      if (res?.status && res.data?.i) {
        return { result: { download: `${ogmp3.api.base}/${ogmp3.utils.hash()}/download/${ogmp3.utils.encoded(res.data.i)}/${ogmp3.utils.hash()}/` } };
      }
      return null;
    } catch {
      return null;
    }
  }
};

// ================= HANDLER =================
const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, "Ingresa el nombre del video a descargar.", m);

    await conn.sendMessage(m.chat, { react: { text: "🕑", key: m.key } });

    const search = await yts(text);
    if (!search.all || !search.all.length) return m.reply("No se encontraron resultados para tu búsqueda.");

    const videoInfo = search.all[0];
    const { title, url } = videoInfo;
    const format = "mp3";

    let downloadUrl = null;
    try {
      const data = await ogmp3.download(url, "320", "audio");
      downloadUrl = data?.result?.download;
    } catch (e) { downloadUrl = null; }

    if (!downloadUrl) return m.reply("No se pudo descargar el audio.");

    const fileName = `${title.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/ +/g, "_")}.${format}`;
    await conn.sendMessage(
      m.chat,
      { audio: { url: downloadUrl }, mimetype: "audio/mpeg", fileName, ptt: false },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    return m.reply(`Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ["ytmp3"];
handler.tags = ["descargas"];

export default handler;