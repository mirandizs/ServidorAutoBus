import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';



router.get('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const query = `
        SELECT 
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

module.exports = router