

const ruletasActivas = new Map(); // chatId => { apuestas: [], timeout }

const saldos = {}; // en memoria { userJid: saldo }, inicial 1000

function obtenerSaldo(userJid) {
  if (!(userJid in saldos)) saldos[userJid] = 1000;
  return saldos[userJid];
}

function modificarSaldo(userJid, delta) {
  if (!(userJid in saldos)) saldos[userJid] = 1000;
  saldos[userJid] += delta;
  if (saldos[userJid] < 0) saldos[userJid] = 0;
  return saldos[userJid];
}

async function iniciarRuleta(chatId, userJid, client) {
  if (ruletasActivas.has(chatId)) {
    await client.sendMessage(chatId, { text: '❗ Ya hay una ruleta activa.' });
    return;
  }

  ruletasActivas.set(chatId, {
    apuestas: [],
    timeout: setTimeout(() => finalizarRuleta(chatId, client), 20000) // 20 segundos para apostar
  });

  await client.sendMessage(chatId, { text:
    '🎰 Ruleta iniciada! Tienes 20 segundos para apostar.\n' +
    'Usa: !apostar <tipo> <valor?> <cantidad>\nTipos: numero (0-36), par, impar, rojo, negro' });
}

async function apostar(chatId, userJid, args, client) {
  const estado = ruletasActivas.get(chatId);
  if (!estado) {
    await client.sendMessage(chatId, { text: '⚠️ No hay ruleta activa. Usa !ruleta para iniciar.' });
    return;
  }

  const tipo = args[0]?.toLowerCase();
  let valor = null;
  let cantidad = null;

  if (!tipo) {
    await client.sendMessage(chatId, { text: 'Uso: !apostar <tipo> <valor?> <cantidad>' });
    return;
  }

  if (tipo === 'numero') {
    valor = parseInt(args[1]);
    cantidad = parseInt(args[2]);
    if (isNaN(valor) || valor < 0 || valor > 36) {
      await client.sendMessage(chatId, { text: 'Número inválido (0-36).' });
      return;
    }
    if (isNaN(cantidad) || cantidad <= 0) {
      await client.sendMessage(chatId, { text: 'Cantidad inválida.' });
      return;
    }
  } else if (['par','impar','rojo','negro'].includes(tipo)) {
    cantidad = parseInt(args[1]);
    if (isNaN(cantidad) || cantidad <= 0) {
      await client.sendMessage(chatId, { text: 'Cantidad inválida.' });
      return;
    }
  } else {
    await client.sendMessage(chatId, { text: 'Tipo inválido. Tipos: numero, par, impar, rojo, negro' });
    return;
  }

  const saldo = obtenerSaldo(userJid);
  if (saldo < cantidad) {
    await client.sendMessage(chatId, { text: `No tienes saldo suficiente. Tu saldo: ${saldo}` });
    return;
  }

  modificarSaldo(userJid, -cantidad);
  estado.apuestas.push({ userJid, tipo, valor, cantidad });

  await client.sendMessage(chatId, { text: `✅ Apuesta registrada: ${userJid.split('@')[0]} apostó ${cantidad} a ${tipo}${tipo==='numero'?` (${valor})`:''}` });
}

async function finalizarRuleta(chatId, client) {
  const estado = ruletasActivas.get(chatId);
  if (!estado) return;

  clearTimeout(estado.timeout);

  const resultado = Math.floor(Math.random() * 37);
  const rojos = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const esRojo = rojos.includes(resultado);
  const esPar = resultado !== 0 && resultado % 2 === 0;
  const esImpar = resultado % 2 === 1;

  let mensajes = [`🎯 Resultado: *${resultado}*`];

  for (const apuesta of estado.apuestas) {
    let gano = false;
    let ganancia = 0;

    if (apuesta.tipo === 'numero' && apuesta.valor === resultado) {
      gano = true;
      ganancia = apuesta.cantidad * 36;
    } else if (apuesta.tipo === 'par' && esPar) {
      gano = true;
      ganancia = apuesta.cantidad * 2;
    } else if (apuesta.tipo === 'impar' && esImpar) {
      gano = true;
      ganancia = apuesta.cantidad * 2;
    } else if (apuesta.tipo === 'rojo' && esRojo) {
      gano = true;
      ganancia = apuesta.cantidad * 2;
    } else if (apuesta.tipo === 'negro' && !esRojo && resultado !== 0) {
      gano = true;
      ganancia = apuesta.cantidad * 2;
    }

    if (gano) {
      modificarSaldo(apuesta.userJid, ganancia);
      mensajes.push(`🎉 ${apuesta.userJid.split('@')[0]} ganó ${ganancia} monedas!`);
    } else {
      mensajes.push(`😞 ${apuesta.userJid.split('@')[0]} perdió ${apuesta.cantidad} monedas.`);
    }
  }

  await client.sendMessage(chatId, { text: mensajes.join('\n') });
  ruletasActivas.delete(chatId);
}

// Ejemplo uso en tu escucha de mensajes:

// client.ev.on('messages.upsert', async ({ messages }) => {
//   for (const msg of messages) {
//     if (!msg.message) continue;
//     const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
//     if (!text.startsWith('!')) continue;

//     const chatId = msg.key.remoteJid;
//     const userJid = msg.key.participant || msg.key.remoteJid;

//     const args = text.trim().split(/\s+/);
//     const comando = args[0].toLowerCase();

//     if (comando === '!ruleta') {
//       await iniciarRuleta(chatId, userJid, client);
//     } else if (comando === '!apostar') {
//       args.shift();
//       await apostar(chatId, userJid, args, client);
//     } else if (comando === '!saldo') {
//       const saldo = obtenerSaldo(userJid);
//       await client.sendMessage(chatId, { text: `💰 Tu saldo es ${saldo} monedas.` });
//     }
//   }
// });

module.exports = {
  iniciarRuleta,
  apostar,
  finalizarRuleta,
  obtenerSaldo,
  modificarSaldo
};
