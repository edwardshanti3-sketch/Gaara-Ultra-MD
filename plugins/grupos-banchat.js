let handler = async (m, { conn, text }) => {
    // Si el usuario pone un número con @g.us, lo usamos como chatId
    let chatId = text ? text : m.chat;

    // Verificamos que sea un ID válido de grupo
    if (!chatId.endsWith('@g.us')) {
        return conn.reply(m.chat, '❌ Formato inválido. Usa .banchat <numero>@g.us o solo el chat actual.', m);
    }

    // Marcamos el chat como baneado
    if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};
    global.db.data.chats[chatId].isBanned = true;

    conn.reply(m.chat, `👑 *ᴇsᴛᴇ ᴄʜᴀᴛ ${chatId} ғᴜᴇ ʙᴀɴᴇᴀᴅᴏ ᴄᴏɴ ᴇxɪᴛᴏ*`, m);
};

handler.help = ['banchat <numero>@g.us'];
handler.tags = ['grupo'];
handler.command = ['banchat'];

handler.botuser = true;
//handler.admin = true;
//handler.group = true;

export default handler;