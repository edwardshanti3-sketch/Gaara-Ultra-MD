var handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    // ⏰ Cooldown (3 minutos)
    let cooldown = 10 * 60 * 1000
    let time = user.lastcrime + cooldown

    if (new Date() - user.lastcrime < cooldown) {
        return conn.reply(m.chat, `⏰ Debes esperar ${msToTime(time - new Date())} antes de volver a cometer un crimen.`, m)
    }

    // 💰 Posibles resultados del crimen
    const outcomes = [
        { text: "🚓 Fuiste atrapado por la policía y perdiste 5000 Isagi-coins.", coins: -5000 },
        { text: "💰 Tuviste éxito en el crimen y ganaste 15000 Isagi-coins.", coins: 15000 },
        { text: "🚶 Te saliste con la tuya, pero no ganaste nada.", coins: 0 },
        { text: "🚨 El crimen salió mal, perdiste 2000 Isagi-coins y te heriste.", coins: -2000 },
        { text: "⚽ ¡Felicidades! Robaste un banco y ganaste el premio gordo: 20000 Isagi-coins 🎉", coins: 20000 }
    ]

    // 📌 Escoger un resultado al azar
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)]

    // Actualizar monedas del usuario
    user.coin += outcome.coins
    if (user.coin < 0) user.coin = 0 // evitar negativos
    user.lastcrime = Date.now()

    // 📩 Enviar mensaje
    conn.reply(m.chat, `🕵️‍♂️ *Crime* 🕵️‍♂️
${outcome.text}
✐ Ahora tienes: *${user.coin}* Isagi-coins ⚽.`, m)
}

handler.help = ['crime']
handler.tags = ['rpg']
handler.command = ['crime', 'robar']
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

/* ===============================
   Versión antiguo
   ===============================

// crime.js
module.exports = {
    name: "crime",
    description: "Comete un crimen y ve si te sales con la tuya.",
    execute: async (msg, client) => {
        const outcomes = [
            "🚓 Fuiste atrapado por la policía y perdiste todas tus monedas.",
            "💰 Tuviste éxito en el crimen y ganaste 5000 monedas.",
            "🚶 Te saliste con la tuya, pero no ganaste nada.",
            "🚨 El crimen salió mal, perdiste 1000 monedas y te heriste."
        ];

        // Elegir un resultado al azar
        const randomIndex = Math.floor(Math.random() * outcomes.length);
        const result = outcomes[randomIndex];

        // Enviar mensaje de resultado
        await client.sendMessage(msg.from, { text: result });
    }
};
*/
