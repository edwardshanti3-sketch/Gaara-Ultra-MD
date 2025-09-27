import Jimp from 'jimp'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react?.('⏳')

    // 🔹 Buscar imagen en el mensaje citado o actual
    const q = m.quoted ? m.quoted : m
    const mime =
      (q.msg || q).mimetype ||
      q?.message?.imageMessage?.mimetype ||
      q?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.mimetype ||
      ''

    if (!/image/.test(mime)) {
      throw `❌ Responde a una *imagen* usando el comando ${usedPrefix + command}`
    }

    // 🔹 Descargar buffer de imagen
    const imgBuffer =
      (await q.download?.()) ||
      (await q?.message?.imageMessage?.download?.()) ||
      null

    if (!imgBuffer) throw '❌ No se pudo descargar la imagen'

    // 🔹 Procesar con Jimp
    const image = await Jimp.read(imgBuffer)
    const width = image.getWidth()
    const height = image.getHeight()

    const aspect = width / height
    let resized, formato

    if (Math.abs(aspect - 1) < 0.1) {
      resized = image.cover(640, 640)
      formato = `1:1 (${width}x${height})`
    } else if (aspect > 1) {
      resized = image.resize(640, Jimp.AUTO)
      formato = `Horizontal (${width}x${height})`
    } else {
      resized = image.resize(Jimp.AUTO, 640)
      formato = `Vertical (${width}x${height})`
    }

    const finalBuffer = await resized.getBufferAsync(Jimp.MIME_JPEG)

    // 🔹 Mandar query directa a WhatsApp
    await conn.query({
      tag: 'iq',
      attrs: {
        to: conn.user.id,
        type: 'set',
        xmlns: 'w:profile:picture'
      },
      content: [{
        tag: 'picture',
        attrs: { type: 'image' },
        content: finalBuffer
      }]
    })

    await m.react?.('✅')
    await conn.reply(
      m.chat,
      `✅ Foto de perfil del bot actualizada\n> Proporción detectada: *${formato}*`,
      m
    )
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    await conn.reply(
      m.chat,
      `❌ Error exacto al actualizar la foto:\n\`\`\`${e?.message || e}\`\`\``,
      m
    )
  }
}

handler.command = /^setppbot$/i
handler.rowner = true
export default handler