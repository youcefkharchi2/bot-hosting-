require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const express = require('express');
const cors = require('cors');

// ── Config ─────────────────────────────────────────────────────────────────
const BOT_TOKEN   = process.env.BOT_TOKEN;
const GUILD_ID    = process.env.GUILD_ID    || '1507197498471747694';
const CATEGORY_ID = process.env.CATEGORY_ID || '1507199969919238374';
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID || '1507199934699671672';
const PORT        = process.env.PORT        || 3000;

if (!BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is missing! Set it in .env or render environment variables.');
    process.exit(1);
}

// ── Discord Client ─────────────────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    client.user.setActivity('WLAD HLAL Store', { type: 3 }); // Watching
});

// ── Express API ────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cors({
    origin: '*', // restrict to your domain in production
    methods: ['GET', 'POST']
}));

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        bot: client.user ? client.user.tag : 'connecting...',
        uptime: Math.floor(process.uptime()) + 's'
    });
});

// ── POST /create-ticket ────────────────────────────────────────────────────
app.post('/create-ticket', async (req, res) => {
    try {
        console.log('📥 Received ticket request:', req.body);
        const { username, discordId, items, total } = req.body;

        if (!items || items.length === 0) {
            console.log('❌ Cart is empty');
            return res.status(400).json({ error: 'Cart is empty' });
        }

        console.log('🔍 Fetching guild:', GUILD_ID);
        const guild = await client.guilds.fetch(GUILD_ID);
        if (!guild) {
            console.log('❌ Guild not found');
            return res.status(500).json({ error: 'Guild not found' });
        }
        console.log('✅ Guild found:', guild.name);

        // Build safe channel name
        const safeName = (username || 'user')
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06ff]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 20) || 'user';
        const channelName = `ticket-${safeName}-${Date.now().toString().slice(-4)}`;
        console.log('📝 Creating channel:', channelName, 'in category:', CATEGORY_ID);

        // Create ticket channel inside category
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID,
            topic: `🛒 Order ticket for ${username || 'Unknown'}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: ADMIN_ROLE_ID,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                }
            ]
        });
        console.log('✅ Channel created:', channel.name, 'ID:', channel.id);

        // Build items list for embed
        const itemsList = items.map(item => {
            const typeEmoji = {
                vehicle: '🚗', house: '🏠', mapping: '🗺️',
                accessoires: '💎', character: '👤', job: '💼'
            }[item.type] || '📦';
            return `${typeEmoji} **${item.name}** — $${item.price}`;
        }).join('\n');

        // Build embed
        const embed = new EmbedBuilder()
            .setTitle('🛒 طلب جديد — New Order')
            .setColor(0x10b981)
            .setThumbnail('https://cdn.discordapp.com/embed/avatars/0.png')
            .addFields(
                {
                    name: '👤 العميل / Customer',
                    value: discordId ? `<@${discordId}>` : (username || 'Unknown'),
                    inline: true
                },
                {
                    name: '💰 الإجمالي / Total',
                    value: `**$${total}**`,
                    inline: true
                },
                {
                    name: '📦 المنتجات / Items',
                    value: itemsList || 'No items'
                },
                {
                    name: '📋 التعليمات / Instructions',
                    value: 'سيتواصل معك أحد المشرفين قريباً لإتمام الطلب.\nAn admin will contact you shortly to complete your order.'
                }
            )
            .setFooter({ text: 'WLAD HLAL Store' })
            .setTimestamp();

        // Send embed in ticket channel
        await channel.send({
            content: `<@&${ADMIN_ROLE_ID}> — طلب جديد يحتاج مراجعة! ${discordId ? `<@${discordId}>` : ''}`,
            embeds: [embed]
        });
        console.log('✅ Message sent to channel');

        // Also ping admins if there's an admin role (optional)
        // await channel.send('<@&ADMIN_ROLE_ID> — طلب جديد يحتاج مراجعة!');

        console.log(`✅ Ticket created successfully: #${channelName} for ${username}`);
        res.json({ success: true, channelId: channel.id, channelName });

    } catch (err) {
        console.error('❌ Ticket error:', err.message);
        console.error('❌ Full error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Close ticket command (optional: !close in ticket channel) ──────────────
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.toLowerCase() !== '!close') return;

    const channel = message.channel;
    if (!channel.name.startsWith('ticket-')) return;

    await channel.send('🔒 سيتم إغلاق هذه التذكرة خلال 5 ثوانٍ...');
    setTimeout(() => channel.delete().catch(console.error), 5000);
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🌐 API running on port ${PORT}`));
client.login(BOT_TOKEN);
