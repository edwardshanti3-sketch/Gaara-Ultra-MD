var handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    // ⏰ Cooldown (20 minutos)
    let cooldown = 20 * 60 * 1000
    let time = user.lastslut + cooldown

    if (new Date() - user.lastslut < cooldown) {
        return conn.reply(m.chat, `⏰ Debes esperar ${msToTime(time - new Date())} antes de volver a usar *slut*.`, m)
    }

    // 💎 Recompensa fija de 50k
    let recompensa = 50000
    user.coin += recompensa
    user.lastslut = Date.now()

    // 📩 Mensaje
    conn.reply(m.chat, `💖✨ ＳＬＵＴ ✨💖
━━━━━━━━━━━━━━━
😎 Ｕｎ ｅｘｔｒａｎｏ ｔｒａｖｉｅｓｏ ｓｅ ａｃｅｒｃó…
💎 Ｙ ｔｅ ｒｅｇａｌó: *${recompensa}* ⚽ＳＡＧＩＣＯＩＮＳ⚽
━━━━━━━━━━━━━━━
🏦 Ａｈｏｒａ ｅｎ ｔｕ ｂｏｌｓｉｌｌｏ ｔｉｅｎｅｓ:
*${user.coin}* ⚽ＳＡＧＩＣＯＩＮＳ⚽`, m)
}

handler.help = ['slut']
handler.tags = ['rpg']
handler.command = ['slut']
//handler.group = true

export default handler

// Función para mostrar el tiempo en min y seg
function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)

    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds

    return minutes + " minutos " + seconds + " segundos"
      }
