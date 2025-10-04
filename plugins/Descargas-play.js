import { execFile } from 'child_process'
import { join } from 'path'
import fs from 'fs'
import fsp from 'fs/promises'

const TEMP_DIR = './tmp_downloads'
const pendingDownloads = {}

function ytDlpListFormats(youtubeUrl) {
  return new Promise((resolve, reject) => {
    const args = ['-j', '--no-playlist', youtubeUrl]
    execFile('yt-dlp', args, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
      if (err) return reject(err)
      try {
        const info = JSON.parse(stdout)
        resolve(info)
      } catch (parseErr) {
        reject(parseErr)
      }
    })
  })
}

function ytDlpDownload(youtubeUrl, formatId, destPath) {
  return new Promise((resolve, reject) => {
    const args = ['-f', formatId, '-o', destPath, youtubeUrl]
    execFile('yt-dlp', args, { maxBuffer: 1024 * 1024 * 50 }, (err) => {
      if (err) return reject(err)
      resolve(destPath)
    })
  })
}

let handler = async (m, { conn, args, command }) => {
  const chatId = m.chat
  if (!args || args.length === 0) return m.reply(`Usa: .${command} <url o nombre>`)

  const youtubeUrl = args[0]
  await fsp.mkdir(TEMP_DIR, { recursive: true })
  await m.reply('🔎 Buscando formatos...')

  try {
    const ydInfo = await ytDlpListFormats(youtubeUrl)
    const formats = ydInfo.formats || []
    const desiredRes = ['144', '240', '360', '480', '540', '720', '1080']
    const byHeight = {}
    const byAbr = {}
    for (const f of formats) {
      const height = f.height || (f.format_note && f.format_note.match(/(\d+)p/)?.[1]) || null
      const abr = f.abr || Math.round(f.tbr) || null
      if (height && f.vcodec && f.acodec !== 'none') {
        if (!byHeight[height]) byHeight[height] = []
        byHeight[height].push(f)
      } else if (f.acodec && f.vcodec === 'none') {
        if (!byAbr[abr]) byAbr[abr] = []
        byAbr[abr].push(f)
      }
    }

    const videoRows = []
    for (const r of desiredRes) {
      if (byHeight[r]) {
        const candidate = byHeight[r][0]
        videoRows.push(`📹 ${r}p → video_${candidate.format_id}`)
      }
    }

    const audioRows = []
    const abrKeys = Object.keys(byAbr).sort((a, b) => Number(b) - Number(a))
    for (const abr of abrKeys) {
      const candidate = byAbr[abr][0]
      audioRows.push(`🎵 ${Math.round(abr)} kbps → audio_${candidate.format_id}`)
    }

    if (!videoRows.length && !audioRows.length) return m.reply('No se encontraron formatos.')

    const infoMsg = `*Youtube - Download*\n\n>> ${ydInfo.title}\n\n>> Duración: ${ydInfo.duration_string || '??'}\n>> Autor: ${ydInfo.uploader || '??'}\n>> Publicado: ${ydInfo.upload_date ? ydInfo.upload_date.replace(/(\\d{4})(\\d{2})(\\d{2})/, '$3/$2/$1') : '??'}\n>> Url: ${youtubeUrl}\n\n*Video:*\n${videoRows.join('\n')}\n\n*Audio:*\n${audioRows.join('\n')}\n\nResponde con el ID (ej: video_137 o audio_140)`

    await conn.sendMessage(chatId, { text: infoMsg }, { quoted: m })
    pendingDownloads[chatId] = { youtubeUrl }
  } catch (err) {
    return m.reply('❌ Error al obtener formatos: ' + err.message)
  }
}

handler.help = ['play <url|nombre>']
handler.tags = ['downloader']
handler.command = /^play$/i
export default handler

let select = async (m, { conn, args }) => {
  const chatId = m.chat
  if (!args || args.length === 0) return
  const selectionId = args[0]
  const context = pendingDownloads[chatId]
  if (!context) return m.reply('No hay descarga pendiente, usa .play primero.')
  const youtubeUrl = context.youtubeUrl
  const formatId = selectionId.split('_')[1]
  if (!formatId) return m.reply('Formato inválido')
  try {
    const outName = join(TEMP_DIR, `${Date.now()}_${formatId}.%(ext)s`)
    await m.reply(`⬇️ Descargando formato ${formatId}...`)
    await ytDlpDownload(youtubeUrl, formatId, outName)
    const files = fs.readdirSync(TEMP_DIR)
    const newest = files.map(f => ({ f, stat: fs.statSync(join(TEMP_DIR, f)) })).sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)[0]?.f
    if (!newest) return m.reply('No se encontró el archivo descargado.')
    const filePath = join(TEMP_DIR, newest)
    await conn.sendMessage(chatId, { document: { url: filePath }, fileName: newest, mimetype: 'video/mp4' }, { quoted: m })
  } catch (err) {
    return m.reply('❌ Error descargando: ' + err.message)
  }
}

select.command = /^video_|^audio_/i
export { select }