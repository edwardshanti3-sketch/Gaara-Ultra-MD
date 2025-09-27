// plugins/setppbot.js
import pkg from '@whiskeysockets/baileys'
import { generateProfilePicture } from 'baileys/lib/Utils' // 📌 ajusta la ruta si no coincide
const { downloadContentFromMessage } = pkg

let handler = async (m, { conn }) => {
  try {
    await m.react?.('⏳')

    const targetMsg = m.quoted ? m.quoted : m
    const imageMessage =
      targetMsg?.message?.imageMessage ||
      targetMsg?.msg?.message?.imageMessage ||
      targetMsg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage

    if (!imageMessage) {
      return m.reply('❌ Responde o envía una *imagen* y usa `.setppbot`.')
    }

    const stream = await downloadContentFromMessage(imageMessage, 'image')
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // 🔹 Procesar con generateProfilePicture modificado (sin recorte)
    const { img } = await generateProfilePicture(buffer)

    const botJid = (conn.user && (conn.user.id || conn.user.jid || conn.user)) || conn.user

    await conn.updateProfilePicture(botJid, img)

    await m.react?.('✅')
    await m.reply('✅ Foto de perfil del bot actualizada correctamente (16:9 o 9:16).')
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