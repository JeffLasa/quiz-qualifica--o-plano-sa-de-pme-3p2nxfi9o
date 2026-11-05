///
/// Adiciona o campo `idades_vidas` (texto) à collection `leads`, idempotente.
/// Guarda a lista de idades informada no quiz (ex.: "43, 38, 20, 12, 45").
/// O campo `qtd_vidas` (select) continua preenchido a partir da faixa derivada
/// da quantidade de idades, sem quebrar leads e painel existentes.
///
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('leads')
    const fields = collection.fields

    let exists = false
    try {
      collection.fields.getByName('idades_vidas')
      exists = true
    } catch (err) {
      exists = false
    }
    if (exists) {
      console.log('migração 0003: campo idades_vidas já existe, nada a fazer')
      return
    }

    const field = new Field({
      name: 'idades_vidas',
      type: 'text',
      required: false,
      max: 500,
    })
    fields.push(field)
    app.save(collection)
    console.log('migração 0003: campo idades_vidas adicionado à collection leads')
  },
  (app) => {
    // Rollback: remove o campo apenas se existir
    const collection = app.findCollectionByNameOrId('leads')
    const fields = collection.fields

    let exists = false
    try {
      collection.fields.getByName('idades_vidas')
      exists = true
    } catch (err) {
      exists = false
    }
    if (!exists) return

    fields.removeByName('idades_vidas')
    app.save(collection)
  },
)
