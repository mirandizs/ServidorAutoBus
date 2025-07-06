"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Globais_1 = require("../Globais");
//router para obter os bilhetes no carrinho
router.get('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador;
    const query = `
        SELECT 
            carrinho.id_produto,
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
    `;
    const [Resultado] = await Globais_1.DB.query(query);
    Resposta.send(Resultado);
});
// router de adicionar um bilhete ao carrinho
router.post('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador;
    const QueryInfo = `
      SELECT * FROM pontos_rotas
      WHERE id_ponto = ${Pedido.body.id_ponto_partida} OR id_ponto=${Pedido.body.id_ponto_chegada} `;
    const [InformacaoPontos] = await Globais_1.DB.query(QueryInfo);
    const Ponto1 = InformacaoPontos[0];
    const Ponto2 = InformacaoPontos[1];
    const InfoViagem = {
        partida_longitude: Ponto1.longitude,
        partida_latitude: Ponto1.latitude,
        chegada_longitude: Ponto2.longitude,
        chegada_latitude: Ponto2.latitude,
    };
    const Preco = (0, Globais_1.CalcularPreco)(InfoViagem);
    const query = `
        INSERT INTO carrinho (id_utilizador, id_ponto_partida, id_ponto_chegada, preco, tipo, data, hora) 
        VALUES (?, ?, ?, ?, ?, ?, ?) 
    `; //calcular o preco 
    const [Resultado] = await Globais_1.DB.execute(query, [id, Pedido.body.id_ponto_partida, Pedido.body.id_ponto_chegada, Preco,
        Pedido.body.tipo, Pedido.body.data, Ponto1.hora_partida]); //, Pedido.body.data_ida, Pedido.body.data_volta
    console.log("Bilhete adicionado ao carrinho ");
    console.log(Resultado);
    Resposta.send({ success: true });
});
router.delete('/carrinho', async (Pedido, Resposta) => {
    const id = Pedido.body.id_produto;
    const query = `
        DELETE FROM carrinho 
        WHERE id_produto = ?
    `;
    const [Resultado] = await Globais_1.DB.execute(query, [id]);
    console.log(Resultado);
    Resposta.send();
});
module.exports = router;
