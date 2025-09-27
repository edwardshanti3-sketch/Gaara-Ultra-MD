import fetch from 'node-fetch'
import pkg from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto } = pkg

let handler = async (m, { conn, text }) => {
  try {
    await m.react?.('⏳')

    if (!text) return m.reply('❌ Usa el formato:\n.ctg destinatario|imagen|titulo/descripcion|precio')

    let [destinatario, imagen, titulo, precio] = text.split('|')
    if (!titulo) titulo = 'Producto'
    if (!precio) precio = '0 USD'

    if (!destinatario || destinatario === '-') destinatario = m.chat
    else if (!destinatario.includes('@')) {
      if (!destinatario.endsWith('g.us')) destinatario += '@s.whatsapp.net'
    }

    let imgBuffer = null
    if (imagen && imagen !== '-') {
      const res = await fetch(imagen)
      imgBuffer = Buffer.from(await res.arrayBuffer())
    }

    let quotedMetaAI = {
      key: {
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Halo"
      },
      message: {
        contactMessage: {
          displayName: "Meta AI",
          vcard: "BEGIN:VCARD\nVERSION:3.0\nN:XL;Meta AI;;;\nFN:Meta AI\nitem1.TEL;waid=13135550002:13135550002\nEND:VCARD"
        }
      }
    }

    let caption = `🛒 *${titulo}*\n💰 Precio: ${precio}`

    await conn.sendMessage(destinatario, { image: imgBuffer, caption: caption }, { quoted: quotedMetaAI })

    await m.react?.('✅')
  } catch (e) {
    console.error('ERROR REAL ->', e) // Muestra error completo en consola
    await m.react?.('❌')
    // Muestra mensaje exacto en el chat
    m.reply(`⚠️ Error al procesar el catálogo:\n${e.message}\n\nStack trace:\n${e.stack}`)
  }
}

handler.command = /^ctg$/i
export default handler