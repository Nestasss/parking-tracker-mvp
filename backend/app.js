const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

require('dotenv').config();

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const db = new sqlite3.Database(process.env.DB_PATH || './db.sqlite');

// Инициализация базы данных
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS parking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    latitude REAL,
    longitude REAL,
    address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Хранение активных пользователей
const activeUsers = new Set();

// Команда /start
bot.start((ctx) => {
  ctx.reply(
    '🚗 Привет! Я помогу тебе не забывать, когда ты припарковался.\n\n' +
    'Отправь мне своё местоположение, чтобы я мог отслеживать остановки.'
  );
});

// Получение геолокации
bot.on('location', async (ctx) => {
  const { latitude, longitude } = ctx.message.location;
  const userId = ctx.message.from.id;

  // Сохраняем пользователя как активного
  activeUsers.add(userId);

  // Получаем адрес через Яндекс.Геокодер
  try {
    const response = await axios.get(
      `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${process.env.YANDEX_GEOCODER_API_KEY}&geocode=${longitude},${latitude}`
    );
    const address = response.data.response.GeoObjectCollection.featureMember[0].GeoObject.name;

    // Сохраняем в базу
    db.run(
      'INSERT INTO parking_events (user_id, latitude, longitude, address) VALUES (?, ?, ?, ?)',
      [userId, latitude, longitude, address],
      function (err) {
        if (err) {
          console.error(err.message);
        } else {
          // Отправляем уведомление
          ctx.reply(
            `📍 Ты припарковался в ${new Date().toLocaleTimeString('ru-RU')} по адресу: ${address}\n` +
            `🗺️ [Карта](https://yandex.ru/maps/?pt=${longitude},${latitude}&z=17&l=map)`
          );
        }
      }
    );
  } catch (error) {
    console.error('Ошибка получения адреса:', error.message);
    ctx.reply('📍 Ты припарковался! Но не удалось получить точный адрес.');
  }
});

// Команда /history
bot.command('history', (ctx) => {
  const userId = ctx.message.from.id;
  db.all('SELECT * FROM parking_events WHERE user_id = ? ORDER BY timestamp DESC LIMIT 5', [userId], (err, rows) => {
    if (err) {
      console.error(err.message);
      ctx.reply('Ошибка получения истории.');
    } else {
      if (rows.length === 0) {
        ctx.reply('У тебя пока нет зафиксированных парковок.');
      } else {
        let message = 'Последние парковки:\n\n';
        rows.forEach(row => {
          message += `📍 ${row.address}\n`;
          message += `🕐 ${new Date(row.timestamp).toLocaleString('ru-RU')}\n\n`;
        });
        ctx.reply(message);
      }
    }
  });
});

// Запуск бота
bot.launch();

// API для получения данных от PWA
app.use(express.json());
app.post('/api/location', async (req, res) => {
  const { latitude, longitude, userId } = req.body;

  if (!latitude || !longitude || !userId) {
    return res.status(400).send('Missing data');
  }

  // Проверяем, активен ли пользователь
  if (!activeUsers.has(userId)) {
    return res.status(403).send('User not active');
  }

  // Логика определения парковки
  // TODO: Реализовать проверку скорости и времени остановки

  res.send('OK');
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
