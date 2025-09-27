import pkg from '@whiskeysockets/baileys'
import Jimp from 'jimp'

const { downloadContentFromMessage } = pkg

let handler = async (m, { conn }) => {
  try {
    await m.react?.('⏳')

    // 🔹 Usar mensaje citado si existe, si no el actual
    const targetMsg = m.quoted ? m.quoted : m

    // 🔹 Intentar capturar imageMessage
    const imageMessage =
      targetMsg?.message?.imageMessage || // si es imagen normal
      targetMsg?.msg?.message?.imageMessage || // a veces en bails va en msg
      targetMsg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage // casos raros

    if (!imageMessage) {
      return m.reply('❌ Responde o envía una *imagen* y usa `.setppbot`.')
    }

    // 🔹 Descargar la imagen
    const stream = await downloadContentFromMessage(imageMessage, 'image')
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // 🔹 Procesar la imagen con Jimp
    const image = await Jimp.read(buffer)
    const width = image.getWidth()
    const height = image.getHeight()
    const aspect = width / height

    let resized, formato
    if (Math.abs(aspect - 1) < 0.1) {
      resized = image.cover(640, 640) // cuadrada
      formato = '1:1'
    } else if (aspect > 1) {
      resized = image.resize(640, Jimp.AUTO) // horizontal
      formato = 'Horizontal'
    } else {
      resized = image.resize(Jimp.AUTO, 640) // vertical
      formato = 'Vertical'
    }

    const finalBuffer = await resized.quality(100).getBufferAsync(Jimp.MIME_JPEG)

    // 🔹 JID del bot
    const botJid =
      (conn.user && (conn.user.id || conn.user.jid || conn.user)) || conn.user

    // 🔹 Subir foto
    if (typeof conn.updateProfilePicture === 'function') {
      await conn.updateProfilePicture(botJid, finalBuffer)
    } else if (typeof conn.setProfilePicture === 'function') {
      await conn.setProfilePicture(botJid, finalBuffer)
    } else if (typeof conn.profilePictureUpdate === 'function') {
      await conn.profilePictureUpdate(botJid, finalBuffer)
    } else {
      throw new Error('Método de actualización no encontrado en baileys.')
    }

    await m.react?.('✅')
    await m.reply(
      `✅ Foto de perfil del bot actualizada\n> Proporción detectada: *${formato}*`
    )
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    await m.reply('❌ Error al actualizar la foto: ' + (e.message || e))
  }
}

handler.command = /^setppbot$/i
export default handler