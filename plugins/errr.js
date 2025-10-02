// plugins/err.js
import fs from 'fs'
import path from 'path'
import url from 'url'

let handler = async (m, { conn }) => {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const pluginsDir = path.join(__dirname)

  let txt = '🔍 *Revisión de plugins:*\n\n'

  for (const file of fs.readdirSync(pluginsDir)) {
    if (!file.endsWith('.js')) continue
    if (file === 'err.js') continue // evitar auto-chequeo
    const pluginPath = path.join(pluginsDir, file)

    try {
      await import(url.pathToFileURL(pluginPath).href)
      txt += `✅ ${file} cargado correctamente\n`
    } catch (err) {
      txt += `❌ ${file} → ${err.message}\n`
    }
  }

  await m.reply(txt)
}

handler.command = /^err$/i
handler.help = ['err']
handler.tags = ['herramienta']

export default handl
