const Discord = require('discord.js');
const SteamAPI = require('steamapi');
const client = new Discord.Client();
const sAPI = new SteamAPI(process.env['STEAM_API_KEY']);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildCreate", guild => {
    // This triggers when our boyo joins a new party
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    // This event is what happens when boyo get kicked out of said party
    console.log(`User has been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on('message', msg => {
    if (msg.content.startsWith('!nolife')) {
        let steamID = msg.content.split(' ', 2);
        if(steamID.length <= 1) {
            msg.reply("Gimme your Steam ID please, so I can tell you how empty your life is!");
            return;
        }
        steamID = steamID[1];
        if(!steamID.startsWith("http")) {
            steamID = "https://steamcommunity.com/id/" + steamID;
        }
        sAPI.resolve(steamID)
            .then((id) => {
                sAPI.getUserOwnedGames(id)
                    .then((res) => {
                        res.sort((a, b) => {
                            return b.playTime - a.playTime;
                        });
                        let totalTime = 0;
                        let totalRecentTime = 0;
                        for(let item of res) {
                            totalTime += item.playTime;
                            totalRecentTime += item.playTime2;
                        }
                        let topGame = res[0];
                        res.sort((a, b) => {
                            return b.playTime2 - a.playTime2;
                        });
                        let topRecent = res[0];
                        let reply = new Discord.RichEmbed()
                            .setColor('#0099ff')
                            .setTitle(msg.author.username + " has no life")
                            .setURL(steamID)
                            .setDescription('Here\'s a summary of how much time you\'ve wasted:')
                            .addField('All time days', Math.round(totalTime / 60 / 24) + " days", true)
                            .addField('Past two weeks', (totalRecentTime / 60) + " hours", true)
                            .addBlankField()
                            .addField('Top Game', topGame.name, true)
                            .addField('Hours', Math.round(topGame.playTime / 60) + " hours", true)
                            .addBlankField()
                            .addField('Top Recent Game', topRecent.name, true)
                            .addField('Recent Hours', Math.round(topRecent.playTime2 / 60) + " hours", true)
                            .setTimestamp()
                            .setFooter('Made with love by @duper51');
                        msg.channel.send(reply);
                    })
                    .catch((err) => {
                        console.warn(err);
                        msg.reply("Steam gave me some error, try again later.");
                    })
            })
            .catch(() => {
                msg.reply("I couldn't find a Steam profile with that ID!");
            });
    }
});

client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find(ch => ch.name === 'general');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}`);
});

//client.on('')

client.login(process.env['DISCORD_SECRET']).then(r => client.user.setActivity(`Serving ${client.guilds.size} servers`));