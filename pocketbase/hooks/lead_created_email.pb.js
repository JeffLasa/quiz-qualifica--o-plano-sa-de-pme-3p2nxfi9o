// Notification email hook when a new lead is submitted from the quiz
onRecordCreate((e) => {
  e.next()

  const record = e.record
  if (!record) return

  const nome = record.getString('nome') || 'Empresário(a)'
  const leadEmail = record.getString('email')
  const whatsapp = record.getString('whatsapp') || '-'
  const empresa = record.getString('empresa') || '-'
  const vidas = record.getString('qtd_vidas') || '-'
  const idades = record.getString('idades_vidas')
  const vidasTexto = idades
    ? `${idades.split(/[;,\s]+/).filter(Boolean).length} vidas (${idades})`
    : `${vidas} vidas`
  const cidade = record.getString('cidade_uf') || '-'
  const score = record.getInt('score') || 0
  const operadora = record.getString('operadora_atual') || 'Sem plano atual'
  const prazo = record.getString('prazo_contratacao') || '-'

  // 1. Email para o corretor responsável (Lasacor)
  try {
    const adminEmail = 'jeff.lasa8@gmail.com'
    const brokerMsg = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress || 'contato@lasacor.com.br',
        name: 'Quiz PME Porto Saúde | Lasacor',
      },
      to: [{ address: adminEmail, name: 'Jeff Lasacor' }],
      subject: `🚨 Novo Lead PME Porto Saúde: ${nome} (${vidasTexto} - Score ${score})`,
      html: `
        <div style="font-family: Montserrat, Arial, sans-serif; color: #04325C; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E3F0FA; border-radius: 12px;">
          <div style="background: #0066B2; padding: 16px 20px; border-radius: 8px; color: #ffffff; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">Novo Lead de Plano de Saúde PME</h2>
            <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Quiz Interativo Porto Saúde · Lasacor</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="border-bottom: 1px solid #E3F0FA;"><td style="padding: 8px; font-weight: bold; width: 140px;">Nome:</td><td style="padding: 8px;">${nome}</td></tr>
            <tr style="border-bottom: 1px solid #E3F0FA;"><td style="padding: 8px; font-weight: bold;">WhatsApp:</td><td style="padding: 8px;"><a href="https://wa.me/55${whatsapp.replace(/\D/g, '')}" style="color: #0066B2; font-weight: bold;">${whatsapp}</a></td></tr>
            <tr style="border-bottom: 1px solid #E3F0FA;"><td style="padding: 8px; font-weight: bold;">E-mail:</td><td style="padding: 8px;">${leadEmail}</td></tr>
            <tr style="border-bottom: 1px solid #E3F0FA;"><td style="padding: 8px; font-weight: bold;">Empresa:</td><td style="padding: 8px;">${empresa}</td></tr>
            <tr style="border-bottom: 1px solid #E3F0FA;"><td style="padding: 8px; font-weight: bold;">Idades das vidas:</td><td style="padding: 8px;"><strong>${idades || `${vidas} vidas (faixa)`}</strong></td></tr>
            <tr style="border-bottom: 1px solid #E3F0FA;"><td style="padding: 8px; font-weight: bold;">Cidade/UF:</td><td style="padding: 8px;">${cidade}</td></tr>
            <tr style="border-bottom: 1px solid #E3F0FA;"><td style="padding: 8px; font-weight: bold;">Operadora atual:</td><td style="padding: 8px;">${operadora}</td></tr>
            <tr style="border-bottom: 1px solid #E3F0FA;"><td style="padding: 8px; font-weight: bold;">Prazo:</td><td style="padding: 8px;">${prazo}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Score:</td><td style="padding: 8px;"><span style="background: #E3F0FA; color: #0066B2; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${score} / 100</span></td></tr>
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="https://wa.me/55${whatsapp.replace(/\D/g, '')}" style="background: #1FA971; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Chamar no WhatsApp agora
            </a>
          </div>
        </div>
      `,
    })
    $app.newMailClient().send(brokerMsg)
  } catch (err) {
    console.error('Erro ao enviar email de notificação ao corretor:', err)
  }

  // 2. Email de confirmação e boas-vindas para o Lead
  if (leadEmail) {
    try {
      const leadMsg = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress || 'contato@lasacor.com.br',
          name: 'Porto Saúde | Lasacor Corretora',
        },
        to: [{ address: leadEmail, name: nome }],
        subject: `Recebemos suas informações, ${nome.split(' ')[0]}! Sua cotação Porto Saúde está sendo preparada`,
        html: `
          <div style="font-family: Montserrat, Arial, sans-serif; color: #04325C; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E3F0FA; border-radius: 12px;">
            <div style="background: #0066B2; padding: 20px; border-radius: 8px; color: #ffffff; text-align: center;">
              <h2 style="margin: 0; font-size: 22px;">Porto Saúde · Lasacor Corretora</h2>
              <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Estudo de Redução de Custos e Cobertura PME</p>
            </div>
            <div style="padding: 20px 0; font-size: 15px; line-height: 1.6;">
              <p>Olá, <strong>${nome}</strong>!</p>
              <p>Recebemos com sucesso as respostas da sua empresa para o estudo de plano de saúde PME da <strong>Porto Saúde</strong>.</p>
              <p>Nosso especialista parceiro da <strong>Lasacor</strong> já está analisando as condições para ${vidasTexto} na sua região (${cidade}) para apresentar as melhores opções de redução de custos com ampla rede de atendimento.</p>
              <div style="background: #F4F8FC; border-left: 4px solid #0066B2; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #04325C;">
                  ⏳ <strong>Próximo passo:</strong> Entraremos em contato via WhatsApp no número <strong>${whatsapp}</strong> em até 24 horas úteis com o seu comparativo.
                </p>
              </div>
              <p>Se preferir falar conosco agora mesmo, você pode nos chamar no WhatsApp da corretora.</p>
            </div>
            <div style="border-top: 1px solid #E3F0FA; padding-top: 16px; font-size: 12px; color: #5A7184; text-align: center;">
              Lasacor Corretora de Seguros · CNPJ 54.872.220/0001-34<br/>
              Em conformidade com a LGPD.
            </div>
          </div>
        `,
      })
      $app.newMailClient().send(leadMsg)
    } catch (err) {
      console.error('Erro ao enviar email de confirmação ao lead:', err)
    }
  }
}, 'leads')
