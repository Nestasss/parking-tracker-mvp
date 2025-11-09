const { Telegraf } = require('telegraf');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const db = new sqlite3.Database(process.env.DB_PATH || './db.sqlite');

module.exports = { bot, db };
