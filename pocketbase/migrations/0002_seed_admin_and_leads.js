migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. Seed admin user idempotently
    let adminExists = false
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'jeff.lasa8@gmail.com')
      adminExists = true
    } catch (_) {
      adminExists = false
    }

    if (!adminExists) {
      const admin = new Record(users)
      admin.setEmail('jeff.lasa8@gmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Lasacor — Administração')
      app.save(admin)
    }

    // 2. Seed 3 realistic leads idempotently if empty
    const leadsCol = app.findCollectionByNameOrId('leads')
    const count = app.countRecords('leads')
    if (count === 0) {
      // Lead 1: Padaria Estrela de Santo André (6-10 vidas, SulAmérica, quer comparar)
      const lead1 = new Record(leadsCol)
      lead1.set('nome', 'Carlos Eduardo Mendes')
      lead1.set('whatsapp', '(11) 98765-4321')
      lead1.set('email', 'carlos.mendes@padariaestrela.com.br')
      lead1.set('empresa', 'Padaria Estrela do ABC Ltda')
      lead1.set('cnpj', '12.345.678/0001-90')
      lead1.set('qtd_vidas', '6-10')
      lead1.set('situacao_plano', 'ja-tenho')
      lead1.set('operadora_atual', 'SulAmérica')
      lead1.set('cidade_uf', 'Santo André / SP')
      lead1.set('prazo_contratacao', '30-dias')
      lead1.set('score', 82)
      lead1.set('status', 'novo')
      lead1.set('origem', 'quiz-pme-porto-saude')
      lead1.set(
        'respostas',
        JSON.stringify({
          qtd_vidas: '6 a 10 vidas',
          tipo_cnpj: 'Sim, possuo CNPJ',
          cnpj: '12.345.678/0001-90',
          situacao_plano: 'Tenho plano, mas quero comparar preços',
          operadora_atual: 'SulAmérica',
          prazo_contratacao: 'Nos próximos 30 dias',
          cidade_uf: 'Santo André / SP',
        }),
      )
      app.save(lead1)

      // Lead 2: Clínica Odonto Viva (21-50 vidas, Amil, quer trocar rápido)
      const lead2 = new Record(leadsCol)
      lead2.set('nome', 'Dra. Juliana Prado')
      lead2.set('whatsapp', '(11) 99123-8877')
      lead2.set('email', 'juliana.prado@odontoviva.com.br')
      lead2.set('empresa', 'Clínica Odonto Viva SP')
      lead2.set('cnpj', '23.456.789/0001-11')
      lead2.set('qtd_vidas', '21-50')
      lead2.set('situacao_plano', 'quero-trocar')
      lead2.set('operadora_atual', 'Amil')
      lead2.set('cidade_uf', 'São Paulo / SP')
      lead2.set('prazo_contratacao', 'imediato')
      lead2.set('score', 95)
      lead2.set('status', 'em-atendimento')
      lead2.set('origem', 'quiz-pme-porto-saude')
      lead2.set(
        'respostas',
        JSON.stringify({
          qtd_vidas: '21 a 50 vidas',
          tipo_cnpj: 'Sim, possuo CNPJ',
          cnpj: '23.456.789/0001-11',
          situacao_plano: 'Já tenho plano e quero trocar',
          operadora_atual: 'Amil',
          prazo_contratacao: 'O quanto antes',
          cidade_uf: 'São Paulo / SP',
        }),
      )
      app.save(lead2)

      // Lead 3: Consultora MEI (1-5 vidas, sem plano, pesquisando)
      const lead3 = new Record(leadsCol)
      lead3.set('nome', 'Renata Vasconcelos')
      lead3.set('whatsapp', '(11) 97411-2233')
      lead3.set('email', 'renata.consultoria@gmail.com')
      lead3.set('empresa', 'RV Consultoria de RH')
      lead3.set('cnpj', '34.567.890/0001-22')
      lead3.set('qtd_vidas', '1-5')
      lead3.set('situacao_plano', 'primeiro-plano')
      lead3.set('operadora_atual', 'Não temos plano')
      lead3.set('cidade_uf', 'Guarulhos / SP')
      lead3.set('prazo_contratacao', 'pesquisando')
      lead3.set('score', 45)
      lead3.set('status', 'novo')
      lead3.set('origem', 'quiz-pme-porto-saude')
      lead3.set(
        'respostas',
        JSON.stringify({
          qtd_vidas: '1 a 5 vidas',
          tipo_cnpj: 'Sou MEI',
          cnpj: '34.567.890/0001-22',
          situacao_plano: 'Primeiro plano da empresa',
          operadora_atual: 'Não temos plano',
          prazo_contratacao: 'Só pesquisando preços',
          cidade_uf: 'Guarulhos / SP',
        }),
      )
      app.save(lead3)
    }
  },
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'jeff.lasa8@gmail.com')
      app.delete(admin)
    } catch (_) {}
  },
)
