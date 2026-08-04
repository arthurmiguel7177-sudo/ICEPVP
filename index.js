//         +-------------------------+
//       .'                         .'|
//      +-------------------------+  |
//      |                         |  |
//      |         🧊 ICE 🧊        |  |
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
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
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
        GatewayIntentBits.GuildPresences
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

    const firstGuild = client.guilds.cache.first();
    const guildId = firstGuild ? firstGuild.id : null;

    await registerSlashCommands(client.user.id, guildId);
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
                .setTitle("🏆 RECRUTAMENTO — ICE PVP")
                .setColor(CONFIG.embedColor)
                .setDescription("Clique no botão abaixo para abrir o formulário de recrutamento!");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_abrir_modal_recrutamento')
                    .setLabel('Enviar Ficha')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝')
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
                    "🏆 **Entrar na Equipe (Recrutamento):** Envie sua ficha diretamente via formulário!\n" +
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
                            description: 'Abre o formulário interativo de Staff.',
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
            return abrirModalRecrutamento(interaction);
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

        if (customId === 'btn_abrir_modal_recrutamento') {
            return abrirModalRecrutamento(interaction);
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
                    name: "📌 Status da Análise", 
                    value: `${isAceitar ? '✅ Aceito' : '❌ Recusado'} por <@${user.id}>` 
                });

            await interaction.update({ embeds: [updatedEmbed], components: [] });

            const canalResultados = guild.channels.cache.get(CONFIG.canalResultadosId);
            if (canalResultados) {
                await canalResultados.send({ embeds: [updatedEmbed] }).catch(() => {});
            }
        }
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_recrutamento') {
        const nick = interaction.fields.getTextInputValue('nick_minecraft');
        const idade = interaction.fields.getTextInputValue('idade');
        const cargo = interaction.fields.getTextInputValue('cargo_desejado');
        const motivo = interaction.fields.getTextInputValue('motivo');

        const fichaEmbed = new EmbedBuilder()
            .setTitle("📋 NOVA FICHA DE RECRUTAMENTO")
            .setColor(CONFIG.embedColor)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Candidato", value: `<@${interaction.user.id}> (${interaction.user.tag})`, inline: false },
                { name: "⛏️ Nick no Minecraft", value: nick, inline: true },
                { name: "📅 Idade", value: idade, inline: true },
                { name: "🛡️ Cargo Desejado", value: cargo, inline: true },
                { name: "💬 Por que escolher?", value: motivo, inline: false }
            )
            .setTimestamp();

        const botoesAnalise = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_aceitar_ficha')
                .setLabel('Aceitar')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('btn_recusar_ficha')
                .setLabel('Recusar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

        const canalAnalise = interaction.guild.channels.cache.get(CONFIG.canalAnaliseId);
        if (canalAnalise) {
            await canalAnalise.send({ embeds: [fichaEmbed], components: [botoesAnalise] });
        }

        return interaction.reply({ content: "✅ Sua ficha de recrutamento foi enviada com sucesso para a análise da staff!", ephemeral: true });
    }
});

async function abrirModalRecrutamento(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_recrutamento')
        .setTitle('Formulário de Recrutamento');

    const nickInput = new TextInputBuilder()
        .setCustomId('nick_minecraft')
        .setLabel('Qual seu nick no Minecraft?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: seu_nick')
        .setRequired(true);

    const idadeInput = new TextInputBuilder()
        .setCustomId('idade')
        .setLabel('Qual a sua idade?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: 16')
        .setRequired(true);

    const cargoInput = new TextInputBuilder()
        .setCustomId('cargo_desejado')
        .setLabel('Qual cargo você deseja?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Helper / Staf')
        .setRequired(true);

    const motivoInput = new TextInputBuilder()
        .setCustomId('motivo')
        .setLabel('Por que devemos te escolher?')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Escreva seu motivo aqui...')
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(nickInput),
        new ActionRowBuilder().addComponents(idadeInput),
        new ActionRowBuilder().addComponents(cargoInput),
        new ActionRowBuilder().addComponents(motivoInput)
    );

    return await interaction.showModal(modal);
}

client.login(process.env.TOKEN || process.env.DISCORD_TOKEN);
