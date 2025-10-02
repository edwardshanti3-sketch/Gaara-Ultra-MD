/*module.exports = {
    name: 'setname',
    description: 'Cambia el nombre del bot en WhatsApp',
    run: async ({ message, sock, args }) => {
        const newName = args.join(' ');
        const jid = sock?.user?.id;

        if (!newName) {
            return await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Debes escribir un nombre.\n\nEjemplo: `.setname MiBot`'
            }, { quoted: message });
        }

        try {
            await sock.updateProfileName(newName);
            await sock.sendMessage(message.key.remoteJid, {
                text: `✅ El nombre fue cambiado a *${newName}* exitosamente.`
            }, { quoted: message });
        } catch (err) {
            console.error('Error al cambiar nombre:', err);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Ocurrió un error al cambiar el nombre. Asegúrate de que el número tenga permisos.'
            }, { quoted: message });
        }
    }
};*/
