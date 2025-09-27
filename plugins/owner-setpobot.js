// plugins/setppbot.js
import pkg from '@whiskeysockets/baileys'
const { downloadContentFromMessage } = pkg

let handler = async (m, { conn }) => {
  try {
    await m.react?.('⏳')

    // 🔹 Usar mensaje citado si existe, si no el actual
    const targetMsg = m.quoted ? m.quoted : m

    // 🔹 Intentar capturar imageMessage
    const imageMessage =
      targetMsg?.message?.imageMessage ||           // si es imagen normal
      targetMsg?.msg?.message?.imageMessage ||      // a veces en bails va en msg
      targetMsg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage // casos raros

    if (!imageMessage) {
      return m.reply('❌ Responde o envía una *imagen* y usa `.setppbot`.')
    }

    // 🔹 Descargar la imagen
    const stream = await downloadContentFromMessage(imageMessage, 'image')
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // 🔹 JID del bot
    const botJid = (conn.user && (conn.user.id || conn.user.jid || conn.user)) || conn.user

    // 🔹 Subir foto
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
    await m.reply('✅ Foto de perfil del bot actualizada (respetando proporción).')
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    await m.reply('❌ Error al actualizar la foto: ' + (e.message || e))
  }
}

handler.command = /^setppbot$/i
export default handler


/*No olvides agregar a Baileys/lib/Utils/messages-media.js


const generateProfilePicture = async (mediaUpload) => {
    let bufferOrFilePath;
    let img;
    if (Buffer.isBuffer(mediaUpload)) {
        bufferOrFilePath = mediaUpload;
    }
    else if ('url' in mediaUpload) {
        bufferOrFilePath = mediaUpload.url.toString();
    }
    else {
        bufferOrFilePath = await (0, exports.toBuffer)(mediaUpload.stream);
    }
    const jimp = await jimp_1.default.read(bufferOrFilePath);

    // 🔹 Mantener proporción original (sin recorte)
    img = jimp
        .quality(100)
        .getBufferAsync(jimp_1.default.MIME_JPEG);

    return {
        img: await img,
    };
};

En la linea 320 aproximadamente*/