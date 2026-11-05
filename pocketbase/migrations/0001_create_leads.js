migrate(
  (app) => {
    const collection = new Collection({
      name: 'leads',
      type: 'base',
      createRule: '',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'whatsapp', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'empresa', type: 'text' },
        { name: 'cnpj', type: 'text' },
        {
          name: 'qtd_vidas',
          type: 'select',
          required: true,
          values: ['1-5', '6-10', '11-20', '21-50', '50+'],
          maxSelect: 1,
        },
        {
          name: 'situacao_plano',
          type: 'select',
          required: true,
          values: ['ja-tenho', 'quero-trocar', 'primeiro-plano', 'nao-sei'],
          maxSelect: 1,
        },
        { name: 'operadora_atual', type: 'text' },
        { name: 'cidade_uf', type: 'text', required: true },
        {
          name: 'prazo_contratacao',
          type: 'select',
          required: true,
          values: ['imediato', '30-dias', '3-meses', 'pesquisando'],
          maxSelect: 1,
        },
        { name: 'respostas', type: 'json' },
        { name: 'score', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['novo', 'em-atendimento', 'proposta-enviada', 'fechado', 'perdido'],
          maxSelect: 1,
        },
        { name: 'origem', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_leads_created ON leads (created DESC)',
        'CREATE INDEX idx_leads_qtd_vidas ON leads (qtd_vidas)',
        'CREATE INDEX idx_leads_status ON leads (status)',
        'CREATE INDEX idx_leads_email ON leads (email)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('leads')
      app.delete(collection)
    } catch (_) {}
  },
)
