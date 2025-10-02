import { join, relative } from 'path'
import { pathToFileURL } from 'url'
import { readdirSync, statSync } from 'fs'

const pluginFolder = join(process.cwd(), './plugins')
const pluginFilter = (filename) => /\.js$/.test(filename)

function getAllPluginFiles(dir) {
  let files = []
  for (const file of readdirSync(dir)) {
    const fullPath = join(dir, file)
    if (statSync(fullPath).isDirectory()) {
      files = files.concat(getAllPluginFiles(fullPath))
    } else if (pluginFilter(file)) {
      files.push(fullPath)
    }
  }
  return files
}

export async function reloadPlugins() {
  global.plugins = global.plugins || {}

  const allFiles = getAllPluginFiles(pluginFolder)
  for (const file of allFiles) {
    try {
      // Elimina versión cacheada con query param dinámico
      const modulePath = pathToFileURL(file).href + '?update=' + Date.now()
      const module = await import(modulePath)

      const name = relative(pluginFolder, file).replace(/\\/g, '/')
      global.plugins[name] = module.default || module

      console.log(`🔄 Plugin recargado: ${name}`)
    } catch (e) {
      console.error(`⚠️ Error al recargar ${file}`, e)
    }
  }
}

// Handler para .fix2 y .update2
let handler = async (m, { conn, command }) => {
  try {
    await m.react?.('⏳')
    await reloadPlugins()
    await m.react?.('✅')
    conn.reply(m.chat, `♻️ *Plugins recargados con éxito* *${name}*`, m)
  } catch (e) {
    await m.react?.('❌')
    conn.reply(m.chat, `⚠️ Error al recargar plugins:\n${e.message}`, m)
  }
}

handler.command = /^fix2|update2$/i
export default handler