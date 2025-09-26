// plugins/setppbot.js
import pkg from '@whiskeysockets/baileys'
const { downloadContentFromMessage } = pkg

let handler = async (m, { conn }) => {
  try {
    await m.react?.('⏳')

    // 🔹 Mensaje origen (quoted o actual)
    const targetMsg = m.quoted ? m.quoted : m

    // 🔹 Detectar imagen en distintos tipos de mensaje
    const imageMessage =
      targetMsg?.message?.imageMessage ||
      targetMsg?.msg?.message?.imageMessage ||
      targetMsg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage

    const documentMessage =
      targetMsg?.message?.documentMessage ||
      targetMsg?.msg?.message?.documentMessage

    let msgType = null
    if (imageMessage) msgType = { data: imageMessage, type: 'image' }
    else if (
      documentMessage &&
      /image\/(jpeg|jpg|png)/.test(documentMessage.mimetype)
    ) {
      msgType = { data: documentMessage, type: 'document' }
    }

    if (!msgType) {
      return m.reply(
        '❌ Responde o envía una *imagen* o *documento JPG/PNG* con `.setppbot`.'
      )
    }

    // 🔹 Descargar el contenido
    const stream = await downloadContentFromMessage(msgType.data, 'document')
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // 🔹 JID del bot
    const botJid =
      (conn.user && (conn.user.id || conn.user.jid || conn.user)) || conn.user

    // 🔹 Subir foto de perfil
    if (typeof conn.updateProfilePicture === 'function') {
      await conn.updateProfilePicture(botJid, buffer)
    } else if (typeof conn.setProfilePicture === 'function') {
      await conn.setProfilePicture(botJid, buffer)
    } else if (typeof conn.profilePictureUpdate === 'function') {
      await conn.profilePictureUpdate(botJid, buffer)
    } else {
      throw new Error('Método de actualización no encontrado en bails.')
    }

    await m.react?.('✅')
    await m.reply('✅ Foto de perfil del bot actualizada (imagen o documento).')
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    await m.reply('❌ Error al actualizar la foto: ' + (e.message || e))
  }
}

handler.command = /^setppbot$/i
export default handler