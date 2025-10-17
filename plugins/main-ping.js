import speed from 'performance-now'
import os from 'os'
import checkDiskSpace from 'check-disk-space'

let handler = async (m, { conn }) => {
  let timestamp = speed();
  let sentMsg = await conn.reply(m.chat, '🏓 𝙲𝙰𝙻𝙲𝚄𝙻𝙰𝙽𝙳𝙾 𝙿𝙸𝙽𝙶 𝚈 𝙳𝙰𝚃𝙾𝚂 𝙳𝙴𝙻 𝚂𝙸𝚂𝚃𝙴𝙼𝙰...', m);

  let latency = speed() - timestamp;

  // Información del sistema
  const arch = os.arch();
  const platform = os.platform();
  const release = os.release();
  const hostname = os.hostname();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const uptime = formatUptime(os.uptime());
  const cpus = os.cpus();
  const cpuModel = cpus[0].model;
  const cpuCores = cpus.length;
  const botUptime = formatUptime(process.uptime());

  // Disco
  const disk = await checkDiskSpace('/');
  const totalDisk = disk.size;
  const freeDisk = disk.free;
  const usedDisk = totalDisk - freeDisk;

  const formatGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2);

  const ramInfo = `Usado ${formatGB(usedMem)} GB , ${formatGB(freeMem)} GB libres , de ${formatGB(totalMem)} GB`;
  const diskInfo = `Usado ${formatGB(usedDisk)} GB , ${formatGB(freeDisk)} GB libres , de ${formatGB(totalDisk)} GB`;

  let result = `
╭━━━〔 ⚡ 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙸𝙽𝙵𝙾 ⚡ 〕━━━╮
┃ 📡 *Ping:* ${latency.toFixed(1)} ms
┃ 💻 *Plataforma:* ${platform} ${arch}
┃ 🖥️ *Sistema:* ${release}
┃ 🌐 *Hostname:* ${hostname}
┃ 🔧 *CPU:* ${cpuModel} (${cpuCores} núcleos)
┃ 🗂️ *RAM:* ${ramInfo}
┃ 💽 *Espacio:* ${diskInfo}
┃ ⏳ *Uptime Sistema:* ${uptime}
┃ 🤖 *Uptime Bot:* ${botUptime}
╰━━━━━━━━━━━━━━━━━━━╯
  `.trim();

  conn.sendMessage(m.chat, { text: result, edit: sentMsg.key }, { quoted: m });
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds %= 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds %= 60 * 60;
  const minutes = Math.floor(seconds / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

handler.help = ['ping', 'info'];
handler.tags = ['main', 'info'];
handler.command = ['ping', 'p', 'speed', 'info'];

export default handler;