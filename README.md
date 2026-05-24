# WLAD HLAL Discord Bot Setup

## Overview
This Discord bot automatically creates support tickets when users complete purchases in the store.

## Prerequisites
- Node.js (version 18 or higher)
- A Discord Bot Token
- Discord Server ID (Guild ID)
- Discord Category ID (where tickets will be created)

## Setup Instructions

### 1. Create a Discord Bot
1. Go to https://discord.com/developers/applications
2. Click "New Application" and give it a name (e.g., "WLAD HLAL Store Bot")
3. Go to the "Bot" tab and click "Add Bot"
4. Copy the **BOT TOKEN** - you'll need this for the `.env` file
5. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent

### 2. Get Your Server IDs
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click your server and copy the **Server ID** (GUILD_ID)
3. Create a category in your server for tickets (e.g., "Support Tickets")
4. Right-click the category and copy the **Category ID** (CATEGORY_ID)
5. Create or select an admin role that should receive ticket notifications
6. Right-click the role and copy the **Role ID** (ADMIN_ROLE_ID)

### 3. Configure Environment Variables
Create a `.env` file in the `bot` folder with the following content:

```env
BOT_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here
CATEGORY_ID=your_category_id_here
ADMIN_ROLE_ID=your_admin_role_id_here
PORT=3000
```

Replace the values with your actual IDs.

### 4. Invite the Bot to Your Server
1. Go to your bot application on Discord Developer Portal
2. Go to "OAuth2" > "URL Generator"
3. Select these scopes:
   - bot
   - applications.commands
4. Select these bot permissions:
   - Create Channels
   - Send Messages
   - Embed Links
   - Manage Channels
   - Read Messages/View Channels
   - Read Message History
5. Copy the generated URL and open it in your browser
6. Select your server and authorize the bot

### 5. Install Dependencies
Open a terminal in the `bot` folder and run:

```bash
npm install
```

### 6. Start the Bot
Run the bot with:

```bash
npm start
```

You should see:
```
🌐 API running on port 3000
✅ Bot logged in as YourBotName#1234
```

## Configure the Store

### Option 1: Local Development (Default)
If the bot is running locally on port 3000, no configuration is needed. The store will automatically use `http://localhost:3000`.

### Option 2: Remote Server
If your bot is hosted on a remote server (e.g., Render, Heroku, VPS):

1. Go to the Admin Panel (admin.html)
2. Click on "عام" (General) in the sidebar
3. Enter your bot's API URL (e.g., `https://your-bot-url.com`)
4. Click the save button
5. Click "فحص حالة البوت" (Check Bot Status) to verify the connection

## Testing the Integration

1. Add some items to the cart in the store
2. Click "إكمال الشراء" (Checkout)
3. If successful, a ticket channel will be created in your Discord server
4. The ticket will contain:
   - Customer information
   - Order details
   - Total amount
   - Instructions for admins

## Troubleshooting

### Bot not creating tickets
- Check that the bot is running (`npm start`)
- Verify the `.env` file has correct values
- Check the browser console for errors (F12)
- Use the "Check Bot Status" button in Admin Panel

### CORS errors
- The bot allows all origins by default. If you changed this, make sure your store URL is allowed.

### Permission errors
- Ensure the bot has "Manage Channels" permission
- Check that the CATEGORY_ID is correct

### Bot not responding
- Check the bot is online in Discord
- Verify the bot token is valid
- Check the terminal for error messages

## Commands
- `!close` - Close the current ticket channel (only works in ticket channels)

## API Endpoints

### GET `/`
Health check endpoint. Returns bot status.

### POST `/create-ticket`
Creates a new Discord ticket. Request body:
```json
{
  "username": "customer_name",
  "discordId": "123456789",
  "items": [
    {
      "type": "vehicle",
      "name": "Car Name",
      "price": 100
    }
  ],
  "total": 100
}
```

## Deployment

### Render (Recommended)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set environment variables in Render dashboard
5. Deploy

### Other Platforms
The bot can be deployed on any platform that supports Node.js:
- Heroku
- Railway
- VPS (DigitalOcean, AWS, etc.)
- Replit

## Support
If you encounter issues:
1. Check the browser console (F12) for errors
2. Check the bot terminal for error messages
3. Verify all IDs in `.env` are correct
4. Ensure the bot has proper permissions in Discord
