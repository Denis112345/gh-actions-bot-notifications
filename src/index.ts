import express, { Request, Response } from 'express';
import { DeployPayload } from './types';
import config from './config.json'
import { Telegraf } from 'telegraf';

const bot = new Telegraf(config.botToken)
const app = express()
app.use(express.json())

app.post('/notify', async (req: Request<{}, {}, DeployPayload>, res: Response) => {
    const { service, status, env, branch, time, commit_url } = req.body

    if (!config.serviceNames.includes(service)) {
        return res.status(400).json({ error: 'Unknkow service' })
    }

// Формируем строку с ссылкой, если она пришла
    const commitLink = commit_url ? `<a href="${commit_url}">Последний коммит 🔗</a>` : 'Нет ссылки';

    const message = `
📦 <b>${service.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━
📊 <b>Статус:</b> ${status}
🌿 <b>Ветка:</b> <code>${branch}</code>
🏗️ <b>Окружение:</b> <code>${env}</code>
🕒 <b>Время:</b> ${time}
🔗 <b>Ссылка:</b> ${commitLink}
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