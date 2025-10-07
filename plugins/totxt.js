import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply('🎧 Responde a un audio con *.totxt*')
  let q = m.quoted
  let mime = (q.msg || q).mimetype || ''
  if (!/audio/.test(mime)) return m.reply('❌ Eso no parece un audio')

  try {
    await m.react('🎙️')
    const buffer = await downloadMediaMessage(q, 'buffer', {}, { reuploadRequest: conn.waUploadToServer })
    const inputFile = path.join(__dirname, `temp_${Date.now()}.ogg`)
    const wavFile = inputFile.replace('.ogg', '.wav')

    fs.writeFileSync(inputFile, buffer)

    // 🔊 Convertir audio a formato aceptado por Google (16 kHz mono wav)
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', ['-i', inputFile, '-ar', '16000', '-ac', '1', '-f', 'wav', wavFile])
      ff.on('exit', code => code === 0 ? resolve() : reject(new Error('ffmpeg error')))
    })
    fs.unlinkSync(inputFile)

    const audioData = fs.readFileSync(wavFile)
    const base64Audio = audioData.toString('base64')

    // 🧠 Enviar a Google Speech (endpoint usado por Chrome)
    const res = await fetch('https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyD6f6Qj-CwKjU1k9EIPbAhrHH4qebWzPco', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'es-ES'
        },
        audio: { content: base64Audio }
      })
    })

    const json = await res.json()
    fs.unlinkSync(wavFile)

    const text = json?.results?.[0]?.alternatives?.[0]?.transcript
    if (!text) throw new Error('sin resultado')

    await m.react('✅')
    await conn.reply(m.chat, `🗣️ *Texto detectado:* ${text}`, m)

  } catch (e) {
    console.error(e)
    m.reply('⚠️ No se pudo convertir el audio a texto.')
  }
}

handler.help = ['totxt (responde a un audio)']
handler.tags = ['tools']
handler.command = /^totxt$/i

export default handler