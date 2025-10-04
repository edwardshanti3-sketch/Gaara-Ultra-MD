import axios from 'axios'
import { execFile } from 'child_process'
import { join } from 'path'
import fs from 'fs/promises'

const TEMP_DIR = './tmp_downloads'
const pendingDownloads = {}

async function sendMessage(conn, chatId, text) {
  await conn.sendMessage(chatId, { text })
}

async function sendListMessage(conn, chatId, title, sections) {
  await conn.sendMessage(chatId, { text: title + '\n\n' + sections.map(s => s.title + ':\n' + s.rows.map(r => `- ${r.title} (${r.id})`).join('\n')).join('\n\n') })
}

async function sendFile(conn, chatId, filePath, filename, mimetype = 'video/mp4') {
  await conn.sendMessage(chatId, { file: filePath, filename, mimetype })
}

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

export async function playHandler(m, { conn, args }) {
  const chatId = m.chat || m.from || m.key?.remoteJid
  if (!args || args.length === 0) {
    return sendMessage(conn, chatId, 'Usa: .play <url_de_youtube>')
  }
  const youtubeUrl = args[0].trim()
  await fs.mkdir(TEMP_DIR, { recursive: true })
  await sendMessage(conn, chatId, 'Buscando formatos...')
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
      } else if (height && f.vcodec && f.acodec === 'none') {
        if (!byHeight[height]) byHeight[height] = []
        byHeight[height].push(f)
      }
    }
    const videoRows = []
    for (const r of desiredRes) {
      if (byHeight[r]) {
        const candidate = byHeight[r].sort((a, b) => (a.filesize || 0) - (b.filesize || 0))[0]
        videoRows.push({ id: `video_${candidate.format_id}`, title: `${r}p` })
      }
    }
    const audioRows = []
    const abrKeys = Object.keys(byAbr).sort((a, b) => Number(b) - Number(a))
    for (const abr of abrKeys) {
      const candidate = byAbr[abr][0]
      audioRows.push({ id: `audio_${candidate.format_id}`, title: `${Math.round(abr || (candidate.tbr || 0))} kbps` })
    }
    const sections = []
    if (videoRows.length) sections.push({ title: 'Video', rows: videoRows })
    if (audioRows.length) sections.push({ title: 'Audio', rows: audioRows })
    if (sections.length === 0) {
      return sendMessage(conn, chatId, 'No se encontraron formatos disponibles.')
    }
    const infoMsg = `*Youtube - Download*\n\n>> ${ydInfo.title}\n\n>> Duración: ${ydInfo.duration_string || '??'}\n>> Autor: ${ydInfo.uploader || '??'}\n>> Publicado: ${ydInfo.upload_date ? ydInfo.upload_date.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1') : '??'}\n>> Url: ${youtubeUrl}`
    await sendListMessage(conn, chatId, infoMsg, sections)
    pendingDownloads[chatId] = { youtubeUrl }
    await sendMessage(conn, chatId, 'Responde con el id del formato (ej: video_137 o audio_140)')
  } catch (err) {
    return sendMessage(conn, chatId, 'Error al obtener formatos: ' + err.message)
  }
}

export async function formatHandler(m, { conn, args }) {
  const chatId = m.chat || m.from || m.key?.remoteJid
  if (!args || args.length === 0) return
  const selectionId = args[0].trim()
  const context = pendingDownloads[chatId]
  if (!context) return sendMessage(conn, chatId, 'No hay descarga pendiente, usa .play primero.')
  const youtubeUrl = context.youtubeUrl
  const formatId = selectionId.split('_')[1]
  if (!formatId) return sendMessage(conn, chatId, 'Formato inválido')
  try {
    const outName = join(TEMP_DIR, `${Date.now()}_${formatId}.%(ext)s`)
    await sendMessage(conn, chatId, `Descargando formato ${formatId}...`)
    await ytDlpDownload(youtubeUrl, formatId, outName)
    const files = await fs.readdir(TEMP_DIR)
    const newest = files.map(f => ({ f, stat: fs.statSync(join(TEMP_DIR, f)) })).sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)[0]?.f
    if (!newest) return sendMessage(conn, chatId, 'No se encontró el archivo descargado.')
    const filePath = join(TEMP_DIR, newest)
    await sendFile(conn, chatId, filePath, newest)
  } catch (err) {
    return sendMessage(conn, chatId, 'Error descargando: ' + err.message)
  }
}