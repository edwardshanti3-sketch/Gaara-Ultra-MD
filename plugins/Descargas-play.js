import { ytSearch, ytv, yta } from 'api-dylux'

let handler = async (m, { conn, args, command }) => {
  if (command === 'play') {
    if (!args[0]) return m.reply(`Usa: .${command} <nombre o url>`)

    try {
      let q = args.join(" ")
      let search = await ytSearch(q)
      if (!search || !search.videos.length) return m.reply('No se encontró nada.')

      let first = search.videos[0]
      let { title, url, thumbnail, duration, author, publishedTime } = first

      let msg = `*Youtube - Download*  
  
>> ${title}  
  
>> Duración: ${duration || '??'}  
>> Autor: ${author?.name || '??'}  
>> Publicado: ${publishedTime || '??'}  
>> Url: ${url}`

      let resolutions = ['144p','240p','360p','480p','720p','1080p']
      let videoRows = resolutions.map(r => ({
        title: `📹 ${r}`,
        rowId: `.playvideo ${url} ${r}`
      }))

      let audios = ['128kbps','192kbps','256kbps','320kbps']
      let audioRows = audios.map(a => ({
        title: `🎵 ${a}`,
        rowId: `.playaudio ${url} ${a}`
      }))

      let sections = [
        { title: "🎬 Video", rows: videoRows },
        { title: "🎵 Audio", rows: audioRows }
      ]

      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
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
      m.reply('❌ Error: No se pudo obtener info')
    }
  }

  if (command === 'playvideo') {
    let [url, quality] = args
    if (!url) return m.reply('Dame un enlace de YouTube')
    try {
      let res = await ytv(url, quality || '360p')
      await conn.sendMessage(m.chat, {
        video: { url: res.dl_url },
        mimetype: 'video/mp4',
        caption: `🎬 ${res.title}\n📥 Calidad: ${quality}`
      }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error al descargar video: ${e.message}`)
    }
  }

  if (command === 'playaudio') {
    let [url, quality] = args
    if (!url) return m.reply('Dame un enlace de YouTube')
    try {
      let res = await yta(url, quality || '128kbps')
      await conn.sendMessage(m.chat, {
        audio: { url: res.dl_url },
        mimetype: 'audio/mpeg',
        ptt: false,
        caption: `🎵 ${res.title}\n📥 Calidad: ${quality}`
      }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error al descargar audio: ${e.message}`)
    }
  }
}

handler.help = ['play <nombre|url>']
handler.tags = ['downloader']
handler.command = /^(play|playvideo|playaudio)$/i

export default handler