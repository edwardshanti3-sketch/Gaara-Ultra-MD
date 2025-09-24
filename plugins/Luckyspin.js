// LuckySpin.js
module.exports = {
    name: "ruleta",
    description: "Gira la ruleta y gana puntos!",
    execute: async (msg, client) => {

const outcomes = [
    1000,
    "🎉 Ganaste 1000000 Isagi-coins!",
    "🍀 Ganaste 100000 Isagi-coins!",
    "😡 Perdiste, inténtalo de nuevo!",
    "🏆 Ganaste un premio especial!"
];
    // Elegir un resultado al azar
        const randomIndex = Math.floor(Math.random() * outcomes.length);
        const result = outcomes[randomIndex];

        // Enviar mensaje de resultado
        await client.sendMessage(msg.from, { text: result });
    }
};
