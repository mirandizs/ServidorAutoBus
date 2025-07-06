"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Globais_1 = require("../Globais");
router.get('/viagens', async (Pedido, Resposta) => {
    const local_partida = Pedido.query.local_partida;
    const local_chegada = Pedido.query.local_chegada;
    const hora_ida = Pedido.query.hora_ida;
    const hora_volta = Pedido.query.hora_volta;
    const tipo_viagem = Pedido.query.tipo_viagem;
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
    `;
    let QueryVolta = QueryIda;
    const ValoresIda = [local_partida, local_chegada];
    const ValoresVolta = [local_chegada, local_partida];
    if (hora_ida) {
        QueryIda += ` AND p1.hora_partida >= ?`;
        ValoresIda.push(hora_ida);
    }
    if (hora_volta) {
        ValoresVolta.push(hora_volta);
        QueryVolta += ` AND p1.hora_partida >= ?`;
    }
    QueryIda += ` ORDER BY p1.hora_partida ASC`;
    QueryVolta += ` ORDER BY p1.hora_partida ASC`;
    let ResultadoVolta;
    const [ResultadoIda] = await Globais_1.DB.execute(QueryIda, ValoresIda);
    for (const Viagem of ResultadoIda) {
        Viagem.preco = (0, Globais_1.CalcularPreco)(Viagem);
        Viagem.tipo = 'Ida';
    }
    if (tipo_viagem == 'IdaVolta') {
        [ResultadoVolta] = await Globais_1.DB.execute(QueryVolta, ValoresVolta);
        for (const Viagem of ResultadoVolta) {
            Viagem.preco = (0, Globais_1.CalcularPreco)(Viagem);
            Viagem.tipo = 'Volta';
        }
    }
    Resposta.send({
        ViagensIda: ResultadoIda,
        ViagensVolta: ResultadoVolta,
    });
});
router.get('/localidades', async (Pedido, Resposta) => {
    const QUERY = `SELECT DISTINCT local, longitude, latitude FROM pontos_rotas;`;
    const [Resultado] = await Globais_1.DB.query(QUERY);
    Resposta.send(Resultado);
});
module.exports = router;
