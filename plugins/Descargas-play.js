import fetch from 'node-fetch'

let handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply(`Usa: .${command} <url>`)

  try {
    let url = args[0]
    let res = await fetch(`https://loader.fo/api/v2/video?url=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error('No se pudo obtener info')
    let json = await res.json()

    if (!json || !json.result) throw new Error('Respuesta inválida')

    let info = json.result
    let vid = info.video || []
    let aud = info.audio || []

    // Texto principal
    let msg = `*Youtube - Download*\n\n` +
      `>> ${info.title}\n\n` +
      `>> Duración: ${info.duration || '??'}\n` +
      `>> Autor: ${info.author || '??'}\n` +
      `>> Publicado: ${info.date || '??'}\n` +
      `>> Url: ${info.url}`

    // Opciones para la lista
    let sections = [
      {
        title: "🎬 Video",
        rows: vid.map(v => ({
          title: `${v.quality}p`,
          rowId: `.get ${v.url}`
        }))
      },
      {
        title: "🎵 Audio",
        rows: aud.map(a => ({
          title: `${a.quality} kbps`,
          rowId: `.get ${a.url}`
        }))
      }
    ]

    // Enviar con miniatura
    await conn.sendMessage(m.chat, {
      image: { url: info.thumbnail },
      caption: msg
    }, { quoted: m })

    // Lista
    await conn.sendMessage(m.chat, {
      text: 'Elige una opción 👇',
      footer: 'Descargador YouTube',
      title: 'Opciones de descarga',
      buttonText: 'Ver formatos',
      sections
    }, { quoted: m })

  } catch (err) {
    return m.reply('❌ Error: ' + err.message)
  }
}

handler.help = ['play <url>']
handler.tags = ['downloader']
handler.command = /^play$/i

export default handler