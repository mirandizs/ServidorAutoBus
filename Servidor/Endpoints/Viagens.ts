import express from 'express'
const router = express.Router();
import { CalcularPreco, DB } from '../Globais';



function calcularDistanciaKm(lat1: any, lon1 : any, lat2 : any, lon2: any) {
  const R = 6371; // raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(graus: any) {
  return graus * (Math.PI / 180);
}

function calcularDuracaoEmTexto(distanciaKm: any, velocidadeMediaKmH = 80) {
  const horas = distanciaKm / velocidadeMediaKmH;
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  return `${h}h ${m}min`;
}






router.get('/viagens', async (Pedido, Resposta) => {

  const local_partida = Pedido.query.local_partida
  const local_chegada = Pedido.query.local_chegada

  const hora_ida = Pedido.query.hora_ida
  const hora_volta = Pedido.query.hora_volta
  const tipo_viagem = Pedido.query.tipo_viagem


  let QueryIda = `
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
      WHERE p1.local = ?
        AND p2.local = ?
        AND p1.hora_partida < p2.hora_partida
    `
  let QueryVolta = QueryIda

  const ValoresIda = [local_partida, local_chegada]
  const ValoresVolta = [local_chegada, local_partida]

  if (hora_ida) {
    QueryIda += ` AND p1.hora_partida >= ?`
    ValoresIda.push(hora_ida)
  }
  if (hora_volta) {
    ValoresVolta.push(hora_volta)
    QueryVolta += ` AND p1.hora_partida >= ?`
  }


  QueryIda += ` ORDER BY p1.hora_partida ASC`
  QueryVolta += ` ORDER BY p1.hora_partida ASC`

  let ResultadoVolta
  const [ResultadoIda] = await DB.execute(QueryIda, ValoresIda) as any[]
  for (const Viagem of ResultadoIda) {
    Viagem.preco = CalcularPreco(Viagem)
    Viagem.tipo = 'Ida'

    const distancia = calcularDistanciaKm(
      Viagem.partida_latitude,
      Viagem.partida_longitude,
      Viagem.chegada_latitude,
      Viagem.chegada_longitude
    );

    Viagem.distancia_km = parseFloat(distancia.toFixed(2));
    Viagem.duracao_estimada = calcularDuracaoEmTexto(distancia);
  }

  if (tipo_viagem == 'IdaVolta') {
    [ResultadoVolta] = await DB.execute(QueryVolta, ValoresVolta) as any[]
    for (const Viagem of ResultadoVolta) {
      Viagem.preco = CalcularPreco(Viagem)
      Viagem.tipo = 'Volta'
    }
  }

  Resposta.send({
    ViagensIda: ResultadoIda,
    ViagensVolta: ResultadoVolta,
  })
});

router.get('/localidades', async (Pedido, Resposta) => {


  const QUERY = `SELECT DISTINCT local, longitude, latitude FROM pontos_rotas;`

  const [Resultado] = await DB.query(QUERY) as any[]

  Resposta.send(Resultado)
});



module.exports = router;