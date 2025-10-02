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
      files = files.concat(getAllPluginFiles(fullPath, false))
    } else if (!isRoot && pluginFilter(file)) {
      files.push(fullPath)
    }
  }
  return files
}

export async function reloadPlugins() {
  global.plugins = global.plugins || {}
  global._lastPlugins = global._lastPlugins || {}

  let recargados = []
  let allFiles = getAllPluginFiles(pluginFolder, true)

  for (const file of allFiles) {
    try {
      const name = relative(pluginFolder, file).replace(/\\/g, '/')
      const modulePath = pathToFileURL(file).href + '?update=' + Date.now()
      const module = await import(modulePath)

      let oldModule = global._lastPlugins[name]
      global.plugins[name] = module.default || module
      global._lastPlugins[name] = module.default || module

      if (!oldModule) {
        recargados.push(` plugins/${name} | 1 +`)
      }
    } catch (e) {
      // si falla, lo puedes registrar si quieres
    }
  }

  return recargados
}

// Handler para .fix2 y .update2
let handler = async (m, { conn, command }) => {
  await conn.reply(m.chat, '🔄 ᴀᴄᴛᴜᴀʟɪᴢᴀɴᴅᴏ ʙᴏᴛ ᴜɴ ᴍᴏᴍᴇɴᴛᴏ...', m)

  const cambios = await reloadPlugins()
  let msg

  if (cambios.length > 0) {
    msg = `✅ ᴀᴄᴛᴜᴀʟɪᴢᴀᴄɪᴏɴ ᴄᴏɴ ᴇxɪᴛᴏ ᴇᴄʜᴏ\n\n`
    msg += `Updating local plugins\nFast-forward\n`
    msg += cambios.join('\n')

    // Conteo estilo git
    msg += `\n ${cambios.length} file(s) changed, ${cambios.length} insertion(+)`
  } else {
    msg = `Already up to date.`
  }

  conn.reply(m.chat, msg, m)
}

handler.command = /^fix2|update2$/i
export default handler