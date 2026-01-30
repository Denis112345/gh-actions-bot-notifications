import express, { Request, Response } from 'express';
import { DeployPayload } from './types';
import config from './config.json'
import { Telegraf } from 'telegraf';

const bot = new Telegraf(config.botToken)
const app = express()
const TG_API = "https://api.telegram.org";

app.use(express.json())

app.post('/notify', async (req: Request<{}, {}, DeployPayload>, res: Response) => {
    const { service, status, env, branch, time, actionUrl } = req.body

    if (!config.serviceNames.includes(service)) {
        return res.status(400).json({ error: 'Unknkow service' })
    }

app.get('/health', async (req, res) => {
    try {
        // Делаем быстрый запрос к API Telegram с коротким тайм-аутом
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${TG_API}`, { signal: controller.signal });
        clearTimeout(timeout);

        // Если Telegram ответил (даже 404, главное что ответил), значит сеть есть
        res.status(200).send("OK");
    } catch (error) {
        // Если таймаут или ошибка сети — отдаем 500, K8s поймет это как сигнал к перезагрузке
        console.error("Health check failed: Telegram API unreachable");
        res.status(500).send("Telegram Unreachable");
    }
});
// Формируем строку с ссылкой, если она пришла
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
    await bot.telegram.sendMessage(config.chatID, message, { parse_mode: 'HTML', message_thread_id: config.topicID });
    res.status(200).send('OK')
  } catch (error) {
    console.error('Ошибка отправки:', error);
    res.status(500).send('Internal Server Error');
  }

});

app.listen(config.port, () => {
    console.log(`🚀 Notification server running on port ${config.port}`);
})