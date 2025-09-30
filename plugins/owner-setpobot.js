// plugins/setppbot.js
import pkg from '@whiskeysockets/baileys'
import Jimp from 'jimp'

const { downloadContentFromMessage } = pkg
const generateProfilePicture = pkg.generateProfilePicture // puede ser undefined en algunas versiones

let handler = async (m, { conn, usedPrefix, command }) => {
  await m.react?.('⏳')
  try {
    const q = m.quoted ? m.quoted : m
    // intentar obtener mime y imageMessage
    const imageMessage =
      q?.message?.imageMessage ||
      q?.msg?.message?.imageMessage ||
      q?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
      null

    const mime = (q.msg || q).mimetype || (imageMessage && imageMessage.mimetype) || ''
    if (!/image/.test(mime)) {
      await m.react?.('❌')
      return await m.reply(`❌ Responde a una *imagen* usando ${usedPrefix + command}`)
    }

    // 1) obtener buffer (varias formas)
    let buffer = null
    try {
      if (imageMessage && downloadContentFromMessage) {
        const stream = await downloadContentFromMessage(imageMessage, 'image')
        buffer = Buffer.from([])
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
      }
    } catch (e) {
      console.error('downloadContentFromMessage fallo:', e)
    }

    if (!buffer && typeof q.download === 'function') {
      try { buffer = await q.download() } catch (e) { console.error('q.download fallo:', e) }
    }

    if (!buffer && imageMessage && typeof imageMessage.download === 'function') {
      try { buffer = await imageMessage.download() } catch (e) { console.error('imageMessage.download fallo:', e) }
    }

    if (!buffer) {
      await m.react?.('❌')
      return await m.reply('❌ No pude obtener la imagen (intenta reenviarla o citarla de nuevo).')
    }

    // 2) procesar con Jimp -> JPEG y tamaño razonable (max side 640)
    const image = await Jimp.read(buffer)
    const width = image.getWidth()
    const height = image.getHeight()
    const aspect = width / height

    let resized
    if (Math.abs(aspect - 1) < 0.05) {
      // aproximadamente cuadrada -> cover para asegurar bien el encuadre
      resized = image.cover(640, 640)
    } else if (aspect > 1) {
      // horizontal
      resized = image.resize(640, Jimp.AUTO)
    } else {
      // vertical
      resized = image.resize(Jimp.AUTO, 640)
    }

    // ajustar calidad y obtener buffer JPEG
    const finalBuffer = await resized.quality(85).getBufferAsync(Jimp.MIME_JPEG)

    // info para debug/respuesta
    const info = `${Math.round(width)}x${Math.round(height)} -> ${finalBuffer.length} bytes`

    // 3) intentos de subida (en orden), guardamos el último error
    const botJid = conn.user?.id || conn.user?.jid || conn.user || ''
    let lastErr = null
    let ok = false
    let used = ''

    // Intento 1: updateProfilePicture (si existe)
    try {
      if (typeof conn.updateProfilePicture === 'function') {
        await conn.updateProfilePicture(botJid, finalBuffer)
        ok = true
        used = 'updateProfilePicture(finalBuffer)'
      }
    } catch (e) {
      lastErr = e
      console.error('updateProfilePicture finalBuffer error:', e)
    }

    // Intento 2: si existe generateProfilePicture, úsala y envía query
    if (!ok && typeof generateProfilePicture === 'function') {
      try {
        const pic = await generateProfilePicture(finalBuffer) // puede devolver { img } o buffer
        const content = pic?.img || pic || finalBuffer
        await conn.query({
          tag: 'iq',
          attrs: { to: botJid, type: 'set', xmlns: 'w:profile:picture' },
          content: [{ tag: 'picture', attrs: { type: 'image' }, content }]
        })
        ok = true
        used = 'generateProfilePicture + iq'
      } catch (e) {
        lastErr = e
        console.error('generateProfilePicture+iq error:', e)
      }
    }

    // Intento 3: query directa con finalBuffer (raw)
    if (!ok) {
      try {
        await conn.query({
          tag: 'iq',
          attrs: { to: botJid, type: 'set', xmlns: 'w:profile:picture' },
          content: [{ tag: 'picture', attrs: { type: 'image' }, content: finalBuffer }]
        })
        ok = true
        used = 'raw iq with finalBuffer'
      } catch (e) {
        lastErr = e
        console.error('raw iq finalBuffer error:', e)
      }
    }

    if (ok) {
      await m.react?.('✅')
      return await m.reply(`✅ Foto actualizada con éxito (${used})\n> Dimensiones: ${info}`)
    } else {
      await m.react?.('❌')
      // mostrar error exacto (si es objeto, convertir a string)
      const errMsg = (lastErr && (lastErr.message || JSON.stringify(lastErr))) || 'Error desconocido'
      return await m.reply(`❌ Error al actualizar la foto (último intento):\n\`\`\`${errMsg}\`\`\``)
    }
  } catch (e) {
    console.error('Error general handler:', e)
    await m.react?.('❌')
    await m.reply(`❌ Error exacto al procesar:\n\`\`\`${e?.message || e}\`\`\``)
  }
}

handler.command = /^setppbot$/i
//handler.rowner = true
export default handler