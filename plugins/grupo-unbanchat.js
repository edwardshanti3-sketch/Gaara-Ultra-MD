let handler = async (m, { conn, text }) => {
    // Usar el chat actual si no se proporciona un número
    let chatId = text ? text : m.chat;

    // Verificar que sea un ID válido de grupo
    if (!chatId.endsWith('@g.us')) {
        return conn.reply(m.chat, '❌ Formato inválido. Usa .unbanchat <numero>@g.us o solo el chat actual.', m);
    }

    if (!(chatId in global.db.data.chats)) 
        return conn.reply(m.chat, '🔥 *¡Este chat no está registrado!*', m);

    let chat = global.db.data.chats[chatId];

    if (!chat.isBanned) 
        return conn.reply(m.chat, '👑 *¡𝚅𝙴𝙶𝙴𝚃𝙰-𝙱𝙾𝚃-𝙼𝙱 no está baneado en este chat!*', m);

    chat.isBanned = false;
    await conn.reply(m.chat, `⚡ *¡𝚅𝙴𝙶𝙴𝚃𝙰-𝙱𝙾𝚃-𝙼𝙱 ya fue desbaneado en ${chatId}!*`, m);
};

handler.help = ['unbanchat <numero>@g.us'];
handler.tags = ['grupo'];
handler.command = ['unbanchat'];

handler.private = true
handler.rowner
//handler.admin = true;
//handler.botadmin = true;
//handler.group = true;

export default handler;