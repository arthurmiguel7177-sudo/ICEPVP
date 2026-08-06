//         +-------------------------+
//       .'                         .'|
//      +-------------------------+  |
//      |                         |  |
//      |         🧊 ICE 🧊         |  |
//      |         PVP NETWORK     |  |
//      |                         |  |
//      |                         | +
//      |                         |.'
//      +-------------------------+
//

const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder,
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits, 
    ChannelType,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');
const express = require('express');
require('dotenv').config();

// Servidor Web para manter o bot acordado no Render / UptimeRobot
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('ICE PVP Bot está online e ativo!');
});

app.listen(PORT, () => {
    console.log(`Servidor web rodando na porta ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages
    ]
});

const CONFIG = {
    embedColor: "#00f0ff",
    serverIP: "icepvp.mcsh.io",
    vipRoleId: "1522775069938679929",
    helperRoleId: "1528097766872715296",
    managerRoleId: "1528098256125431908",
    staffRoleId: "1522329690658836541",
    canalAnaliseId: "1533565153872838846",
    canalResultadosId: "1533563483726151724",
    criadorId: "1455673414470729893"
};

// Armazenamento temporário para as sessões de recrutamento na DM
const recrutamentoDMSessoes = new Map();

// ==============================================================================
// 🧊 1. REGISTRO DE SLASH COMMANDS 🧊
// ==============================================================================

const commands = [
    new SlashCommandBuilder()
        .setName('regras')
        .setDescription('Exibe o regulamento completo do servidor ICE PVP'),

    new SlashCommandBuilder()
        .setName('staf')
        .setDescription('Exibe a lista de membros da Staff do servidor'),

    new SlashCommandBuilder()
        .setName('equipe')
        .setDescription('Mostra os membros da equipe e quem está ativo no momento'),

    new SlashCommandBuilder()
        .setName('vips')
        .setDescription('Mostra a quantidade e a lista de membros com o cargo VIP'),

    new SlashCommandBuilder()
        .setName('ip')
        .setDescription('Mostra o IP oficial do ICE PVP'),

    new SlashCommandBuilder()
        .setName('loja')
        .setDescription('Informações sobre a loja de VIPs do servidor'),

    new SlashCommandBuilder()
        .setName('recrutamento')
        .setDescription('Envia o painel de recrutamento da equipe'),

    new SlashCommandBuilder()
        .setName('criador')
        .setDescription('Mostra o criador e desenvolvedor deste bot'),

    new SlashCommandBuilder()
        .setName('painelticket')
        .setDescription('Envia o painel interativo de suporte (Apenas Admins)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

async function registerSlashCommands(clientId, guildId) {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || process.env.DISCORD_TOKEN);
    try {
        console.log('[SLASH] Sincronizando comandos no servidor...');
        if (guildId) {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        }
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('[SLASH] Comandos sincronizados com sucesso!');
    } catch (error) {
        console.error('[SLASH ERRO] Falha ao registrar comandos:', error);
    }
}

// ==============================================================================
// 🧊 2. EVENTO READY 🧊
// ==============================================================================

client.once('ready', async () => {
    console.clear();
    console.log("==================================================");
    console.log("                🧊 ICE PVP BOT 🧊                  ");
    console.log("==================================================");
    console.log(`[STATUS] Bot rodando como: ${client.user.tag}`);
    console.log("==================================================");

    client.user.setActivity(`🧊 ICE PVP | /regras`, { type: 0 });
});

// ==============================================================================
// 🧊 3. EXECUÇÃO DE COMANDOS E INTERAÇÕES 🧊
// ==============================================================================

client.on('interactionCreate', async (interaction) => {

    if (interaction.isChatInputCommand()) {
        const { commandName, guild } = interaction;

        if (commandName === 'ip') {
            const ipEmbed = new EmbedBuilder()
                .setTitle("🧊 CONECTE-SE AO ICE PVP")
                .setColor(CONFIG.embedColor)
                .setDescription("Entre agora mesmo no nosso servidor!")
                .addFields(
                    { name: "🌐 IP do Servidor", value: `\`${CONFIG.serverIP}\``, inline: false },
                    { name: "⚡ Versão Recomendada", value: "`1.8.x `", inline: true }
                )
                .setFooter({ text: "ICE PVP Network" })
                .setTimestamp();

            return interaction.reply({ embeds: [ipEmbed] });
        }

        if (commandName === 'loja') {
            const storeEmbed = new EmbedBuilder()
                .setTitle("🛒 LOJA VIP — ICE PVP")
                .setColor("#f1c40f")
                .setDescription("🚧 **Loja em Desenvolvimento!**\n\nEm breve você poderá adquirir VIPs e vantagens exclusivas!");

            return interaction.reply({ embeds: [storeEmbed] });
        }

        if (commandName === 'criador') {
            const creatorEmbed = new EmbedBuilder()
                .setTitle("🛠️ DESENVOLVEDOR / CRIADOR")
                .setColor(CONFIG.embedColor)
                .setDescription(`Este bot foi programado e desenvolvido exclusivamente por <@${CONFIG.criadorId}>!`)
                .setTimestamp();

            return interaction.reply({ embeds: [creatorEmbed] });
        }

        if (commandName === 'recrutamento') {
            const recruitEmbed = new EmbedBuilder()
                .setTitle("Recruitment Process – ICE PVP Team")
                .setColor(CONFIG.embedColor)
                .setDescription(
                    "**Welcome!**\n" +
                    "You are starting your application for the **ICE PVP** staff team. Please read the instructions carefully before proceeding.\n\n" +
                    "**Important Guidelines**\n" +
                    "• The review process may take up to **7 business days**.\n" +
                    "• Approved candidates will be contacted via **Discord** (keep your DMs open).\n" +
                    "• We never ask for **passwords, files, or any kind of sensitive information**.\n\n" +
                    "**Basic Requirements**\n" +
                    "• Good communication and writing skills\n" +
                    "• Respectful attitude both inside and outside the server\n" +
                    "• Appropriate behavior with the community\n" +
                    "• Commitment to the team\n\n" +
                    "📨 Good luck with your application!"
                )
                .setImage(guild.iconURL({ dynamic: true }));

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_iniciar_recrutamento_dm')
                    .setLabel('Submit Application')
                    .setStyle(ButtonStyle.Primary)
            );

            return interaction.reply({ embeds: [recruitEmbed], components: [row] });
        }

        if (commandName === 'staf') {
            await interaction.deferReply();
            try {
                const getMembersByRoleName = (roleName) => {
                    const role = guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
                    if (!role) return "*(Cargo não encontrado)*";
                    const members = role.members.map(m => `<@${m.user.id}>`);
                    return members.length > 0 ? members.join(', ') : "*(Nenhum membro)*";
                };

                const getMembersById = (roleId) => {
                    if (!roleId) return "*(Não configurado)*";
                    const role = guild.roles.cache.get(roleId);
                    if (!role) return "*(Cargo não encontrado)*";
                    const members = role.members.map(m => `<@${m.user.id}>`);
                    return members.length > 0 ? members.join(', ') : "*(Nenhum membro)*";
                };

                const staffEmbed = new EmbedBuilder()
                    .setTitle("👑 EQUIPE DE STAFF — ICE PVP")
                    .setColor(CONFIG.embedColor)
                    .addFields(
                        { name: "👑 Owners", value: getMembersByRoleName("Owners"), inline: false },
                        { name: "🛡️ Co-Owner", value: getMembersByRoleName("Co-Owner"), inline: false },
                        { name: "⭐ Admins", value: getMembersByRoleName("Admins"), inline: false },
                        { name: "📊 Manager", value: getMembersById(CONFIG.managerRoleId), inline: false },
                        { name: "⚡ Staff", value: getMembersById(CONFIG.staffRoleId), inline: false },
                        { name: "🤝 Helper", value: getMembersById(CONFIG.helperRoleId), inline: false }
                    )
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setTimestamp();

                return await interaction.editReply({ embeds: [staffEmbed] });
            } catch (err) {
                console.error(err);
                return interaction.editReply({ content: "❌ Erro ao listar a Staff." });
            }
        }

        if (commandName === 'equipe') {
            await interaction.deferReply();
            try {
                const role = guild.roles.cache.get(CONFIG.staffRoleId) || guild.roles.cache.find(r => r.name.toLowerCase() === 'staf' || r.name.toLowerCase() === 'staff');

                if (!role) {
                    return interaction.editReply('O cargo de equipe principal não foi encontrado neste servidor.');
                }

                const membrosEquipe = role.members;
                const onlineStaff = [];
                const offlineStaff = [];

                membrosEquipe.forEach(member => {
                    const status = member.presence?.status;
                    if (status && status !== 'offline') {
                        onlineStaff.push(`<@${member.id}> (${status})`);
                    } else {
                        offlineStaff.push(`<@${member.id}>`);
                    }
                });

                const embed = new EmbedBuilder()
                    .setTitle('🛡️ Status da Equipe')
                    .setColor(CONFIG.embedColor)
                    .addFields(
                        { name: `🟢 Ativos (${onlineStaff.length})`, value: onlineStaff.length > 0 ? onlineStaff.join('\n') : 'Ninguém online no momento', inline: false },
                        { name: `⚪ Offline / Ausentes (${offlineStaff.length})`, value: offlineStaff.length > 0 ? offlineStaff.join('\n') : 'Nenhum', inline: false }
                    )
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            } catch (err) {
                console.error(err);
                return interaction.editReply({ content: "❌ Erro ao verificar a equipe." });
            }
        }

        if (commandName === 'vips') {
            await interaction.deferReply();
            try {
                const roleVip = guild.roles.cache.get(CONFIG.vipRoleId);

                if (!roleVip) {
                    return interaction.editReply('O cargo VIP não foi encontrado neste servidor com este ID.');
                }

                const membrosVip = roleVip.members;
                const listaVips = membrosVip.map(member => `<@${member.id}>`).join('\n') || 'Nenhum membro com cargo VIP no momento.';

                const embedVip = new EmbedBuilder()
                    .setTitle('⭐ Membros VIPs')
                    .setColor('#ffd700')
                    .setDescription(`Total de membros com o cargo VIP: **${membrosVip.size}**\n\n**Lista:**\n${listaVips}`)
                    .setTimestamp();

                return interaction.editReply({ embeds: [embedVip] });
            } catch (err) {
                console.error(err);
                return interaction.editReply({ content: "❌ Erro ao listar os VIPs." });
            }
        }

        if (commandName === 'regras') {
            const rulesEmbed = new EmbedBuilder()
                .setTitle("📜 REGRAS")
                .setColor(CONFIG.embedColor)
                .setDescription("> *To maintain a fair, competitive and enjoyable environment, all players must follow the rules below.*\n\u200b")
                .addFields(
                    {
                        name: "🔇 CHAT MUTES",
                        value: 
                            "• Unauthorized links (except approved creators)\n" +
                            "• Advertising servers, communities or services\n" +
                            "• Selling items outside allowed channels\n" +
                            "• Bypassing chat filters\n" +
                            "• Toxic or disrespectful behavior\n" +
                            "• Mild discrimination\n" +
                            "• Inappropriate content\n" +
                            "• Spam, flooding or repetitive messages\n\u200b",
                        inline: false
                    },
                    {
                        name: "⛔ PERMANENT CHAT MUTES",
                        value: 
                            "• Harassment, bullying, threats or intimidation\n" +
                            "• Racist, hateful or discriminatory speech\n" +
                            "• Encouraging suicide or self-harm\n" +
                            "• Intentional provocation to create conflicts\n" +
                            "• Sexual, NSFW or 18+ content\n\u200b",
                        inline: false
                    },
                    {
                        name: "👢 KICKS",
                        value: 
                            "• Interfering with staff or server systems\n" +
                            "• Repeated false reports\n" +
                            "• Intentionally avoiding combat\n" +
                            "• Disruptive gameplay behavior\n" +
                            "• Situations where staff consider a kick necessary\n\u200b",
                        inline: false
                    },
                    {
                        name: "🚫 PERMANENT BANS",
                        value: 
                            "• Cheats, hacks or unfair advantages\n" +
                            "• Exploiting bugs or unintended mechanics\n" +
                            "• DDoS threats or attacks\n" +
                            "• Account sharing to evade punishments\n" +
                            "• Ban evasion\n" +
                            "• Impersonating staff members\n" +
                            "• Actions that seriously damage the community\n\u200b",
                        inline: false
                    },
                    {
                        name: "⏳ TEMPORARY BANS",
                        value: 
                            "• Repeated combat avoidance\n" +
                            "• Match fixing or collusion\n" +
                            "• Bug abuse\n" +
                            "• Offensive builds\n" +
                            "• Unsportsmanlike behavior\n" +
                            "• Stat boosting\n\u200b",
                        inline: false
                    },
                    {
                        name: "📌 Additional Information",
                        value: 
                            "• Punishments may be increased for repeated offenses\n" +
                            "• Staff decisions are final\n" +
                            "• Rules may be updated without prior notice",
                        inline: false
                    }
                )
                .setFooter({ text: "ICE PVP Network" })
                .setTimestamp();

            return interaction.reply({ embeds: [rulesEmbed] });
        }

        if (commandName === 'painelticket') {
            const ticketEmbed = new EmbedBuilder()
                .setTitle("🎫 CENTRAL DE ATENDIMENTO — ICE PVP")
                .setColor(CONFIG.embedColor)
                .setDescription(
                    "Selecione no menu abaixo o **tipo de atendimento** que você precisa:\n\n" +
                    "🛠️ **Suporte Geral (Privado):** Dúvidas, denúncias e auxílio privado.\n" +
                    "🏆 **Entrar na Equipe (Recrutamento):** Inicia sua ficha na DM!\n" +
                    "💬 **Atendimento / Dúvida Pública:** Canal aberto para a comunidade interagir."
                )
                .setFooter({ text: "ICE PVP — Selecione uma opção abaixo" });

            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_ticket_type')
                    .setPlaceholder('Clique aqui e escolha a categoria...')
                    .addOptions([
                        {
                            label: 'Suporte Geral & Dúvidas',
                            description: 'Ticket Privado para tratar de bugs ou conta.',
                            value: 'suporte_privado',
                            emoji: '🛠️'
                        },
                        {
                            label: 'Entrar na Equipe (Recrutamento)',
                            description: 'Inicia o formulário de Staff na DM.',
                            value: 'equipe_publico',
                            emoji: '🏆'
                        },
                        {
                            label: 'Atendimento Público',
                            description: 'Ticket Aberto/Público geral.',
                            value: 'suporte_publico',
                            emoji: '💬'
                        }
                    ])
            );

            await interaction.reply({ content: "✅ Painel enviado com sucesso!", ephemeral: true });
            return interaction.channel.send({ embeds: [ticketEmbed], components: [selectMenu] });
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'select_ticket_type') {
        const selectedValue = interaction.values[0];
        const { guild, user } = interaction;

        if (selectedValue === 'equipe_publico') {
            return iniciarRecrutamentoDM(guild, user, interaction);
        }

        const cleanUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
        let prefix = "ticket";
        let isPrivate = true;
        let categoryTitle = "";

        if (selectedValue === 'suporte_privado') {
            prefix = "privado";
            isPrivate = true;
            categoryTitle = "🛠️ Suporte Geral (Privado)";
        } else if (selectedValue === 'suporte_publico') {
            prefix = "publico";
            isPrivate = false;
            categoryTitle = "💬 Atendimento Público";
        }

        const channelName = `${prefix}-${cleanUsername}`;

        const existingChannel = guild.channels.cache.find(c => c.name === channelName);
        if (existingChannel) {
            return interaction.reply({ content: `⚠️ Você já possui um ticket desse tipo aberto em: ${existingChannel}`, ephemeral: true });
        }

        let permissionOverwrites = [];

        if (isPrivate) {
            permissionOverwrites = [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
            ];
        } else {
            permissionOverwrites = [
                { id: guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
            ];
        }

        const ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: permissionOverwrites
        });

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(categoryTitle)
            .setColor(CONFIG.embedColor)
            .setDescription(
                `Olá <@${user.id}>!\n\n` +
                `• **Visibilidade:** ${isPrivate ? "🔒 Privado" : "🌐 Público (Todos do servidor enxergam)"}\n` +
                `• **Solicitante:** <@${user.id}>\n\n` +
                "Explique seu problema para a equipe lhe atender."
            )
            .setFooter({ text: "Clique no botão abaixo para fechar este ticket." });

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_close_ticket')
                .setLabel('Fechar Ticket')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `<@${user.id}>`, embeds: [welcomeEmbed], components: [closeBtn] });
        return interaction.reply({ content: `✅ Ticket criado em: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.isButton()) {
        const { customId, guild, message, user } = interaction;

        if (customId === 'btn_close_ticket') {
            await interaction.reply({ content: "🔒 Canal sendo fechado em **5 segundos**..." });
            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 5000);
        }

        if (customId === 'btn_iniciar_recrutamento_dm') {
            return iniciarRecrutamentoDM(guild, user, interaction);
        }

        if (customId === 'btn_aceitar_ficha' || customId === 'btn_recusar_ficha') {
            const isAceitar = customId === 'btn_aceitar_ficha';
            const embedOriginal = message.embeds[0];

            if (!embedOriginal) {
                return interaction.reply({ content: '❌ Erro ao localizar os dados da ficha.', ephemeral: true });
            }

            const updatedEmbed = EmbedBuilder.from(embedOriginal)
                .setColor(isAceitar ? '#2ecc71' : '#e74c3c')
                .addFields({ 
                    name: "📌 Status / Status", 
                    value: `${isAceitar ? '✅ Aceito / Accepted' : '❌ Recusado / Denied'} por <@${user.id}>` 
                });

            // Extrai o ID do candidato da própria ficha enviada no canal de análise
            const campoCandidato = embedOriginal.fields.find(f => f.name.includes("Candidato"));
            if (campoCandidato) {
                const matchId = campoCandidato.value.match(/<@!?(\d+)>/);
                if (matchId) {
                    const candidatoId = matchId[1];
                    try {
                        const candidatoUser = await client.users.fetch(candidatoId);
                        const dmCandidato = await candidatoUser.createDM();
                        
                        const dmResultadoEmbed = new EmbedBuilder()
                            .setTitle(isAceitar ? "🎉 FICHA APROVADA! / APPLICATION ACCEPTED!" : "❌ FICHA RECUSADA / APPLICATION DENIED")
                            .setColor(isAceitar ? '#2ecc71' : '#e74c3c')
                            .setDescription(
                                isAceitar 
                                ? `Parabéns! Sua ficha de recrutamento para o **${guild.name}** foi **ACEITA** por <@${user.id}>!\n*Congratulations! Your application for **${guild.name}** has been **ACCEPTED**!*`
                                : `Olá. Infelizmente sua ficha de recrutamento para o **${guild.name}** foi **RECUSADA** por <@${user.id}>.\n*Hello. Unfortunately your application for **${guild.name}** has been **DENIED**.*`
                            )
                            .setTimestamp();

                        await dmCandidato.send({ embeds: [dmResultadoEmbed] });
                    } catch (err) {
                        console.log("Não foi possível enviar a DM do resultado para o candidato (DM fechada).");
                    }
                }
            }

            await interaction.update({ embeds: [updatedEmbed], components: [] });

            const canalResultados = guild.channels.cache.get(CONFIG.canalResultadosId);
            if (canalResultados) {
                await canalResultados.send({ embeds: [updatedEmbed] }).catch(() => {});
            }
        }
    }
});

// ==============================================================================
// 🧊 4. SISTEMA DE RECRUTAMENTO VIA DM (MENSAGEM PRIVADA) 🧊
// ==============================================================================

async function iniciarRecrutamentoDM(guild, user, interaction) {
    if (recrutamentoDMSessoes.has(user.id)) {
        // Envia a mensagem efêmera avisando e configura para deletar em 5 segundos
        const replyMsg = await interaction.reply({ content: `⚠️ Você já tem um processo de recrutamento ativo na sua **DM**. Verifique suas mensagens privadas!\n⚠️ You already have an active application in your **DMs**!`, ephemeral: true, fetchReply: true });
        setTimeout(() => {
            interaction.deleteReply().catch(() => {});
        }, 5000);
        return;
    }

    try {
        const dmChannel = await user.createDM();
        
        recrutamentoDMSessoes.set(user.id, {
            passo: 1,
            nick: '',
            idade: '',
            cargo: '',
            motivo: '',
            guildId: guild.id
        });

        const inicioEmbed = new EmbedBuilder()
            .setTitle("🏆 RECRUITMENT FORM (DM) / FORMULÁRIO")
            .setColor(CONFIG.embedColor)
            .setDescription(
                `Olá! Você iniciou o recrutamento para o servidor **ICE PvP**.\n` +
                `*Hello! You started your application for the **ICE PvP** server.*\n\n` +
                `💡 *A qualquer momento, digite **cancelar** ou **stop** para cancelar a ficha.*\n` +
                `💡 *At any time, type **cancel** or **stop** to cancel your application.*\n\n` +
                `**Pergunta 1/4 / Question 1/4:**\n` +
                `Qual o seu **nick no Minecraft**? / *What is your **Minecraft username**?*`
            );

        await dmChannel.send({ embeds: [inicioEmbed] });

        // Envia a mensagem de confirmação e deleta em 5 segundos
        const replyMsg = await interaction.reply({ content: `✅ Iniciei o recrutamento na sua **DM (Mensagem Privada)**! Verifique suas conversas.\n✅ I've started the application in your **DMs**!`, ephemeral: true, fetchReply: true });
        setTimeout(() => {
            interaction.deleteReply().catch(() => {});
        }, 5000);
    } catch (error) {
        console.error("Erro ao enviar DM:", error);
        const replyMsg = await interaction.reply({ content: `❌ Não consegui te enviar uma mensagem na DM. Verifique se suas mensagens diretas estão abertas!\n❌ Could not send you a DM. Please check if your DMs are open!`, ephemeral: true, fetchReply: true });
        setTimeout(() => {
            interaction.deleteReply().catch(() => {});
        }, 5000);
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.guild) return;

    const session = recrutamentoDMSessoes.get(message.author.id);
    if (!session) return;

    const resposta = message.content;
    const respostaLower = resposta.toLowerCase();

    // Sistema de cancelamento
    if (respostaLower === 'cancelar' || respostaLower === 'stop') {
        recrutamentoDMSessoes.delete(message.author.id);
        const cancelEmbed = new EmbedBuilder()
            .setTitle("❌ RECRUTAMENTO CANCELADO / CANCELLED")
            .setColor("#e74c3c")
            .setDescription("Seu processo de recrutamento foi cancelado com sucesso.\n*Your application process has been successfully cancelled.*");
        return message.channel.send({ embeds: [cancelEmbed] });
    }

    const guild = client.guilds.cache.get(session.guildId);

    if (session.passo === 1) {
        session.nick = resposta;
        session.passo = 2;
        const embed2 = new EmbedBuilder()
            .setTitle("🏆 RECRUITMENT FORM / FORMULÁRIO")
            .setColor(CONFIG.embedColor)
            .setDescription(
                `💡 *Digite **cancelar** ou **stop** a qualquer momento para sair.*\n\n` +
                `**Pergunta 2/4 / Question 2/4:**\n` +
                `Qual a sua **idade**? / *What is your **age**?*`
            );
        return message.channel.send({ embeds: [embed2] });
    }

    if (session.passo === 2) {
        session.idade = resposta;
        session.passo = 3;
        const embed3 = new EmbedBuilder()
            .setTitle("🏆 RECRUITMENT FORM / FORMULÁRIO")
            .setColor(CONFIG.embedColor)
            .setDescription(
                `💡 *Digite **cancelar** ou **stop** a qualquer momento para sair.*\n\n` +
                `**Pergunta 3/4 / Question 3/4:**\n` +
                `Qual **cargo** você deseja? *(Ex: Helper / Staff)*\n` +
                `*What **role** do you want? (Ex: Helper / Staff)*`
            );
        return message.channel.send({ embeds: [embed3] });
    }

    if (session.passo === 3) {
        session.cargo = resposta;
        session.passo = 4;
        const embed4 = new EmbedBuilder()
            .setTitle("🏆 RECRUITMENT FORM / FORMULÁRIO")
            .setColor(CONFIG.embedColor)
            .setDescription(
                `💡 *Digite **cancelar** ou **stop** a qualquer momento para sair.*\n\n` +
                `**Pergunta 4/4 (Última) / Question 4/4 (Last):**\n` +
                `Por que nós devemos te escolher? *(Escreva detalhadamente)*\n` +
                `*Why should we choose you? (Write in detail)*`
            );
        return message.channel.send({ embeds: [embed4] });
    }

    if (session.passo === 4) {
        session.motivo = resposta;
        
        if (guild) {
            const fichaEmbed = new EmbedBuilder()
                .setTitle("📋 NOVA FICHA DE RECRUTAMENTO / NEW APPLICATION (DM)")
                .setColor(CONFIG.embedColor)
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Candidato / Candidate", value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
                    { name: "⛏️ Nick no Minecraft / MC Nick", value: session.nick, inline: true },
                    { name: "📅 Idade / Age", value: session.idade, inline: true },
                    { name: "🛡️ Cargo Desejado / Desired Role", value: session.cargo, inline: true },
                    { name: "💬 Por que escolher? / Why choose?", value: session.motivo, inline: false }
                )
                .setTimestamp();

            const botoesAnalise = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_aceitar_ficha')
                    .setLabel('Accept / Aceitar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('btn_recusar_ficha')
                    .setLabel('Deny / Recusar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            const canalAnalise = guild.channels.cache.get(CONFIG.canalAnaliseId);
            if (canalAnalise) {
                await canalAnalise.send({ embeds: [fichaEmbed], components: [botoesAnalise] });
            }
        }

        const fimEmbed = new EmbedBuilder()
            .setTitle("✅ FICHA ENVIADA COM SUCESSO! / APPLICATION SUBMITTED!")
            .setColor("#2ecc71")
            .setDescription(
                "Suas respostas foram enviadas para a análise da staff do servidor. Obrigado por participar!\n" +
                "*Your answers have been sent to the staff team for review. Thank you for applying!*"
            );

        await message.channel.send({ embeds: [fimEmbed] });

        recrutamentoDMSessoes.delete(message.author.id);
    }
});

client.login(process.env.TOKEN || process.env.DISCORD_TOKEN);
