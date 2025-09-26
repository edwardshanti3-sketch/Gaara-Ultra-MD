// plugins/setppbot.js
import pkg from '@whiskeysockets/baileys'
const { downloadContentFromMessage } = pkg

let handler = async (m, { conn }) => {
  try {
    // 🔹 Reacción de cargando
    await m.react?.('⏳')

    // Tomar imagen (quoted o propia)
    const targetMsg = m.quoted?.message ? m.quoted : m
    const imageMessage = targetMsg.message?.imageMessage
    if (!imageMessage) {
      return m.reply('❌ Responde a una *imagen* con el comando `.setppbot`.')
    }

    // 🔹 Descargar la imagen
    const stream = await downloadContentFromMessage(imageMessage, 'image')
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // 🔹 Obtener el JID del bot
    const botJid = (conn.user && (conn.user.id || conn.user.jid || conn.user)) || conn.user

    // 🔹 Subir foto de perfil (usa tu generateProfilePicture ya modificado)
    if (typeof conn.updateProfilePicture === 'function') {
      await conn.updateProfilePicture(botJid, buffer)
    } else if (typeof conn.setProfilePicture === 'function') {
      await conn.setProfilePicture(botJid, buffer)
    } else if (typeof conn.profilePictureUpdate === 'function') {
      await conn.profilePictureUpdate(botJid, buffer)
    } else {
      throw new Error('Tu versión de bails no expone updateProfilePicture')
    }

    await m.react?.('✅')
    await m.reply('✅ Foto de perfil del bot actualizada correctamente (se mantiene 16:9 o 9:16).')
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    await m.reply('❌ Error al actualizar la foto: ' + (e.message || e))
  }
}

handler.command = /^setppbot$/i
export default handler