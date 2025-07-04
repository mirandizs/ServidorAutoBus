import express from 'express'
const router = express.Router();
import { CalcularPreco, DB } from '../Globais.ts';



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
          p2.id_ponto AS id_ponto_chegada,

          p1.latitude AS partida_latitude,
          p2.latitude AS chegada_latitude,
          p1.longitude AS partida_longitude,
          p2.longitude AS chegada_longitude

      FROM pontos_rotas p1
      INNER JOIN pontos_rotas p2 ON p1.idautocarro = p2.idautocarro
      INNER JOIN autocarro a ON a.idautocarro = p1.idautocarro
      WHERE p1.local = '${local_partida}' 
        AND p2.local = '${local_chegada}'
        AND p1.hora_partida >= '${hora_ida}'
        AND p1.hora_partida < p2.hora_partida
      ORDER BY p1.hora_partida ASC;
    `

  const [Resultado] = await DB.query(QUERY) as any[]

  for (const Viagem of Resultado) {
    Viagem.preco = CalcularPreco(Viagem)
  }
  Resposta.send(Resultado)
});

router.get('/localidades', async (Pedido, Resposta) => {


  const QUERY = `SELECT DISTINCT local, longitude, latitude FROM pontos_rotas;`

  const [Resultado] = await DB.query(QUERY) as any[]

  Resposta.send(Resultado)
});



module.exports = router;