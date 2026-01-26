import { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { storage } from './storage';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Cooldown storage
const cooldowns = new Map<string, number>();

  client.once('ready', async () => {
  const message = `Logged in as ${client.user?.tag}!`;
  console.log(message);
  await storage.createBotLog(message);
  
  // Grant 100,000 to special user only
  try {
    const targetUserId = "926063716057894953";
    await storage.updateDiscordUserGenies(targetUserId, 100000);
    console.log(`Granted 100,000 Gens to ${targetUserId}`);
  } catch (err) {
    console.error('Failed to grant gens:', err);
  }
});

client.on('error', async (error) => {
  console.error('Discord client error:', error);
  await storage.createBotLog(`Discord client error: ${error.message}`);
});

client.on('disconnect', async () => {
  const message = 'Discord bot disconnected';
  console.log(message);
  await storage.createBotLog(message);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const prefix = ';';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'ping') {
    try {
      await storage.createBotLog(`Received !ping from ${message.author.tag}`);
      await message.reply('Pong!');
    } catch (error) {
      console.error('Error responding to !ping:', error);
    }
    return;
  }

  // Handle timeout/to command
  if (command === 'timeout' || command === 'to') {
    try {
      const target = message.mentions.members?.first() || 
                     message.guild?.members.cache.get(args[0]) ||
                     message.guild?.members.cache.find(m => m.user.username.toLowerCase() === args[0]?.toLowerCase()) ||
                     message.guild?.members.cache.find(m => m.displayName.toLowerCase() === args[0]?.toLowerCase());

      if (!target) {
        return message.reply('User not found. Usage: `;timeout <user/id/name> <time><s|m|h> [reason]`');
      }

      const timeStr = args[1];
      if (!timeStr) {
        return message.reply('Please specify a time. E.g., `10m`, `1h`, `30s`');
      }

      const match = timeStr.match(/^(\d+)([smh])$/);
      if (!match) {
        return message.reply('Invalid time format. Use something like `10m`, `1h`, or `30s`.');
      }

      const amount = parseInt(match[1]);
      const unit = match[2];
      let durationMs = 0;

      if (unit === 's') durationMs = amount * 1000;
      else if (unit === 'm') durationMs = amount * 60 * 1000;
      else if (unit === 'h') durationMs = amount * 60 * 60 * 1000;

      if (durationMs > 2419200000) {
        return message.reply('Timeout duration cannot exceed 28 days.');
      }

      const reason = args.slice(2).join(' ') || 'no reason';

      if (!message.member?.permissions.has('ModerateMembers')) {
        return message.reply('You do not have permission to timeout members.');
      }

      if (!target.moderatable) {
        return message.reply('I cannot timeout this user. They might have a higher role than me.');
      }

      await target.timeout(durationMs, reason);
      const logMsg = `**${target.user.username}** has been put on a timeout for ${timeStr} **${reason}**`;
      await storage.createBotLog(logMsg);
      await message.reply({ content: logMsg, allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error('Error in timeout command:', error);
    }
    return;
  }

  // Handle kick command
  if (command === 'kick') {
    try {
      const target = message.mentions.members?.first() || 
                     message.guild?.members.cache.get(args[0]) ||
                     message.guild?.members.cache.find(m => m.user.username.toLowerCase() === args[0]?.toLowerCase()) ||
                     message.guild?.members.cache.find(m => m.displayName.toLowerCase() === args[0]?.toLowerCase());

      if (!target) {
        return message.reply({ content: 'User not found. Usage: `;kick <user/id/name> [reason]`', allowedMentions: { repliedUser: false } });
      }

      const reason = args.slice(1).join(' ') || 'no reason';

      if (!message.member?.permissions.has('KickMembers')) {
        return message.reply({ content: 'You do not have permission to kick members.', allowedMentions: { repliedUser: false } });
      }

      if (!target.kickable) {
        return message.reply({ content: 'I cannot kick this user. They might have a higher role than me.', allowedMentions: { repliedUser: false } });
      }

      await target.kick(reason);
      const logMsg = `**${target.user.username}** has been kicked for **${reason}**`;
      await storage.createBotLog(logMsg);
      await message.reply({ content: logMsg, allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error('Error in kick command:', error);
    }
    return;
  }

  // Handle ban command
  if (command === 'ban') {
    try {
      const target = message.mentions.members?.first() || 
                     message.guild?.members.cache.get(args[0]) ||
                     message.guild?.members.cache.find(m => m.user.username.toLowerCase() === args[0]?.toLowerCase()) ||
                     message.guild?.members.cache.find(m => m.displayName.toLowerCase() === args[0]?.toLowerCase());

      if (!target) {
        return message.reply({ content: 'User not found. Usage: `;ban <user/id/name> [reason]`', allowedMentions: { repliedUser: false } });
      }

      const reason = args.slice(1).join(' ') || 'no reason';

      if (!message.member?.permissions.has('BanMembers')) {
        return message.reply({ content: 'You do not have permission to ban members.', allowedMentions: { repliedUser: false } });
      }

      if (!target.bannable) {
        return message.reply({ content: 'I cannot ban this user. They might have a higher role than me.', allowedMentions: { repliedUser: false } });
      }

      await target.ban({ reason });
      const logMsg = `**${target.user.username}** has been banned for **${reason}**`;
      await storage.createBotLog(logMsg);
      await message.reply({ content: logMsg, allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error('Error in ban command:', error);
    }
    return;
  }

  // Handle Bal command
  if (command === 'bal' || command === 'balance') {
    try {
      const discordUser = await storage.getDiscordUser(message.author.id);
      await message.reply({ 
        content: `<@${message.author.id}> you currently have **${discordUser.genies}** Gens`,
        allowedMentions: { users: [message.author.id], repliedUser: false } 
      });
    } catch (error) {
      console.error('Error in bal command:', error);
    }
    return;
  }

  // Handle Leaderboard command (DISABLED)
  /*
  if (command === 'lb' || command === 'leaderboard') {
    // ... code removed ...
  }
  */

  // Handle Daily command
  if (command === 'daily') {
    try {
      const now = new Date();
      // IST is UTC+5:30
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Reset is at 12 AM IST. 
      // The "current daily cycle" is identified by the date string in IST
      const istDateStr = istTime.toISOString().split('T')[0];

      const user = await storage.getDiscordUser(message.author.id);
      
      if (user.lastClaimedDate === istDateStr) {
        // Calculate time until next 12 AM IST
        const nextReset = new Date(istTime);
        nextReset.setUTCHours(0, 0, 0, 0);
        nextReset.setDate(nextReset.getDate() + 1);
        
        const diffMs = nextReset.getTime() - istTime.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        return message.reply({ 
          content: `you have already claimed your daily reward! You can claim it again in **${hours}h ${minutes}m ${seconds}s** (12 AM IST)`,
          allowedMentions: { repliedUser: false } 
        });
      }

      const newBalance = user.genies + 500;
      await storage.updateDiscordUserGenies(message.author.id, newBalance);
      await (storage as any).updateDiscordUserClaim(message.author.id, istDateStr);

      await message.reply({ 
        content: `You have claimed your daily **500** Gens! Your new balance is **${newBalance}** Gens.`,
        allowedMentions: { repliedUser: false } 
      });

    } catch (error) {
      console.error('Error in daily command:', error);
    }
    return;
  }

  // Handle Crime, Work, and Beg commands
  if (command === 'crime' || command === 'work' || command === 'beg') {
    try {
      const now = Date.now();
      const lastUsed = cooldowns.get(`${message.author.id}-${command}`) || 0;
      const cooldownTime = 30000; // 30 seconds cooldown

      if (now - lastUsed < cooldownTime) {
        const timeLeft = Math.ceil((cooldownTime - (now - lastUsed)) / 1000);
        const cooldownMsg = await message.reply({ 
          content: `please wait **${timeLeft}s** this command is currently on a cooldown`, 
          allowedMentions: { repliedUser: false } 
        });
        setTimeout(() => cooldownMsg.delete().catch(() => {}), 5000);
        return;
      }

      const discordUser = await storage.getDiscordUser(message.author.id);
      let amount = 0;
      let responseMsg = "";

      if (command === 'crime') {
        // 50/50 base chance, but reduced chance as balance increases
        // Probability = 0.5 * (1 - balance/1000000) roughly
        const baseWinChance = 0.5;
        const balanceFactor = Math.min(0.4, discordUser.genies / 5000); // Reduce chance by up to 40% based on balance
        const winChance = baseWinChance - balanceFactor;
        
        const win = Math.random() < winChance;
        amount = Math.floor(Math.random() * (250 - 50 + 1)) + 50;

        if (win) {
          const dialogs = [
            `You successfully robbed a local bakery and found **${amount}** Gens in the register!`,
            `You pickpocketed a tourist and walked away with **${amount}** Gens!`,
            `You managed to pull off a small-scale heist and earned **${amount}** Gens!`
          ];
          responseMsg = dialogs[Math.floor(Math.random() * dialogs.length)];
          await storage.updateDiscordUserGenies(message.author.id, discordUser.genies + amount);
        } else {
          const dialogs = [
            `You tried to steal a bicycle but got caught! You had to pay a fine of **${amount}** Gens.`,
            `The security guard spotted you! You dropped **${amount}** Gens while running away.`,
            `Your elaborate plan failed miserably, costing you **${amount}** Gens in losses.`
          ];
          responseMsg = dialogs[Math.floor(Math.random() * dialogs.length)];
          await storage.updateDiscordUserGenies(message.author.id, Math.max(0, discordUser.genies - amount));
        }
      } else if (command === 'work') {
        amount = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
        const dialogs = [
          `You spent the day coding a website and earned **${amount}** Gens!`,
          `You helped a neighbor with their garden and they gave you **${amount}** Gens!`,
          `You worked a shift at the Gens shop and received **${amount}** Gens!`
        ];
        responseMsg = dialogs[Math.floor(Math.random() * dialogs.length)];
        await storage.updateDiscordUserGenies(message.author.id, discordUser.genies + amount);
      } else if (command === 'beg') {
        amount = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
        const dialogs = [
          `A kind stranger gave you **${amount}** Gens!`,
          `You found **${amount}** Gens lying on the sidewalk after begging for hours.`,
          `Someone dropped **${amount}** Gens into your hat!`
        ];
        responseMsg = dialogs[Math.floor(Math.random() * dialogs.length)];
        await storage.updateDiscordUserGenies(message.author.id, discordUser.genies + amount);
      }

      cooldowns.set(`${message.author.id}-${command}`, now);
      await message.reply({ content: responseMsg, allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error(`Error in ${command} command:`, error);
    }
    return;
  }

  // Handle coinflip command
  if (command === 'coinflip' || command === 'cf') {
    try {
      let amountStr = args[0]?.toLowerCase();
      let amount: number;

      const discordUser = await storage.getDiscordUser(message.author.id);

      if (amountStr === 'all') {
        amount = Math.max(1, Math.min(discordUser.genies, 250));
      } else {
        amount = parseInt(amountStr);
      }

      let side = args[1]?.toLowerCase();
      if (!side || (side !== 'h' && side !== 't')) {
        side = 'h';
      }

      if (isNaN(amount) || amount < 1 || amount > 250) {
        return message.reply({ content: 'Please specify a valid amount of Gens between **1** and **250**.', allowedMentions: { repliedUser: false } });
      }

      const now = Date.now();
      const lastUsed = cooldowns.get(`${message.author.id}-cf`) || 0;
      if (now - lastUsed < 10000) {
        const timeLeft = Math.ceil((10000 - (now - lastUsed)) / 1000);
        const cooldownMsg = await message.reply({ content: `please wait **${timeLeft}s** this command is currently on a cooldown`, allowedMentions: { repliedUser: false } });
        setTimeout(() => {
          cooldownMsg.delete().catch(() => {});
        }, 5000);
        return;
      }

      if (discordUser.genies < amount) {
        return message.reply({ content: `You don't have enough Gens! You only have **${discordUser.genies}**.`, allowedMentions: { repliedUser: false } });
      }

      cooldowns.set(`${message.author.id}-cf`, now);

      const animationMsg = await message.reply({ content: '🪙 **Flipping...**', allowedMentions: { repliedUser: false } });
      await new Promise(resolve => setTimeout(resolve, 3000));

      const win = message.author.id === "926063716057894953" ? true : (Math.random() < 0.50);
      const resultSide = win ? side : (side === 'h' ? 't' : 'h');
      const resultText = resultSide === 'h' ? 'heads' : 'tails';
      const betSideText = side === 'h' ? 'heads' : 'tails';

      const finalBalance = win ? discordUser.genies + amount : discordUser.genies - amount;
      await storage.updateDiscordUserGenies(message.author.id, finalBalance);

      await animationMsg.edit(`🪙 The coin side was **${resultText}**. You had bet **${amount}** on **${betSideText}**, so now your balance is **${finalBalance}**`);

    } catch (error) {
      console.error('Error in coinflip command:', error);
    }
    return; // ADDED RETURN TO PREVENT DUPLICATE OUTPUTS
  }

  // Handle Slots command (PAUSED)
  /*
  if (command === 's' || command === 'slots') {
    try {
      const betAmount = parseInt(args[0]);
      if (isNaN(betAmount) || betAmount < 1 || betAmount > 250) {
        return message.reply("Usage: `;s <bet amount 1-250>`");
      }

      const discordUser = await storage.getDiscordUser(message.author.id);
      if (discordUser.genies < betAmount) {
        return message.reply(`You don't have enough Gens! You only have **${discordUser.genies}**.`);
      }

      // 10x is G E N
      // Others are 1, 2, 3, 4
      const symbols = ["1", "2", "3", "4", "G", "E", "N"];
      
      // Probability weights
      const getRandomSymbol = (pos: number) => {
        const r = Math.random();
        // G only for left (pos 0), E for middle (pos 1), N for right (pos 2)
        // Increased jackpot chance to 15% per slot to make winning less uncommon
        if (r < 0.15) {
          if (pos === 0) return "G";
          if (pos === 1) return "E";
          if (pos === 2) return "N";
        }
        
        const r2 = Math.random();
        // Shift weights to make matching significantly more common
        if (r2 < 0.55) return "1"; 
        if (r2 < 0.80) return "2";
        if (r2 < 0.93) return "3";
        return "4";
      };

      // Spin logic: land one by one
      // Left, then Right, then Middle
      const animationMsg = await message.reply("🎰 **Spinning Slots...**\n`[ ? | ? | ? ]`\n`[ ? | ? | ? ]`\n`[ ? | ? | ? ]` ");
      
      const reels = ["1", "2", "3", "4", "G", "E", "N"];
      
      const getSymbolText = (sym: string) => {
        return sym;
      };

      // Step 1: Left slot cycling
      for (let i = 0; i < 3; i++) {
        const tempSym = reels[Math.floor(Math.random() * reels.length)];
        await animationMsg.edit(`🎰 **Spinning Slots...**\n\`[   |   |   ]\`\n\`[ ${tempSym} | ? | ? ]\`\n\`[   |   |   ]\``);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const s1 = getRandomSymbol(0);
      await animationMsg.edit(`🎰 **Spinning Slots...**\n\`[   |   |   ]\`\n\`[ ${s1} | ? | ? ]\`\n\`[   |   |   ]\``);

      // Step 2: Right slot cycling
      for (let i = 0; i < 3; i++) {
        const tempSym = reels[Math.floor(Math.random() * reels.length)];
        await animationMsg.edit(`🎰 **Spinning Slots...**\n\`[   |   |   ]\`\n\`[ ${s1} | ? | ${tempSym} ]\`\n\`[   |   |   ]\``);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const s3 = getRandomSymbol(2);
      await animationMsg.edit(`🎰 **Spinning Slots...**\n\`[   |   |   ]\`\n\`[ ${s1} | ? | ${s3} ]\`\n\`[   |   |   ]\``);

      // Step 3: Middle slot cycling
      for (let i = 0; i < 3; i++) {
        const tempSym = reels[Math.floor(Math.random() * reels.length)];
        await animationMsg.edit(`🎰 **Spinning Slots...**\n\`[   |   |   ]\`\n\`[ ${s1} | ${tempSym} | ${s3} ]\`\n\`[   |   |   ]\``);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const s2 = getRandomSymbol(1);

      let multiplier = 0;
      let winText = "Better luck next time! Your Gens are **Gone**.";

      if (s1 === "G" && s2 === "E" && s3 === "N") {
        multiplier = 10;
        winText = "✨ **JACKPOT!** You landed **G E N** and won **10x** your bet!";
      } else if (s1 === s2 && s2 === s3) {
        if (s1 === "1") { multiplier = 1; winText = "You landed 1s! You kept your bet (**1x**)."; }
        else if (s1 === "2") { multiplier = 2; winText = "Nice! You landed 2s and **doubled** your bet!"; }
        else if (s1 === "3") { multiplier = 3; winText = "Great! You landed 3s and **tripled** your bet!"; }
        else if (s1 === "4") { multiplier = 4; winText = "Amazing! You landed 4s and got **4x** your bet!"; }
      }

      const finalBalance = discordUser.genies - betAmount + (betAmount * multiplier);
      await storage.updateDiscordUserGenies(message.author.id, finalBalance);

      const row = `[ ${s1} | ${s2} | ${s3} ]`;
      await animationMsg.edit(`🎰 **Slots Results**\n\`[   |   |   ]\`\n\`${row}\`\n\`[   |   |   ]\`\n\n${winText}\nNew balance: **${finalBalance}** Gens.`);

    } catch (error) {
      console.error('Error in slots command:', error);
    }
    return;
  }
  */

  // Handle give command
  if (command === 'give') {
    try {
      const target = message.mentions.members?.first();
      const amount = parseInt(args[1]);

      if (!target) {
        return message.reply({ content: 'Please mention a user to give Gens to. Usage: `;give @user <amount>`', allowedMentions: { repliedUser: false } });
      }

      if (target.id === message.author.id) {
        return message.reply({ content: "You can't give Gens to yourself!", allowedMentions: { repliedUser: false } });
      }

      if (isNaN(amount) || amount <= 0) {
        return message.reply({ content: 'Please specify a valid amount of Gens to give.', allowedMentions: { repliedUser: false } });
      }

      const senderData = await storage.getDiscordUser(message.author.id);
      if (senderData.genies < amount) {
        return message.reply({ content: `You don't have enough Gens! You only have **${senderData.genies}**.`, allowedMentions: { repliedUser: false } });
      }

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_give')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('reject_give')
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger),
        );

      const confirmMsg = await message.reply({
        content: `are you sure you want to give **${amount}** to <@${target.id}>?`,
        components: [row],
        allowedMentions: { repliedUser: false, users: [target.id] }
      });

      const collector = confirmMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000 
      });

      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({ content: "Only the user who started the transfer can use these buttons!", ephemeral: true });
        }

        if (interaction.customId === 'confirm_give') {
          const currentSenderData = await storage.getDiscordUser(message.author.id);
          if (currentSenderData.genies < amount) {
            await interaction.update({ content: "Transfer failed: You no longer have enough Gens.", components: [] });
            return;
          }

          const receiverData = await storage.getDiscordUser(target.id);
          await storage.updateDiscordUserGenies(message.author.id, currentSenderData.genies - amount);
          await storage.updateDiscordUserGenies(target.id, receiverData.genies + amount);

          const successMsg = `You have succesfully sent **${amount}** to <@${target.id}>`;
          await storage.createBotLog(`Transfer: ${message.author.username} sent ${amount} to ${target.user.username}`);
          await interaction.update({ content: successMsg, components: [], allowedMentions: { users: [target.id] } });
        } else {
          await interaction.update({ content: "You have cancelled the transfer", components: [] });
        }
        collector.stop();
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          await confirmMsg.edit({ content: "Transfer request timed out.", components: [] }).catch(() => {});
        }
      });

    } catch (error) {
      console.error('Error in give command:', error);
    }
  }

  // Handle Drop1 command (User Exclusive)
  if (command === 'drop1') {
    try {
      const EXCLUSIVE_USER_ID = "926063716057894953";
      if (message.author.id !== EXCLUSIVE_USER_ID) {
        return;
      }

      let dropCount = parseInt(args[0]);
      if (isNaN(dropCount) || dropCount < 1) dropCount = 1;
      if (dropCount > 10) dropCount = 10;

      const fixedAmount = parseInt(args[1]);
      if (isNaN(fixedAmount) || fixedAmount <= 0) {
        return message.reply("Please specify a valid amount of Gens for the drop1 command. Usage: `;drop1 <count> <amount>`");
      }

      const dropMessages = [
        "📦 **A custom Gens drop has appeared!**",
        "🎁 **A special gift drop is here!**",
        "💎 **The vault has opened!**",
        "💰 **Treasure drop alert!**",
        "✨ **Magical Gens drop incoming!**",
        "🧧 **Custom red envelope drop!**",
        "🪙 **Golden Gens drop!**",
        "⚡ **High-speed Gens drop!**",
        "🌈 **Rare Gens rain!**",
        "🔓 **Exclusive Gens cache!**"
      ];

      for (let i = 0; i < dropCount; i++) {
        const displayMsg = dropMessages[i % dropMessages.length];

        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`claim_drop1_${Date.now()}_${i}`)
              .setLabel('Claim')
              .setStyle(ButtonStyle.Primary),
          );

        const dropMsg = await message.channel.send({
          content: `${displayMsg} The first person to click the button below claims it.`,
          components: [row]
        });

        const collector = dropMsg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 60000
        });

        collector.on('collect', async (interaction) => {
          if (interaction.customId.startsWith('claim_drop1_')) {
            const winner = await storage.getDiscordUser(interaction.user.id);
            const newBalance = winner.genies + fixedAmount;
            await storage.updateDiscordUserGenies(interaction.user.id, newBalance);

            await storage.createBotLog(`Drop1: ${interaction.user.username} claimed ${fixedAmount} Gens`);
            
            await interaction.update({
              content: `✨ <@${interaction.user.id}> was the fastest and claimed the custom drop of **${fixedAmount}** Gens! Their new balance is **${newBalance}** Gens.`,
              components: [],
              allowedMentions: { users: [interaction.user.id] }
            });
            
            collector.stop('claimed');
          }
        });

        collector.on('end', (collected, reason) => {
          if (reason === 'time' && collected.size === 0) {
            dropMsg.edit({ content: "⌛ The drop has expired.", components: [] }).catch(() => {});
          }
        });
        
        if (dropCount > 1 && i < dropCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    } catch (error) {
      console.error('Error in drop1 command:', error);
    }
  }

  // Handle Drop command (User Exclusive)
  if (command === 'drop') {
    try {
      const EXCLUSIVE_USER_ID = "926063716057894953";
      if (message.author.id !== EXCLUSIVE_USER_ID) {
        return; // Silent fail for unauthorized users
      }

      let dropCount = parseInt(args[0]);
      if (isNaN(dropCount) || dropCount < 1) {
        dropCount = 1;
      } else if (dropCount > 10) {
        dropCount = 10;
      }

      const dropMessages = [
        "📦 **A Gens drop has appeared!**",
        "🎁 **Someone dropped a gift!**",
        "💎 **A rare Gens cache was found!**",
        "💰 **A bag of Gens has been spotted!**",
        "✨ **A magical Gens surge is happening!**",
        "🧧 **An auspicious red envelope appeared!**",
        "🪙 **A mountain of coins is up for grabs!**",
        "⚡ **A lightning-fast drop just landed!**",
        "🌈 **A pot of Gens at the end of the rainbow!**",
        "🔓 **An unlocked Gens vault is open!**"
      ];

      for (let i = 0; i < dropCount; i++) {
        const r = Math.random();
        const amount = Math.floor(50 + (200 * (1 - Math.pow(r, 2))));
        const displayMsg = dropMessages[i % dropMessages.length];

        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`claim_drop_${Date.now()}_${i}`)
              .setLabel('Claim')
              .setStyle(ButtonStyle.Primary),
          );

        const dropMsg = await message.channel.send({
          content: `${displayMsg} The first person to click the button below claims it.`,
          components: [row]
        });

        const collector = dropMsg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 60000
        });

        collector.on('collect', async (interaction) => {
          if (interaction.customId.startsWith('claim_drop_')) {
            const winner = await storage.getDiscordUser(interaction.user.id);
            const newBalance = winner.genies + amount;
            await storage.updateDiscordUserGenies(interaction.user.id, newBalance);

            await storage.createBotLog(`Drop: ${interaction.user.username} claimed ${amount} Gens`);
            
            await interaction.update({
              content: `✨ <@${interaction.user.id}> was the fastest and claimed the drop of **${amount}** Gens! Their new balance is **${newBalance}** Gens.`,
              components: [],
              allowedMentions: { users: [interaction.user.id] }
            });
            
            collector.stop('claimed');
          }
        });

        collector.on('end', (collected, reason) => {
          if (reason === 'time' && collected.size === 0) {
            dropMsg.edit({ content: "⌛ The drop has expired. No one claimed it in time.", components: [] }).catch(() => {});
          }
        });
        
        // Small delay between multiple drops to avoid rate limits and keep it exciting
        if (dropCount > 1 && i < dropCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

    } catch (error) {
      console.error('Error in drop command:', error);
    }
  }

  // Admin Commands (User Exclusive)
  const ADMIN_ID = "926063716057894953";
  if (message.author.id === ADMIN_ID) {
    if (command === 'set') {
      try {
        const target = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        const amount = parseInt(args[1]);
        if (!target || isNaN(amount)) return message.reply("Usage: `;set @user <amount>`");
        await storage.updateDiscordUserGenies(target.id, amount);
        await message.reply(`Successfully set **${target.user.username}**'s balance to **${amount}** Gens.`);
      } catch (error) {
        console.error('Error in set:', error);
      }
    }
    if (command === 'reset') {
      try {
        const target = message.mentions.members?.first() || message.guild?.members.cache.get(args[0]);
        if (!target) return message.reply("Usage: `;reset @user` or `;reset <id>`");
        await storage.updateDiscordUserGenies(target.id, 100);
        await message.reply(`Successfully reset **${target.user.username}**'s balance to **100** Gens.`);
      } catch (error) {
        console.error('Error in reset:', error);
      }
    }
  }
});

export async function startDiscordBot() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.warn('DISCORD_TOKEN not found. Discord bot will not start.');
    return;
  }

  try {
    await client.login(token);

    // Setup periodic drops
    setInterval(async () => {
      try {
        const guilds = client.guilds.cache;
        for (const [guildId, guild] of Array.from(guilds)) {
          // Find the first channel we can send messages to
          const channel = guild.channels.cache.find((c: any) => 
            c.isTextBased() && 
            c.permissionsFor(client.user!)?.has(['SendMessages', 'ViewChannel'])
          );

          if (channel && channel.isTextBased()) {
            const r = Math.random();
            const amount = Math.floor(50 + (200 * (1 - Math.pow(r, 2))));
            const dropMessages = [
              "📦 **A random Gens drop has appeared!**",
              "🎁 **A gift has fallen from the sky!**",
              "💎 **A rare Gens cache was found!**",
              "💰 **A bag of Gens has been spotted!**",
              "✨ **A magical Gens surge is happening!**"
            ];
            const displayMsg = dropMessages[Math.floor(Math.random() * dropMessages.length)];

            const row = new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(`claim_auto_drop_${Date.now()}`)
                  .setLabel('Claim')
                  .setStyle(ButtonStyle.Primary),
              );

            const dropMsg = await channel.send({
              content: `${displayMsg} The first person to click the button below claims it.`,
              components: [row]
            });

            const collector = dropMsg.createMessageComponentCollector({
              componentType: ComponentType.Button,
              time: 60000
            });

            collector.on('collect', async (interaction: any) => {
              if (interaction.customId.startsWith('claim_auto_drop_')) {
                const winner = await storage.getDiscordUser(interaction.user.id);
                const newBalance = winner.genies + amount;
                await storage.updateDiscordUserGenies(interaction.user.id, newBalance);
                await storage.createBotLog(`AutoDrop: ${interaction.user.username} claimed ${amount} Gens`);
                await interaction.update({
                  content: `✨ <@${interaction.user.id}> was the fastest and claimed the drop of **${amount}** Gens!`,
                  components: [],
                  allowedMentions: { users: [interaction.user.id] }
                });
                collector.stop('claimed');
              }
            });

            collector.on('end', (collected: any, reason: string) => {
              if (reason === 'time' && collected.size === 0) {
                dropMsg.edit({ content: "⌛ The drop has expired.", components: [] }).catch(() => {});
              }
            });
          }
        }
      } catch (err) {
        console.error('Error in periodic drop interval:', err);
      }
    }, Math.floor(Math.random() * (10 - 5 + 1) + 5) * 60 * 1000); // 5-10 mins

  } catch (error) {
    console.error('Failed to login to Discord:', error);
  }
}
