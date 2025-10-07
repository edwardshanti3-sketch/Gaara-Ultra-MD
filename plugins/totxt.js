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

    // Convertir a WAV (16kHz mono)
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', ['-i', inputFile, '-ar', '16000', '-ac', '1', '-f', 'wav', wavFile])
      ff.on('exit', code => code === 0 ? resolve() : reject(new Error('ffmpeg error')))
    })
    fs.unlinkSync(inputFile)

    const audioData = fs.readFileSync(wavFile)
    fs.unlinkSync(wavFile)

    // 🚀 Enviar al modelo Whisper de HuggingFace (sin API key)
    const res = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo', {
      method: 'POST',
      headers: { 'Content-Type': 'audio/wav' },
      body: audioData
    })

    const json = await res.json()
    const text = json.text || '(no se entendió nada)'

    await m.react('✅')
    await conn.reply(m.chat, `🗣️ *Texto detectado:* ${text}`, m)
  } catch (err) {
    console.error(err)
    m.reply('⚠️ No se pudo convertir el audio a texto.')
  }
}

handler.help = ['totxt (responde a un audio)']
handler.tags = ['tools']
handler.command = /^totxt$/i

export default handler