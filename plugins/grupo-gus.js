// gus.js
// Comando: .gus — devuelve el ID del grupo (xxx@g.us)

const handler = async (m, { conn }) => {
  try {
    // Verifica si el mensaje viene de un grupo
    if (!m.chat.endsWith('@g.us')) {
      await conn.reply(m.chat, '❌ Este comando solo funciona dentro de un grupo.', m);
      return;
    }

    const groupId = m.chat;
    let groupName = 'Desconocido';

    try {
      const metadata = await conn.groupMetadata(groupId);
      groupName = metadata?.subject || 'Desconocido';
    } catch {
      // si no puede obtener metadata, no pasa nada
    }

    const texto = `🆔 *ID del grupo:* ${groupId}\n📛 *Nombre:* ${groupName}`;
    await conn.reply(m.chat, texto, m);
  } catch (e) {
    console.error('[ERROR gus.js]', e);
    await conn.reply(m.chat, '⚠️ Error al obtener el ID del grupo.', m);
  }
};

handler.help = ['gus'];
handler.tags = ['group'];
handler.command = /^\.?gus$/i;

export default handler;