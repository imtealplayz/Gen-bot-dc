# Gen-bot-dc

Gen-bot-dc is a comprehensive Discord bot and web dashboard solution, built with TypeScript, Express, and Discord.js. It provides a robust platform for server management, custom commands, and interactive features, all accessible through a user-friendly web interface.

## Features

*   **Discord Bot Functionality:** Integrates with Discord for various server automation and user interaction tasks.
*   **Web Dashboard:** A web interface for managing bot settings, viewing statistics, and potentially user-specific data.
*   **TypeScript:** Enhances code quality and maintainability with static typing.
*   **Express.js Backend:** Provides a powerful and flexible backend for the web dashboard and API.
*   **Drizzle ORM:** (Based on `drizzle.config.ts`) Likely used for database interactions, offering a type-safe query builder.

## Technologies Used

*   **Language:** TypeScript
*   **Backend:** Node.js, Express.js
*   **Discord Integration:** Discord.js
*   **Database ORM:** Drizzle ORM
*   **Frontend (Dashboard):** React (based on `main.tsx`, `App.tsx`)
*   **Styling:** Tailwind CSS (based on `tailwind.config.ts`, `postcss.config.js`)

## Project Structure

```
Gen-bot-dc/
├── src/                    # Source code for the bot and dashboard
│   ├── discord.ts          # Discord bot logic
│   ├── routes.ts           # Express routes for the web dashboard
│   ├── schema.ts           # Database schema definitions (Drizzle)
│   ├── App.tsx             # Main React component for the dashboard
│   ├── index.ts            # Main entry point for the application
│   └── ...                 # Other components and utilities
├── public/                 # Static assets for the web dashboard
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # Project documentation
```

## Setup Instructions

To set up and run Gen-bot-dc locally, follow these steps:

### 1. Prerequisites

*   **Node.js:** Ensure you have Node.js (LTS version recommended) installed.
*   **Database:** A compatible database for Drizzle ORM (e.g., PostgreSQL, MySQL, SQLite).
*   **Discord Bot Token:** Create a new application on the [Discord Developer Portal](https://discord.com/developers/applications) and obtain your bot token.
*   **Discord Client ID:** Get your bot's client ID from the Discord Developer Portal.

### 2. Clone the Repository

```bash
git clone https://github.com/imtealplayz/Gen-bot-dc.git
cd Gen-bot-dc
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory of the project and add the following:

```
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID
DATABASE_URL=YOUR_DATABASE_CONNECTION_STRING
```

*Replace the placeholder values with your actual bot token, client ID, and database connection string.*

### 5. Run Database Migrations (if applicable)

If using Drizzle ORM with migrations, run them to set up your database schema:

```bash
npx drizzle-kit push:pg # or appropriate command for your database
```

### 6. Run the Application

```bash
npm start # or appropriate command to start both bot and dashboard
```

The bot and dashboard should now be running. The web dashboard will typically be accessible via `http://localhost:3000` (or another configured port), and the Discord bot will come online.
