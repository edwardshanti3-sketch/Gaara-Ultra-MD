import yts from "yt-search";
import { default as Dylux } from "api-dylux";

const dylux = new Dylux(); // inicializa la API de Dylux

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, "Ingresa el nombre del video a descargar.", m);

    await conn.sendMessage(m.chat, { react: { text: "🕑", key: m.key } });

    const search = await yts(text);
    if (!search.all || !search.all.length) return m.reply("No se encontraron resultados para tu búsqueda.");

    const videoInfo = search.all[0];
    const { title, url } = videoInfo;

    // Obtenemos la URL de descarga con api-dylux
    let downloadUrl = null;
    try {
      const res = await dylux.ytmp3(url); // método de api-dylux
      downloadUrl = res?.result?.download?.url || null;
    } catch {
      downloadUrl = null;
    }

    if (!downloadUrl) return m.reply("No se pudo descargar el audio.");

    const fileName = `${title.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/ +/g, "_")}.mp3`;
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