// créditos by isagi y fog Para Isafog-Ultra-MD 

async function handler(m, { conn, usedPrefix }) {
  try {
    await m.react('👨🏻‍💻')

    const imageUrl = 'https://files.catbox.moe/inqghn.jpg'

    let messageText = `
🤖 *Isafog-Ultra-MD*
👤 *Creadores:*isagi y fog
📱 *Número:* +50499605089
🌐 *Dashboard:* https://dash.deluxehost.cl
💻 *GitHub:* https://github.com/xzzys26
`

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: messageText,
      footer: '*⚡ Servicios Privado Con Alta Calidad*',
      buttons: [
        {
          buttonId: `${usedPrefix}code`,
          buttonText: { displayText: "🤖 𝗖𝗼𝗱𝗲" },
          type: 1,
        },
        {
          buttonId: `${usedPrefix}menu`,
          buttonText: { displayText: "📜 𝗠𝗲𝗻𝘂" },
          type: 1,
        },
      ],
      headerType: 4
    }, { quoted: m })

  } catch (error) {
    console.error('Error:', error)
    await conn.sendMessage(m.chat, { 
      text: '🤖 *Isafog-Ultra-MD*\n👤 *Creadores:* isagi y fog\n📱 *Número:* +50499605089\n🌐 *Dashboard:* https://dash.deluxehost.cl\n💻 *GitHub:* https://github.com/xzzys26\n\n*⚡ Servicios Privado Con Alta Calidad*'
    }, { quoted: m })
  }
}

handler.help = ['creador']
handler.tags = ['info']
handler.command = ['owner', 'creator', 'creador', 'dueño']

export default handler
