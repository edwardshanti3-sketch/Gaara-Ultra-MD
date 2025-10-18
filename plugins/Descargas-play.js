import fetch from 'node-fetch'
import yts from 'yt-search'
import { ytmp3 } from 'api-dylux'  // ✅ Usamos api-dylux

let handler = async (m, { conn, text, usedPrefix }) => {
  const ctxErr = global.rcanalx || {}
  const ctxWarn = global.rcanalw || {}
  const ctxOk = global.rcanalr || {}

  if (!text) {
    return conn.reply(m.chat, `
⚡️ Gaara-Ultra-MD - Descargar Música 🎶

📝 Uso:
• ${usedPrefix}play <nombre de la canción>

💡 Ejemplos:
• ${usedPrefix}play unravel Tokyo ghoul
• ${usedPrefix}play crossing field

🎧 Salida:
🎵 Audio MP3 (alta calidad)
    `.trim(), m, ctxWarn)
  }

  try {
    await conn.reply(m.chat, '🔍 Buscando música...', m, ctxOk)

    const search = await yts(text)
    if (!search.videos.length) throw new Error('No se encontraron resultados.')

    const video = search.videos[0]
    const { title, url, thumbnail, timestamp } = video

    // 🔽 Descarga usando api-dylux
    const result = await ytmp3(url)
    const audioUrl = result?.dl_url

    if (!audioUrl) throw new Error('No se pudo obtener el enlace de descarga.')

    let thumbBuffer = null
    try {
      const resp = await fetch(thumbnail)
      thumbBuffer = Buffer.from(await resp.arrayBuffer())
    } catch (err) {
      console.log('⚠️ Miniatura no disponible:', err.message)
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        jpegThumbnail: thumbBuffer,
        caption: `🎵 *${title}*\n🕒 Duración: ${timestamp}\n📦 Fuente: api-dylux`
      },
      { quoted: m }
    )

    await conn.reply(m.chat, `✅ Descarga completa 🎶`, m, ctxOk)

  } catch (e) {
    console.error('❌ Error en play:', e)
    await conn.reply(m.chat, `❌ Error: ${e.message}`, m, ctxErr)
  }
}

handler.help = ['play <nombre de la canción>']
handler.tags = ['downloader']
handler.command = ['play']

export default handler