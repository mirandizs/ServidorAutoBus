import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';

router.get('/recibos', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const query = `
        SELECT 
            r.id_recibo,
            r.data,
            r.valor,
            r.estado,
            p.local AS local_partida,
            p2.local AS local_chegada
        FROM recibos AS r
        INNER JOIN pontos_rotas AS p ON r.id_ponto_partida = p.id_ponto
        INNER JOIN pontos_rotas AS p2 ON r.id_ponto_chegada = p2.id_ponto
        WHERE r.id_utilizador = ${id}
    `

    const [Resultado] = await DB.query(query)

    Resposta.send(Resultado)
});