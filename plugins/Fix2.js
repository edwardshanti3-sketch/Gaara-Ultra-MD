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
      // solo entramos a las subcarpetas
      files = files.concat(getAllPluginFiles(fullPath, false))
    } else if (!isRoot && pluginFilter(file)) {
      // si estamos en una subcarpeta y es .js, lo agregamos
      files.push(fullPath)
    }
  }
  return files
}

export async function reloadPlugins() {
  global.plugins = global.plugins || {}
  let recargados = []

  const allFiles = getAllPluginFiles(pluginFolder, true)
  for (const file of allFiles) {
    try {
      const modulePath = pathToFileURL(file).href + '?update=' + Date.now()
      const module = await import(modulePath)

      const name = relative(pluginFolder, file).replace(/\\/g, '/')
      global.plugins[name] = module.default || module

      recargados.push(`✅ ${name}`)
    } catch (e) {
      recargados.push(`❌ Error: ${relative(pluginFolder, file).replace(/\\/g, '/')}`)
    }
  }

  // Si no hubo errores ni recargas nuevas, devolvemos el mensaje único
  return recargados.length > 0 ? recargados : ['✅ Las sub carpetas están actualizadas']
}

// Handler para .fix2 y .update2
let handler = async (m, { conn, command }) => {
  await m.react?.('⏳')
  const lista = await reloadPlugins()
  await m.react?.('✅')

  conn.reply(
    m.chat,
    `♻️ *Plugins recargados (${command})*\n\n${lista.join('\n')}`,
    m
  )
}

handler.command = /^fix2|update2$/i
export default handler