import fetch from 'node-fetch'
import yts from 'yt-search'

// ====== Límites de peso ======
const LimitAud = 725 * 1024 * 1024 // 725MB
const LimitVid = 425 * 1024 * 1024 // 425MB

// ====== Control de usuarios descargando ======
const userRequests = new Set()

// ====== Función para obtener el tamaño de un archivo remoto ======
async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return parseInt(response.headers.get('content-length') || 0)
  } catch {
    return 0
  }
}

// ====== Conversión de segundos a formato legible ======
function secondString(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (d > 0) parts.push(d + (d === 1 ? ' día' : ' días'))
  if (h > 0) parts.push(h + (h === 1 ? ' hora' : ' horas'))
  if (m > 0) parts.push(m + (m === 1 ? ' minuto' : ' minutos'))
  if (s > 0) parts.push(s + (s === 1 ? ' segundo' : ' segundos'))
  return parts.join(', ')
}

// ====== Handler principal ======
let handler = async (m, { conn, text, usedPrefix }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!text) {
    return conn.reply(m.chat, `
⚡️ Gaara-Ultra-MD - Descargar Multimedia 🎵⚡️

📝 Forma de uso:
• ${usedPrefix}play <nombre de la canción>

💡 Ejemplo:
• ${usedPrefix}play Morat Besos en guerra

🎯 Formato disponible:
🎵 Audio MP3 (alta calidad)

🌟 ¡Encuentra y descarga tu música favorita! 🎶
    `.trim(), m, ctxWarn)
  }

  if (userRequests.has(m.sender)) {
    return conn.reply(m.chat, '⏳ Ya tienes una descarga en curso, espera que termine.', m, ctxWarn)
  }

  userRequests.add(m.sender)
  try {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    const search = await yts(text)
    if (!search.videos.length) throw new Error('No encontré resultados para tu búsqueda.')

    const video = search.videos[0]
    const { title, url, duration, thumbnail } = video

    await conn.reply(m.chat, `🎧 *${title}*\n\n⏰ *Duración:* ${secondString(duration.seconds)}\n\n⌛ Descargando, espera un momento...`, m, ctxOk)

    // ====== API Adonix (única que funciona) ======
    const endpoint = `https://apiadonix.kozow.com/download/ytmp3?apikey=AdonixKeyVip&url=${encodeURIComponent(url)}`

    const response = await fetch(endpoint)
    if (!response.ok) throw new Error('Error al contactar con Adonix API.')

    const data = await response.json()
    const audioUrl = data?.data?.url
    if (!audioUrl) throw new Error('No se encontró el enlace de descarga en la respuesta.')

    const fileSize = await getFileSize(audioUrl)
    const limit = LimitAud

    // ====== Envío según tamaño ======
    if (fileSize > limit) {
      await conn.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        caption: `✅ *Descarga como documento*\n🎵 *Título:* ${title}`
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false,
        jpegThumbnail: thumbnail ? await (await fetch(thumbnail)).arrayBuffer() : null,
        caption: `🎼 ${title} | API: Adonix`
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await conn.reply(m.chat, `✅ Descarga completa ⚡️\n🌟 ${title}`, m, ctxOk)

  } catch (e) {
    console.error('❌ Error en play:', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, `❌ Error: ${e.message}`, m, ctxErr)
  } finally {
    userRequests.delete(m.sender)
  }
}

handler.help = ['play <nombre de la canción>']
handler.tags = ['downloader']
handler.command = ['play']

export default handler