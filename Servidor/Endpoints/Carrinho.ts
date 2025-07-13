import express from 'express'
const router = express.Router();
import { CalcularPreco, DB } from '../Globais';







//router para obter os bilhetes no carrinho
router.get('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const query = `
        SELECT 
            chegada.idautocarro,
            carrinho.hora_chegada,
            carrinho.distancia_km,
            carrinho.duracao_estimada,
            carrinho.tipo,
            carrinho.id_produto,
            carrinho.data,
            carrinho.preco,
            carrinho.id_ponto_partida,
            carrinho.id_ponto_chegada,
            partida.local AS local_partida,
            chegada.local AS local_chegada,
            partida.hora_partida AS hora_partida,
            partida.latitude AS partida_latitude,
            partida.longitude AS partida_longitude,
            chegada.latitude AS chegada_latitude,
            chegada.longitude AS chegada_longitude
                
        FROM carrinho 
        INNER JOIN pontos_rotas AS partida ON carrinho.id_ponto_partida = partida.id_ponto
        INNER JOIN pontos_rotas AS chegada ON carrinho.id_ponto_chegada = chegada.id_ponto

        WHERE id_utilizador = ${id}
    `
    const [Resultado] = await DB.query(query)

    Resposta.send(Resultado)
})

// colocar longitude e latitude na query do carrinho para mostrar a distancia no carrinho 




// router de adicionar um bilhete ao carrinho
router.post('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

console.log(id)

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
        hora_partida: Ponto1.hora_partida,
        distancia_km: Pedido.body.distancia_km,
        duracao_estimada: Pedido.body.duracao_estimada,
        hora_chegada: Pedido.body.hora_chegada
    }

    const Preco = CalcularPreco(InfoViagem)
    
    const query = `
        INSERT INTO carrinho (id_utilizador, id_ponto_partida, id_ponto_chegada, preco, tipo, data, hora, distancia_km, duracao_estimada, hora_chegada) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    `; //calcular o preco 

    
    const campos = {
        id,
        id_ponto_partida: Pedido.body.id_ponto_partida,
        id_ponto_chegada: Pedido.body.id_ponto_chegada,
        preco: Preco,
        tipo: Pedido.body.tipo,
        data: Pedido.body.data,
        hora: Ponto1.hora_partida,
        distancia_km: Pedido.body.distancia_km,
        duracao_estimada: Pedido.body.duracao_estimada,
        hora_chegada: Pedido.body.hora_chegada,
    };

    console.log(campos)

    const [Resultado] = await DB.execute(query, [id, Pedido.body.id_ponto_partida, Pedido.body.id_ponto_chegada, Preco,
                                                Pedido.body.tipo, Pedido.body.data, Ponto1.hora_partida, Pedido.body.distancia_km, 
                                                Pedido.body.duracao_estimada, Pedido.body.hora_chegada]) //, Pedido.body.data_ida, Pedido.body.data_volta
    console.log("Bilhete adicionado ao carrinho ")
    console.log(Resultado)

    Resposta.send({ success: true })
})




router.delete('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.body.id_produto
    
    const query = `
        DELETE FROM carrinho 
        WHERE id_produto = ?
    `;

    const [Resultado] = await DB.execute(query, [id])

    console.log(Resultado)
    Resposta.send()
})

router.get('/cartao', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador
    
    const query = `
        SELECT * FROM pagamentos 
        WHERE id_utilizador = ? 
        ORDER BY id_pagamento DESC
    `;

    const [Resultado] = await DB.execute(query, [id]) as any[]

    Resposta.send(Resultado[0])
})


module.exports = router