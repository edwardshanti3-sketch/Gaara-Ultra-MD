import { execSync } from 'child_process'
import speed from 'performance-now'
import os from 'os'

let handler = async (m, { conn }) => {
    let timestamp = speed();
    let sentMsg = await conn.reply(m.chat, '🏓 𝙲𝙰𝙻𝙲𝚄𝙻𝙰𝙽𝙳𝙾 𝙿𝙸𝙽𝙶 𝚈 𝙳𝙰𝚃𝙾𝚂 𝙳𝙴𝙻 𝚂𝙸𝚂𝚃𝙴𝙼𝙰...', m);

    let latency = speed() - timestamp;

    // Información del sistema
    const arch = os.arch();
    const platform = os.platform();
    const release = os.release();
    const hostname = os.hostname();
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
// Espacio de disco NVMe/SSD/HDD
let diskInfo = 'No disponible'
try {
    if (process.platform === 'win32') {
        const output = execSync('wmic logicaldisk get size,freespace,caption').toString()
        const lines = output.trim().split('\n').slice(1)
        const total = lines.reduce((sum, line) => sum + (parseInt(line.trim().split(/\s+/)[2]) || 0), 0)
        const free = lines.reduce((sum, line) => sum + (parseInt(line.trim().split(/\s+/)[1]) || 0), 0)
        const used = total - free
        diskInfo = `${(free / 1024 / 1024 / 1024).toFixed(2)} GB libres, de ${(total / 1024 / 1024 / 1024).toFixed(2)} GB, Usado ${(used / 1024 / 1024 / 1024).toFixed(2)} GB`
    } else {
        const output = execSync('df -k --output=avail,size /').toString().split('\n')
        const [free, total] = output[1].trim().split(/\s+/).map(Number)
        const used = total - free
        diskInfo = `${(free / 1024 / 1024).toFixed(2)} GB libres, de ${(total / 1024 / 1024).toFixed(2)} GB, Usado ${(used / 1024 / 1024).toFixed(2)} GB`
    }
} catch {
    diskInfo = 'No disponible'
}

    const uptime = formatUptime(os.uptime());
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;
    
    
    const botUptime = formatUptime(process.uptime());

    let result = `
╭━━━〔 ⚡ 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙸𝙽𝙵𝙾 ⚡ 〕━━━╮
┃ 📡 *Ping:* ${latency.toFixed(1)} ms
┃ 💻 *Plataforma:* ${platform} ${arch}
┃ 🖥️ *Sistema:* ${release}
┃ 🌐 *Hostname:* ${hostname}
┃ 🔧 *CPU:* ${cpuModel} (${cpuCores} núcleos)
┃ 🗂️ *RAM:* ${freeMem} GB libres de ${totalMem} GB
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