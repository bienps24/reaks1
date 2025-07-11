
const { Telegraf } = require('telegraf');
const { Pool } = require('pg');
require('dotenv').config();

const bot = new Telegraf(process.env.CONTROLLER_BOT_TOKEN);
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
const ADMIN_IDS = ['5521402866'];

bot.command('allow', async (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id.toString())) return;
    const parts = ctx.message.text.split(' ');
    const channelId = parts[1];
    if (!channelId) return ctx.reply("Please provide channel ID.");
    try {
        await pool.query('INSERT INTO whitelist (channel_id) VALUES ($1) ON CONFLICT DO NOTHING', [channelId]);
        ctx.reply(`✅ Channel ${channelId} added to whitelist.`);
    } catch (err) {
        console.error("DB Error:", err);
        ctx.reply("❌ Failed to add.");
    }
});

bot.command('remove', async (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id.toString())) return;
    const parts = ctx.message.text.split(' ');
    const channelId = parts[1];
    if (!channelId) return ctx.reply("Please provide channel ID.");
    try {
        await pool.query('DELETE FROM whitelist WHERE channel_id = $1', [channelId]);
        ctx.reply(`❌ Channel ${channelId} removed from whitelist.`);
    } catch (err) {
        console.error("DB Error:", err);
        ctx.reply("❌ Failed to remove.");
    }
});

bot.command('list', async (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id.toString())) return;
    try {
        const res = await pool.query('SELECT channel_id FROM whitelist');
        const list = res.rows.map(r => r.channel_id).join('\n') || "None";
        ctx.reply(`📋 Whitelisted Channels:\n${list}`);
    } catch (err) {
        console.error("DB Error:", err);
        ctx.reply("❌ Failed to retrieve list.");
    }
});

bot.launch();
console.log("✅ Controller bot with PostgreSQL is running...");
