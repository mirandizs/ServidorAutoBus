"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Globais_1 = require("../Globais");
//Buscar utilizadores
router.get('/utilizadores', async (Pedido, Resposta) => {
    const QUERY = `SELECT * FROM utilizadores`;
    const [Resultado] = await Globais_1.DB.query(QUERY);
    Resposta.send(Resultado);
});
//Buscar utilizador por nome
router.get('/utilizadores/:nif', async (Pedido, Resposta) => {
    const QUERY = `SELECT * FROM utilizadores WHERE nif = ?`; // ? é um placeholder, um valor sem nada que e substituido na funcao execute()
    // Placeholders sao utilizados para evitar injecao de SQL (Equivalente a htmlspecialchars, mas aqui e feito automaticamente desde que se use placeholders)
    const [Resultado] = await Globais_1.DB.execute(QUERY, [Pedido.params.nif]); // A funcao execute recebe a query, e depois os valores para substituir os placeholders
    Resposta.send(Resultado[0]);
});
module.exports = router;
