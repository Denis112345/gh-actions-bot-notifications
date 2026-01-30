import express, { Request, Response } from 'express';
import { DeployPayload } from './types';
import config from './config.json'
import { Telegraf } from 'telegraf';

const bot = new Telegraf(config.botToken)
const app = express()
const TG_API = "https://api.telegram.org";

app.use(express.json())

// 1. ВЫНЕСИ HEALTH CHECK ОТДЕЛЬНО
app.get('/health', async (req, res) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch(`${TG_API}`, { signal: controller.signal });
        clearTimeout(timeout);
        res.status(200).send("OK");
    } catch (error) {
        console.error("Health check failed: Telegram API unreachable");
        res.status(500).send("Telegram Unreachable");
    }
});

// 2. ОБРАБОТЧИК NOTIFY
app.post('/notify', async (req: Request<{}, {}, DeployPayload>, res: Response) => {
    const { service, status, env, branch, time, actionUrl } = req.body

    if (!config.serviceNames.includes(service)) {
        return res.status(400).json({ error: 'Unknown service' })
    }

    const actionLink = actionUrl ? `<a href="${actionUrl}">Последний Action</a> 🔗` : 'Нет ссылки';

    const message = `
📦 <b>${service.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━
📊 <b>Статус:</b> ${status}
🌿 <b>Ветка:</b> <code>${branch}</code>
🏗️ <b>Окружение:</b> <code>${env}</code>
🕒 <b>Время:</b> ${time}
🔗 <b>Ссылка:</b> ${actionLink}
  `;

    try {
        await bot.telegram.sendMessage(config.chatID, message, { 
            parse_mode: 'HTML', 
            message_thread_id: config.topicID 
        });
        res.status(200).send('OK')
    } catch (error) {
        console.error('Ошибка отправки:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(config.port, () => {
    console.log(`🚀 Notification server running on port ${config.port}`);
})