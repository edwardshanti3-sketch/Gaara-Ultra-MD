import pkg from '@whiskeysockets/baileys'
const { downloadContentFromMessage, generateProfilePicture } = pkg

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

    // 🔹 Descargar la imagen
    const stream = await downloadContentFromMessage(imageMessage, 'image')
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // 🔹 Procesar con generateProfilePicture (lo que espera WhatsApp)
    const { img } = await generateProfilePicture(buffer)

    // 🔹 JID del bot
    const botJid = conn.user?.id || conn.user?.jid || conn.user

    // 🔹 Actualizar foto
    await conn.updateProfilePicture(botJid, img)

    await m.react?.('✅')
    await m.reply('✅ Foto de perfil del bot actualizada.')
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    await m.reply('❌ Error al actualizar la foto: ' + (e.message || e))
  }
}

handler.command = /^setppbot$/i
export default handler