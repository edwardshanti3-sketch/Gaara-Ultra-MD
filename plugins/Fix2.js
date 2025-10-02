import { join, relative } from 'path'
import { pathToFileURL } from 'url'
import { readdirSync, statSync } from 'fs'

const pluginFolder = join(process.cwd(), './plugins')
const pluginFilter = (filename) => /\.js$/.test(filename)

function getAllPluginFiles(dir, isRoot = true) {
  let files = []
  for (const file of readdirSync(dir)) {
    const fullPath = join(dir, file)
    if (statSync(fullPath).isDirectory()) {
      // solo recargar en subcarpetas
      files = files.concat(getAllPluginFiles(fullPath, false))
    } else if (!isRoot && pluginFilter(file)) {
      files.push(fullPath)
    }
  }
  return files
}

export async function reloadPlugins() {
  global.plugins = global.plugins || {}
  let cambios = []

  const allFiles = getAllPluginFiles(pluginFolder, true)
  for (const file of allFiles) {
    try {
      const modulePath = pathToFileURL(file).href + '?update=' + Date.now()
      const module = await import(modulePath)

      const name = relative(pluginFolder, file).replace(/\\/g, '/')
      global.plugins[name] = module.default || module

      // estilo git → file changed
      cambios.push(` plugins/${name} | 1 +`)
    } catch (e) {
      cambios.push(` plugins/${relative(pluginFolder, file).replace(/\\/g, '/')} | error`)
    }
  }

  return cambios
}

// Handler para .fix2 y .update2
let handler = async (m, { conn, command }) => {
  await conn.reply(m.chat, '🔄 ᴀᴄᴛᴜᴀʟɪᴢᴀɴᴅᴏ ʙᴏᴛ ᴜɴ ᴍᴏᴍᴇɴᴛᴏ...', m)

  const cambios = await reloadPlugins()

  let msg = `✅ ᴀᴄᴛᴜᴀʟɪᴢᴀᴄɪᴏɴ ᴄᴏɴ ᴇxɪᴛᴏ ᴇᴄʜᴏ\n\n`
  msg += `Updating local plugins\nFast-forward\n`
  msg += cambios.join('\n')

  conn.reply(m.chat, msg, m)
}

handler.command = /^fix2|update2$/i
export default handler