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
  
