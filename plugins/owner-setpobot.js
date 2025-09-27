import Jimp from 'jimp'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react?.('⏳')

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) {
      throw `❌ Responde a una *imagen* usando el comando ${usedPrefix + command}`
    }

    // 🔹 Descargar la imagen
    const imgBuffer = await q.download()
    if (!imgBuffer) throw '❌ No se pudo descargar la imagen'

    // 🔹 Leer con Jimp
    const image = await Jimp.read(imgBuffer)
    const width = image.getWidth()
    const height = image.getHeight()

    // 📏 Detectar proporción
    const aspect = width / height
    let resized, formato

    if (Math.abs(aspect - 1) < 0.1) {
      // Cuadrada
      resized = image.cover(640, 640)
      formato = '1:1 (cuadrado)'
    } else if (aspect > 1) {
      // Horizontal
      resized = image.resize(640, Jimp.AUTO)
      formato = 'Horizontal'
    } else {
      // Vertical
      resized = image.resize(Jimp.AUTO, 640)
      formato = 'Vertical'
    }

    // 🔹 Convertir a buffer JPEG
    const finalBuffer = await resized.getBufferAsync(Jimp.MIME_JPEG)

    // 🔹 Mandar query directa
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
      `❌ Error al actualizar la foto de perfil:\n\`\`\`${e?.message || e}\`\`\``,
      m
    )
  }
}

handler.command = /^setppbot$/i
handler.rowner = true
export default handler