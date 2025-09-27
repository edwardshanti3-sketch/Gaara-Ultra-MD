import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } from "@whiskeysockets/baileys"  
import qrcode from "qrcode"  
import NodeCache from "node-cache"  
import fs from "fs"  
import path from "path"  
import pino from 'pino'  
import chalk from 'chalk'  
import * as ws from 'ws'  
import { fileURLToPath } from 'url'  
import { makeWASocket } from '../lib/simple.js'  
  
const { exec } = await import('child_process')  
const { CONNECTING } = ws  
  
const __filename = fileURLToPath(import.meta.url)  
const __dirname = path.dirname(__filename)  
  
let crm1 = "Y2QgcGx1Z2lucy"  
let crm2 = "A7IG1kNXN1b"  
let crm3 = "SBpbmZvLWRvbmFyLmpz"  
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"  
  
let drm1 = ""  
let drm2 = ""  
  
let rtx = `𝙂𝘼𝘼𝙍𝘼-𝙐𝙇𝙏𝙍𝘼-𝙈𝘿 𝘾𝙊𝙉𝙀𝙓𝙄𝙊𝙉 ⚡   
> ✦ 𝙲𝙾𝙽𝙴𝚇𝙸Ó𝙽 𝚂𝚄𝙱-𝙱𝙾𝚃 (𝙼𝙾𝙳𝙾 𝚀𝚁) 🚀    
  
⚡︎ 𝙰𝙿𝚄𝙽𝚃𝙰 𝙴𝙻 𝙲Ó𝙳𝙸𝙶𝙾 𝚀𝚁 𝙲𝙾𝙽 𝙾𝚃𝚁𝙾 𝙳𝙸𝚂𝙿𝙾𝚂𝙸𝚃𝙸𝚅𝙾 𝙾 𝙿𝙲 𝚈 𝚃𝚁𝙰𝙽𝚂𝙵𝙾𝚁𝙼𝙰 𝚃𝚄 𝙲𝙾𝙽𝙴𝚇𝙸Ó𝙽 𝙴𝙽 𝚄𝙽 *𝚂𝚄𝙱-𝙱𝙾𝚃 𝙰𝙲𝚃𝙸𝚅𝙾*.    
  
➺ ❶ 𝙰𝙱𝚁𝙴 𝙻𝙾𝚂 𝚃𝚁𝙴𝚂 𝙿𝚄𝙽𝚃𝙾𝚂 𝙴𝙽 𝙻𝙰 𝙴𝚂𝙲𝚄𝚁𝙰 𝚂𝚄𝙿𝙴𝚁𝙸𝙾𝚁.    
➺ ❷ 𝚅𝙰 𝙰 *"𝙳𝙸𝚂𝙿𝙾𝚂𝙸𝚃𝙸𝚅𝙾𝚂 𝚅𝙸𝙽𝙲𝚄𝙻𝙰𝙳𝙾𝚂"*.    
➺ ❸ 𝙴𝚂𝙲𝙰𝙽𝙴 𝙴𝙻 𝙲Ó𝙳𝙸𝙶𝙾 𝚀𝚁 𝙲𝙾𝙽É𝙲𝚃𝙰𝚃𝙴 𝙰𝙻 𝙱𝙾𝚃.    
  
⚠️ 𝙴𝙻 𝙲Ó𝙳𝙸𝙶𝙾 𝚀𝚁 𝙴𝚇𝙿𝙸𝚁𝙰 𝙴𝙽 ❺❹ 𝚂𝙴𝙶𝚄𝙽𝙳𝙾𝚂. 𝙽𝙾 𝙿𝙸𝙴𝚁𝙳𝙰𝚂 𝚃𝙸𝙴𝙼𝙿𝙾.    
`;  
  
let rtx2 = `𝙂𝘼𝘼𝙍𝘼-𝙐𝙇𝙏𝙍𝘼-𝙈𝘿 𝘾𝙊𝙉𝙀𝙓𝙄𝙊𝙉 ⚡  
> ✦ 𝙲𝙾𝙽𝙴𝚇𝙸𝙾𝙽 𝚂𝚄𝙱-𝙱𝙾𝚃 (𝙼𝙾𝙳𝙾 𝙲𝙾𝙳𝙸𝙶𝙾) 👑     
  
⚡︎ 𝚄𝚂𝙰 𝙴𝚂𝚃𝙴 𝙲Ó𝙳𝙸𝙶𝙾 𝙿𝙰𝚁𝙰 𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙸𝚁𝚃𝙴 𝙴𝙽 𝚄𝙽 *𝚂𝚄𝙱-𝙱𝙾𝚃 𝚃𝙴𝙼𝙿𝙾𝚁𝙰𝙻*.    
  
➺ ❶ 𝙰𝙱𝚁𝙴 𝙻𝙾𝚂 𝚃𝚁𝙴𝚂 𝙿𝚄𝙽𝚃𝙾𝚂 𝙴𝙽 𝙻𝙰 𝙴𝚂𝚀𝚄𝙸𝙽𝙰 𝚂𝚄𝙿𝙴𝚁𝙸𝙾𝚁.    
➺ ❷ 𝚅𝙰 𝙰 *"𝙳𝙸𝚂𝙿𝙾𝚂𝙸𝚃𝙸𝚅𝙾𝚂 𝚅𝙸𝙽𝙲𝚄𝙻𝙰𝙳𝙾𝚂"*.    
➺ ❸ 𝙴𝚂𝙲𝙰𝙽𝙴 𝙴𝙻 𝙲Ó𝙳𝙸𝙶𝙾 𝚀𝚁 𝙲𝙾𝙽É𝙲𝚃𝙰𝚃𝙴 𝙰𝙻 𝙱𝙾𝚃.    
  
⚠️ 𝙴𝙻 𝙲Ó𝙳𝙸𝙶𝙾 𝚀𝚁 𝙴𝚇𝙿𝙸𝚁𝙰 𝙴𝙽 ❺❹ 𝚂𝙴𝙶𝚄𝙽𝙳𝙾𝚂. 𝙽𝙾 𝙿𝙸𝙴𝚁𝙳𝙰𝚂 𝚃𝙸𝙴𝙼𝙿𝙾.    
`;  
  
/*let imagenUrl = '';*/  
  
const maxSubBots = 324  
  
let vegetaJBOptions = {}  
  
if (!global.conns) global.conns = []  
  
function msToTime(duration) {  
  var seconds = Math.floor((duration / 1000) % 60),  
      minutes = Math.floor((duration / (1000 * 60)) % 60)  
  minutes = (minutes < 10) ? '0' + minutes : minutes  
  seconds = (seconds < 10) ? '0' + seconds : seconds  
  return minutes + ' m y ' + seconds + ' s '  
}  
  
let handler = async (m, { conn, args, usedPrefix, command }) => {  
  if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {  
    return m.reply(`El Comando *${command}* está desactivado temporalmente.`)  
  }  
  
  //let time = global.db.data.users[m.sender].Subs + 120000  
  //if (new Date() - global.db.data.users[m.sender].Subs < 120000) {  
    //return conn.reply(m.chat, `⏳ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)  
  //}  
  
  const subBots = [...new Set(  
    global.conns.filter(c =>  
      c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED  
    ).map(c => c)  
  )]  
  
  const subBotsCount = subBots.length  
  
  if (subBotsCount >= maxSubBots) {  
    return m.reply(`❌ No se han encontrado espacios para *Sub-Bots* disponibles.`)  
  }  
  
  const availableSlots = maxSubBots - subBotsCount  
  
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender  
  let id = `${who.split('@')[0]}`  
  let pathvegetaJadiBot = path.join(`./vegetaJadiBot/`, id)  
  // 👇 Antes de cambiar command, guarda el original
let originalCommand = command  

if (command === 'code' || command === 'start') {  
  command = 'qr'  
  args.unshift('code')  
}

// 👇 Bloque final de mensaje corregido
if (m?.chat) {  
  let msg  
  if (originalCommand === 'start') {  
    msg = `@${m.sender.split('@')[0]}, has encendido y activado tu Sub-Bot con éxito 🚀`  
  } else {  
    msg = args[0]  
      ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...`  
      : `@${m.sender.split('@')[0]}, genial ya eres parte de nuestra familia de Sub-Bots.`  
  }  
  await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender] }, { quoted: m })  
}
  if (!fs.existsSync(pathvegetaJadiBot)) {  
    fs.mkdirSync(pathvegetaJadiBot, { recursive: true })  
  }  
  
  vegetaJBOptions.pathvegetaJadiBot = pathvegetaJadiBot  
  vegetaJBOptions.m = m  
  vegetaJBOptions.conn = conn  
  vegetaJBOptions.args = args  
  vegetaJBOptions.usedPrefix = usedPrefix  
  vegetaJBOptions.command = command  
  vegetaJBOptions.fromCommand = true  
  
  await vegetaJadiBot(vegetaJBOptions)  
  
  global.db.data.users[m.sender].Subs = new Date() * 1  
}  
  
handler.help = ['qr', 'code']  
handler.command = ['qr', 'code']

export default handler

export async function vegetaJadiBot(options) {
let { pathvegetaJadiBot, m, conn, args, usedPrefix, command } = options
if (command === 'code') {
command = 'qr'
args.unshift('code')
}
const mcode = args[0] && /(--code|code)/.test(args[0].trim())
? true
: args[1] && /(--code|code)/.test(args[1].trim())
? true
: false
let txtCode, codeBot, txtQR
if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}
const pathCreds = path.join(pathvegetaJadiBot, "creds.json")
if (!fs.existsSync(pathvegetaJadiBot)) {
fs.mkdirSync(pathvegetaJadiBot, { recursive: true })
}
try {
if (args[0] && args[0] != undefined) {
fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
}
} catch {
conn.reply(m.chat, ⚠️ Use correctamente el comando » ${usedPrefix + command}, m)
return
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const { version } = await fetchLatestBaileysVersion()
const msgRetry = () => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathvegetaJadiBot)

const connectionOptions = {    
  logger: pino({ level: "fatal" }),    
  printQRInTerminal: false,    
  auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },    
  msgRetry,    
  msgRetryCache,    
  browser: mcode ? Browsers.macOS("Chrome") : Browsers.macOS("Desktop"),    
  version: version,    
  generateHighQualityLinkPreview: true    
}    

let sock = makeWASocket(connectionOptions)    
sock.isInit = false    
let isInit = true    

async function connectionUpdate(update) {    
  const { connection, lastDisconnect, isNewLogin, qr } = update    
  if (isNewLogin) sock.isInit = false    
  if (qr && !mcode) {    
    if (m?.chat) {    
      txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() }, { quoted: m })    
    } else {    
      return    
    }    
    if (txtQR && txtQR.key) {    
      setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }) }, 30000)    
    }    
    return    
  }    
  if (qr && mcode) {    
    let secret = await sock.requestPairingCode((m.sender.split('@')[0]))    
    secret = secret.match(/.{1,4}/g)?.join("-")    
    txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })    
    codeBot = await m.reply(secret)    
    console.log(secret)    
  }    
  if (txtCode && txtCode.key) {    
    setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 30000)    
  }    
  if (codeBot && codeBot.key) {    
    setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }) }, 30000)    
  }    
  const endSesion = async (loaded) => {    
    if (!loaded) {    
      try {    
        sock.ws.close()    
      } catch { }    
      sock.ev.removeAllListeners()    
      let i = global.conns.indexOf(sock)    
      if (i < 0) return    
      delete global.conns[i]    
      global.conns.splice(i, 1)    
    }    
  }    

  const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode    
  if (connection === 'close') {    
    if (reason === 428 || reason === 408) {    
      console.log(chalk.bold.magentaBright(`\n╭─────────────────────────\n│ La conexión (+${path.basename(pathvegetaJadiBot)}) fue cerrada inesperadamente o expiró. Intentando reconectar...\n╰─────────────────────────`))    
      await creloadHandler(true).catch(console.error)    
    }    
    if (reason === 440) {    
      console.log(chalk.bold.magentaBright(`\n╭─────────────────────────\n│ La conexión (+${path.basename(pathvegetaJadiBot)}) fue reemplazada por otra sesión activa.\n╰─────────────────────────`))    
      try {    
        if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathvegetaJadiBot)}@s.whatsapp.net`, { //text: 'HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR\n\n> SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE'

}, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(Error 440 no se pudo enviar mensaje a: +${path.basename(pathvegetaJadiBot)}))
}
}
if (reason == 405 || reason == 401) {
console.log(chalk.bold.magentaBright(\n╭─────────────────────────\n│ La sesión (+${path.basename(pathvegetaJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n╰─────────────────────────))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(${path.basename(pathvegetaJadiBot)}@s.whatsapp.net, { text: 'SESIÓN PENDIENTE\n\n> INTENTÉ NUEVAMENTE VOLVER A SER SUB-BOT' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(Error 405 no se pudo enviar mensaje a: +${path.basename(pathvegetaJadiBot)}))
}
fs.rmdirSync(pathvegetaJadiBot, { recursive: true })
}
if (reason === 500) {
console.log(chalk.bold.magentaBright(\n╭─────────────────────────\n│ Conexión perdida en la sesión (+${path.basename(pathvegetaJadiBot)}). Borrando datos...\n╰─────────────────────────))
if (options.fromCommand) m?.chat ? await conn.sendMessage(${path.basename(pathvegetaJadiBot)}@s.whatsapp.net, { text: 'CONEXIÓN PÉRDIDA\n\n> INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT' }, { quoted: m || null }) : ""
return creloadHandler(true).catch(console.error)
}
if (reason === 515) {
console.log(chalk.bold.magentaBright(\n╭─────────────────────────\n│ Reinicio automático para la sesión (+${path.basename(pathvegetaJadiBot)}).\n╰─────────────────────────))
await creloadHandler(true).catch(console.error)
}
if (reason === 403) {
console.log(chalk.bold.magentaBright(\n╭─────────────────────────\n│ Sesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathvegetaJadiBot)}).\n╰─────────────────────────))
fs.rmdirSync(pathvegetaJadiBot, { recursive: true })
}
}
if (connection == 'open') {
if (!global.db.data) loadDatabase()
if (!global.db.data?.users) loadDatabase()
let userName = sock.authState.creds.me.name || 'Anónimo'
let userJid = sock.authState.creds.me.jid || ${path.basename(pathvegetaJadiBot)}@s.whatsapp.net
console.log(chalk.bold.cyanBright(\n❒────────────【• SUB-BOT •】────────────❒\n│\n│ 🟢 ${userName} (+${path.basename(pathvegetaJadiBot)}) conectado exitosamente.\n│\n❒────────────【• CONECTADO •】────────────❒))
sock.isInit = true
global.conns.push(sock)

if (m?.chat) await conn.sendMessage(m.chat, { text: args[0] ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : `@${m.sender.split('@')[0]}, genial ya eres parte de nuestra familia de Sub-Bots.`, mentions: [m.sender] }, { quoted: m })    
  }    
}    

setInterval(async () => {    
  if (!sock.user) {    
    try { sock.ws.close() } catch { }    
    sock.ev.removeAllListeners()    
    let i = global.conns.indexOf(sock)    
    if (i < 0) return    
    delete global.conns[i]    
    global.conns.splice(i, 1)    
  }    
}, 60000)    

let handler = await import('../handler.js')    
let creloadHandler = async function (restatConn) {    
  try {    
    const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)    
    if (Object.keys(Handler || {}).length) handler = Handler    

  } catch (e) {    
    console.error('⚠️ Nuevo error: ', e)    
  }    
  if (restatConn) {    
    const oldChats = sock.chats    
    try { sock.ws.close() } catch { }    
    sock.ev.removeAllListeners()    
    sock = makeWASocket(connectionOptions, { chats: oldChats })    
    isInit = true    
  }    
  if (!isInit) {    
    sock.ev.off("messages.upsert", sock.handler)    
    sock.ev.off("connection.update", sock.connectionUpdate)    
    sock.ev.off('creds.update', sock.credsUpdate)    
  }    

  sock.handler = handler.handler.bind(sock)    
  sock.connectionUpdate = connectionUpdate.bind(sock)    
  sock.credsUpdate = saveCreds.bind(sock, true)    
  sock.ev.on("messages.upsert", sock.handler)    
  sock.ev.on("connection.update", sock.connectionUpdate)    
  sock.ev.on("creds.update", sock.credsUpdate)    
  isInit = false    
  return true    
}    
creloadHandler(false)

})
}

