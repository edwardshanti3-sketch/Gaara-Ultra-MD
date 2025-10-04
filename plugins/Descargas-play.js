import { ytv, yta, ytSearch } from 'api-dylux'

let handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply(`Usa: .${command} <nombre o url>`)

  try {
    let q = args.join(" ")
    let videoUrl = ''
    let title = ''
    let seconds = ''
    let author = ''
    let date = ''
    let thumb = ''

    if (q.includes("youtube.com") || q.includes("youtu.be")) {
      // Directo con URL
      let info = await ytv(q, '360p') // solo para sacar info, no descarga
      videoUrl = q
      title = info.title
      seconds = info.seconds
      author = info.author
      thumb = info.thumb
    } else {
      // Búsqueda por nombre
      let search = await ytSearch(q)
      if (!search || !search.videos.length) return m.reply('No se encontró nada.')
      let first = search.videos[0]
      videoUrl = first.url
      title = first.title
      seconds = first.duration
      author = first.author.name
      thumb = first.thumbnail
      date = first.publishedTime
    }

    let msg = `*Youtube - Download*\n\n` +
      `>> ${title}\n\n` +
      `>> Duración: ${seconds || '??'}\n` +
      `>> Autor: ${author || '??'}\n` +
      `>> Publicado: ${date || '??'}\n` +
      `>> Url: ${videoUrl}`

    // Definir resoluciones manuales comunes
    let resolutions = ['144p','240p','360p','480p','720p','1080p']
    let videoRows = resolutions.map(r => ({
      title: r,
      rowId: `.getvideo ${videoUrl} ${r}`
    }))

    // Definir audios típicos
    let audios = ['128kbps','160kbps','192kbps','256kbps','320kbps']
    let audioRows = audios.map(a => ({
      title: a,
      rowId: `.getaudio ${videoUrl} ${a}`
    }))

    let sections = [
      { title: "🎬 Video", rows: videoRows },
      { title: "🎵 Audio", rows: audioRows }
    ]

    await conn.sendMessage(m.chat, {
      image: { url: thumb },
      caption: msg
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      text: 'Elige una opción 👇',
      footer: 'Descargador YouTube',
      title: 'Opciones de descarga',
      buttonText: 'Ver formatos',
      sections
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Error al obtener información.')
  }
}

handler.help = ['play <nombre|url>']
handler.tags = ['downloader']
handler.command = /^play$/i

export default handler