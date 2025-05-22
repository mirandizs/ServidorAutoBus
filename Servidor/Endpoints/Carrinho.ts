import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';



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

router.post('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const query = `
        INSERT INTO carrinho (id_utilizador, id_ponto_partida, id_ponto_chegada) 
        VALUES (?, ?, ?) 
    `; //calcular o preco 

    const [Resultado] = await DB.execute(query, [id, Pedido.body.id_ponto_partida, Pedido.body.id_ponto_chegada])
    console.log(Resultado)

    Resposta.send()
})

module.exports = router