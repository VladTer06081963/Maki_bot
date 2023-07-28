const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
import dotenv from 'dotenv';

import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import config from 'config';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import { removeFile } from './utils.js';
import { initCommand, processTextToChat, INITIAL_SESSION } from './logic.js';
dotenv.config();
bot.use(session());

bot.command('new', initCommand);
bot.command('start', initCommand);

const processMessage = async (ctx, text) => {
  ctx.session ??= INITIAL_SESSION;
  try {
    await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'));
    await processTextToChat(ctx, text);
  } catch (e) {
    await ctx.reply(code('Произошла ошибка. Пожалуйста, попробуйте еще раз.'));
    console.log(`Error while processing message`, e.message);
  }
};

bot.on(message('voice'), async (ctx) => {
  try {
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    removeFile(oggPath);

    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Ваш запрос: ${text}`));
    removeFile(mp3Path);

    await processMessage(ctx, text);
  } catch (e) {
    await ctx.reply(code('Произошла ошибка. Пожалуйста, попробуйте еще раз.'));
    console.log(`Error while voice message`, e.message);
  }
});

bot.on(message('text'), async (ctx) => {
  await processMessage(ctx, ctx.message.text);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
