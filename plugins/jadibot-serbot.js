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

➺ ❶ 𝙰𝙱𝚁𝙴 𝙻𝙾𝚂 𝚃𝚁𝙴𝚂 𝙿𝚄𝙽𝚃𝙾𝚂 𝙴𝙽 𝙻𝙰 𝙴𝚂𝙲𝚄𝚁𝙰 𝚂𝚄𝙿𝙴𝚁𝙸𝙾𝚁.  
➺ ❷ 𝚅𝙰 𝙰 *"𝙳𝙸𝚂𝙿𝙾𝚂𝙸𝚃𝙸𝚅𝙾𝚂 𝚅𝙸𝙽𝙲𝚄𝙻𝙰𝙳𝙾𝚂"*.  
➺ ❸ 𝙴𝚂𝙲𝙰𝙽𝙴 𝙴𝙻 𝙲Ó𝙳𝙸𝙶𝙾 𝚀𝚁 𝙲𝙾𝙽É𝙲𝚃𝙰𝚃𝙴 𝙰𝙻 𝙱𝙾𝚃.  

⚠️ 𝙴𝙻 𝙲Ó𝙳𝙸𝙶𝙾 𝚀𝚁 𝙴𝚇𝙿𝙸𝚁𝙰 𝙴𝙽 ❺❹ 𝚂𝙴𝙶𝚄𝙽𝙳𝙾𝚂. 𝙽𝙾 𝙿𝙸𝙴𝚁𝙳𝙰𝚂 𝚃𝙸𝙴𝙼𝙿𝙾.  
`;

const maxSubBots = 324
let vegetaJBOptions = {}
if (!global.conns) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
    return m.reply(`El Comando *${command}* está desactivado temporalmente.`)
  }

  const subBots = [...new Set(
    global.conns.filter(c =>
      c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED
    ).map(c => c)
  )]

  if (subBots.length >= maxSubBots) {
    return m.reply(`❌ No se han encontrado espacios para *Sub-Bots* disponibles.`)
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split('@')[0]}`
  let pathvegetaJadiBot = path.join(`./vegetaJadiBot/`, id)
  if (!fs.existsSync(pathvegetaJadiBot)) {
    fs.mkdirSync(pathvegetaJadiBot, { recursive: true })
  }

  vegetaJBOptions = { pathvegetaJadiBot, m, conn, args, usedPrefix, command, fromCommand: true }
  await vegetaJadiBot(vegetaJBOptions)

  global.db.data.users[m.sender].Subs = new Date() * 1
}

handler.help = ['qr', 'code', 'start', 'st']
handler.tags = ['serbot']
handler.command = ['qr', 'code', 'start', 'st']

export default handler

export async function vegetaJadiBot(options) {
  let { pathvegetaJadiBot, m, conn, args, usedPrefix, command } = options
  const isCodeOrStart = command === 'code' || command === 'start' || command === 'st'

  if (isCodeOrStart) {
    command = 'qr'
    args.unshift('code')
  }

  // ... aquí sigue tu lógica de conexión exactamente igual ...

      if (connection == 'open') {
        let userName = sock.authState.creds.me.name || 'Anónimo'
        let userJid = sock.authState.creds.me.jid || `${path.basename(pathvegetaJadiBot)}@s.whatsapp.net`
        console.log(chalk.bold.cyanBright(`\n❒────────────【• SUB-BOT •】────────────❒\n│\n│ 🟢 ${userName} (+${path.basename(pathvegetaJadiBot)}) conectado exitosamente.\n│\n❒────────────【• CONECTADO •】────────────❒`))
        sock.isInit = true
        global.conns.push(sock)

        if (m?.chat) {
          if (options.command === 'start' || options.command === 'st') {
            await m.react?.('⚡')
            await conn.sendMessage(m.chat, { 
              text: `@${m.sender.split('@')[0]}, has encendido y activado tu Sub-Bot con éxito 🚀`, 
              mentions: [m.sender] 
            }, { quoted: m })
          } else {
            await conn.sendMessage(m.chat, { 
              text: args[0] 
                ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` 
                : `@${m.sender.split('@')[0]}, genial ya eres parte de nuestra familia de Sub-Bots.`, 
              mentions: [m.sender] 
            }, { quoted: m })
          }
        }
      }
}