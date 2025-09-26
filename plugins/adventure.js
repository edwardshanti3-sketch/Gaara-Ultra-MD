var handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    // ⏰ Cooldown (15 minutos por ejemplo)
    let cooldown = 15 * 60 * 1000
    let time = user.lastadventure + cooldown

    if (new Date() - user.lastadventure < cooldown) {
        return conn.reply(m.chat, `⏰ Debes esperar ${msToTime(time - new Date())} antes de volver a ir de aventura.`, m)
    }

    // 🎲 Recompensa aleatoria entre 25k y 35k
    let recompensa = Math.floor(Math.random() * 10001) + 25000 
    user.coin += recompensa
    user.lastadventure = Date.now()

    // 📩 Mensaje
    conn.reply(m.chat, `💫✨ ＡＤＶＥＮＴＵＲＥ ✨💫
━━━━━━━━━━━━━━━
🏹 Te embarcaste en una aventura peligrosa…
🗝️ Y encontraste: ⚽*${recompensa}* Isagi-coins ⚽
━━━━━━━━━━━━━━━
🎒 Ahora en tu mochila tienes:
⚽*${user.coin}* ⚽`, m)
}

handler.help = ['adventure', 'aventure']
handler.tags = ['rpg']
handler.command = ['adventure', 'aventure']
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
