// Diseñado para integrarse en bot estilo Baileys (export default handler)

let handler = async (m, { conn, args }) => {
  try {
    // Reaccion al mensaje
    await m.react?.('✨').catch(() => {})

    // Envía texto
    await conn.sendMessage(m.chat, { text: 'Holaaas' }, { quoted: m })
  } catch (err) {
    console.error('Error + error exacto', err)
    // Mensaje si algo falla 
    try {
      await conn.sendMessage(m.chat, { text: 'Ups, algo salió mal.' }, { quoted: m })
    } catch (e) { /* no hacemos nada más */ }
  }
}

// Metadatos
//handler.help = ['']
handler.tags = ['']
handler.command = ['baze']

export default handler