import yts from 'yt-search';
import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { ogmp3 } from './ogmp3.js'; // importa tu objeto con APIs

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return conn.reply(m.chat, `⚡️ Ingresa un texto para buscar en YouTube.\n> *Ejemplo:* ${usedPrefix + command} Shakira`, m);

    await m.react('🕓');
    try {
        let searchResults = await searchVideos(args.join(" "));
        if (!searchResults.length) throw new Error('No se encontraron resultados.');

        let video = searchResults[0];
        let thumbnail = await (await fetch(video.miniatura)).buffer();

        let messageText = `*Youtube - Download*\n\n`;
        messageText += `${video.titulo}\n\n`;
        messageText += `> ❍ Duración: ${video.duracion || 'No disponible'}\n`;
        messageText += `> ❍ Autor: ${video.canal || 'Desconocido'}\n`;
        messageText += `> ❍ Publicado: ${convertTimeToSpanish(video.publicado)}\n`;
        messageText += `> ❍ Url: ${video.url}\n`;

        // Llamadas a la API de ogmp3
        const mp3Data = await ogmp3.download(video.url, '320', 'audio');
        const mp4Data = await ogmp3.download(video.url, '720', 'video');

        await conn.sendMessage(m.chat, {
            image: thumbnail,
            caption: messageText,
            footer: `𝙋𝙇𝘼𝙔 Isagi-Bot-MD⚡️`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            },
            buttons: [
                {
                    buttonId: `${usedPrefix}ytmp3 ${mp3Data?.result?.download || video.url}`,
                    buttonText: { displayText: '𝗮𝘂𝗱𝗶𝗼 🎶' },
                    type: 1,
                },
                {
                    buttonId: `${usedPrefix}ytmp4 ${mp4Data?.result?.download || video.url}`,
                    buttonText: { displayText: '𝗩𝗶𝗱𝗲𝗼 🎬' },
                    type: 1,
                }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: m });

        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('✖️');
        conn.reply(m.chat, '*`Error al buscar o descargar el video.`*', m);
    }
};

handler.help = ['play','play2'];
handler.tags = ['descargas'];
handler.command = ['play','play2'];
export default handler;

async function searchVideos(query) {
    try {
        const res = await yts(query);
        return res.videos.slice(0, 10).map(video => ({
            titulo: video.title,
            url: video.url,
            miniatura: video.thumbnail,
            canal: video.author.name,
            publicado: video.timestamp || 'No disponible',
            vistas: video.views || 'No disponible',
            duracion: video.duration.timestamp || 'No disponible'
        }));
    } catch (error) {
        console.error('Error en yt-search:', error.message);
        return [];
    }
}

function convertTimeToSpanish(timeText) {
    return timeText
        .replace(/year/, 'año').replace(/years/, 'años')
        .replace(/month/, 'mes').replace(/months/, 'meses')
        .replace(/day/, 'día').replace(/days/, 'días')
        .replace(/hour/, 'hora').replace(/hours/, 'horas')
        .replace(/minute/, 'minuto').replace(/minutes/, 'minutos');
}