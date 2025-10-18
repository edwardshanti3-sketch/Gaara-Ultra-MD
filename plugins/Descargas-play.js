import fetch from 'node-fetch'
import yts from 'yt-search'
import { ytmp3 } from 'api-dylux' // ✅ usa api-dylux directa y estable

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
• ${usedPrefix}play daft punk get lucky
• ${usedPrefix}play enemy imagine dragons

🎧 Salida: MP3 Alta Calidad
    `.trim(), m, ctxWarn)
  }

  try {
    await conn.reply(m.chat, '🔍 Buscando música...', m, ctxOk)

    const search = await yts(text)
    if (!search.videos.length) throw new Error('No se encontraron resultados.')

    const video = search.videos[0]
    const { title, url, thumbnail, timestamp, ago, views } = video

    // 🔽 Descargar audio usando api-dylux
    const result = await ytmp3(url)
    if (!result || !result.dl_url) throw new Error('No se pudo obtener el enlace de descarga.')

    const audioUrl = result.dl_url

    let thumbBuffer
    try {
      const res = await fetch(thumbnail)
      thumbBuffer = Buffer.from(await res.arrayBuffer())
    } catch {
      thumbBuffer = null
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        jpegThumbnail: thumbBuffer,
        caption: `
🎶 *${title}*
🕒 Duración: ${timestamp}
📅 Subido: ${ago}
👁️ Vistas: ${views}
📦 Fuente: api-dylux
        `.trim()
      },
      { quoted: m }
    )

    await conn.reply(m.chat, '✅ Descarga completa 🎧', m, ctxOk)
  } catch (e) {
    console.error('❌ Error en play:', e)
    await conn.reply(m.chat, `❌ Error: ${e.message}`, m, ctxErr)
  }
}

handler.help = ['play <nombre>']
handler.tags = ['downloader']
handler.command = ['play']

export default handler