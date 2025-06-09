import express from 'express'
const router = express.Router();
import { CalcularPreco, DB } from '../Globais.ts';


//router para obter os bilhetes no carrinho
router.get('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const query = `
        SELECT 
            carrinho.preco,
            carrinho.id_ponto_partida,
            carrinho.id_ponto_chegada,
            partida.local AS local_partida,
            chegada.local AS local_chegada,
            partida.hora_partida AS hora_partida
        
        FROM carrinho 
        INNER JOIN pontos_rotas AS partida ON carrinho.id_ponto_partida = partida.id_ponto
        INNER JOIN pontos_rotas AS chegada ON carrinho.id_ponto_chegada = chegada.id_ponto

        WHERE id_utilizador = ${id}
    `
    const [Resultado] = await DB.query(query)

    Resposta.send(Resultado)
})


// router de adicionar um bilhete ao carrinho
router.post('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const QueryInfo = `
      SELECT * FROM pontos_rotas
      WHERE id_ponto = ${Pedido.body.id_ponto_partida} OR id_ponto=${Pedido.body.id_ponto_chegada} `

    const [InformacaoPontos] = await DB.query(QueryInfo) as any[]
    const Ponto1 = InformacaoPontos[0]
    const Ponto2 = InformacaoPontos[1]

    const InfoViagem = {
        partida_longitude: Ponto1.longitude,
        partida_latitude: Ponto1.latitude,
        chegada_longitude: Ponto2.longitude,
        chegada_latitude: Ponto2.latitude,
    }

    const Preco = CalcularPreco(InfoViagem)
    const query = `
        INSERT INTO carrinho (id_utilizador, id_ponto_partida, id_ponto_chegada, preco) 
        VALUES (?, ?, ?, ?) 
    `; //calcular o preco 

    const [Resultado] = await DB.execute(query, [id, Pedido.body.id_ponto_partida, Pedido.body.id_ponto_chegada, Preco])
    console.log(Resultado)

    Resposta.send()
})




router.delete('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador
    const id_ponto_partida = Pedido.body.id_ponto_partidaq
    const id_ponto_chegada = Pedido.body.id_ponto_chegada

    const query = `
        DELETE FROM carrinho 
        WHERE id_produto = ? AND id_ponto_partida = ? AND id_ponto_chegada = ?
    `;

    const [Resultado] = await DB.execute(query, [id, id_ponto_partida, id_ponto_chegada])

    console.log(Resultado)
    Resposta.send()
})

module.exports = router