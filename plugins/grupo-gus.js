// gus.js
// Plugin: devuelve el id del grupo (xxx@g.us)
// Uso: escribir ".gus" dentro de un grupo

let handler = async (m, { conn }) => {
  try {
    // Si m.isGroup no está disponible en tu framework, prueba con: if (!m.chat.endsWith('@g.us'))
    if (!m.isGroup) {
      return await conn.reply(m.chat, 'Este comando solo funciona dentro de un grupo.', m);
    }

    const groupId = m.chat; // normalmente es algo como 123456789-123456@g.us
    const groupName = (await conn.groupMetadata?.(groupId))?.subject || 'Nombre desconocido';

    const text = `ID del grupo: *${groupId}*\nNombre: *${groupName}*`;
    await conn.reply(m.chat, text, m);
  } catch (err) {
    console.error('Error en gus.js:', err);
    await conn.reply(m.chat, 'Ocurrió un error al obtener el ID del grupo.', m);
  }
};

handler.help = ['gus'];
handler.tags = ['group'];
// Acepta .gus o gus si tu framework añade el prefijo automáticamente.
// Ajusta la expresión si tu bot usa otro formato de comandos.
handler.command = /^\.?gus$/i;

module.exports = handler;