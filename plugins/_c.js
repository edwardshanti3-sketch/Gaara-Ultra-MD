import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import fs from 'fs';

let handler = async (m, { conn, text, quoted }) => {
    try {
        if (!text) return m.reply('❌ Usa el formato:\n.ctg titulo|descripcion|precio|url_imagen');

        // Separar los datos
        let [title, description, price, imageUrl] = text.split('|');
        if (!title || !description || !price || !imageUrl) 
            return m.reply('❌ Formato incorrecto.\nEjemplo:\n.ctg Camisa|Linda camisa azul|25.00|https://iili.io/K030s44.jpg');

        // Descargar la imagen
        const res = await fetch(imageUrl);
        const buffer = Buffer.from(await res.arrayBuffer());

        // Producto (simulado)
        const productMessage = {
            productMessage: {
                product: {
                    productImage: { 
                        jpegThumbnail: buffer 
                    },
                    title: title,
                    description: description,
                    currencyCode: 'USD',
                    priceAmount1000: parseFloat(price) * 1000, // WhatsApp requiere *1000
                    retailerId: 'byGP', // ID de ejemplo
                    productImageCount: 1
                },
                businessOwnerJid: conn.user.jid
            }
        };

        const waMessage = generateWAMessageFromContent(
            m.chat,
            proto.Message.fromObject(productMessage),
            { quoted: m }
        );

        await conn.relayMessage(m.chat, waMessage.message, { messageId: waMessage.key.id });
        await m.react('✅');

    } catch (err) {
        console.log(err);
        m.reply('❌ Error al enviar el catálogo.');
    }
};

handler.command = ['ctg'];
export default handler;