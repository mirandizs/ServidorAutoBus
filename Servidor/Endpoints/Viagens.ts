import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';



router.get('/viagens', async (Pedido, Resposta) => {

    const local_partida = Pedido.query.local_partida
    const local_chegada = Pedido.query.local_chegada

    const hora_ida = Pedido.query.hora_ida

    const QUERY = `
      SELECT 
          p1.idautocarro,
          p1.local AS local_partida,
          p2.local AS local_chegada,
          p1.hora_partida AS hora_partida,
          p1.id_ponto AS id_ponto_partida,
          p2.id_ponto AS id_ponto_chegada

      FROM pontos_rotas p1
      INNER JOIN pontos_rotas p2 ON p1.idautocarro = p2.idautocarro
      INNER JOIN autocarro a ON a.idautocarro = p1.idautocarro
      WHERE p1.local = '${local_partida}' 
        AND p2.local = '${local_chegada}'
        AND p1.hora_partida >= '${hora_ida}'
        AND p1.hora_partida < p2.hora_partida
      ORDER BY p1.hora_partida ASC;
    `

    const [Resultado] = await DB.query(QUERY)

    Resposta.send(Resultado)
});


module.exports = router;