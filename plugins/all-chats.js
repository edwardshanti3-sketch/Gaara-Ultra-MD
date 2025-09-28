let handler = async (m, { conn }) => {
  try {
    const store = conn.store || {}
    const chatsObj = store.chats || conn.chats || {}
    const chats = Object.values(chatsObj)

    if (!chats.length) return m.reply('❌ No hay chats disponibles.')

    let listado = '📋 Lista de chats:\n\n'
    for (let c of chats) {
      const jid = c.id || c.key?.remoteJid || ''
      const isGroup = jid.endsWith('@g.us')
      const numero = isGroup ? '(GRUPO)' : jid.split('@')[0]
      const contacto = (store.contacts && store.contacts[jid]) ? store.contacts[jid] : {}
      const nombre = contacto?.name || contacto?.notify || c.name || 'Sin nombre'
      listado += `Numero: ${numero} | Nombre: ${nombre}\n`
    }

    await conn.sendMessage(m.chat, { text: listado.trim() })
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al listar chats: ' + String(e.message || e))
  }
}

handler.command = ['allchats']
export default handler