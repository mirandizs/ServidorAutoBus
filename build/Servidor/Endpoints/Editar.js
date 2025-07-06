"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Globais_1 = require("../Globais");
const multer_1 = __importDefault(require("multer"));
router.patch('/definicoes/editar-utilizador', async (Pedido, Resposta) => {
    const Body = Pedido.body; // Body do pedido, com os dados passados
    const id = Pedido.session.dados_utilizador?.id_utilizador;
    const query = `
            UPDATE utilizadores 
            SET 
                nome = ?, 
                nascimento = ?, 
                localidade = ?,
                telefone = ?,
                email = ?,
                tipo_utilizador = ?,
                atividade = ?
            WHERE id_utilizador = ?`;
    await Globais_1.DB.execute(query, [Body.nome, Body.nascimento, Body.localidade, Body.telefone, Body.email, Body.tipo_utilizador, Body.atividade, id]);
    Resposta.send(true);
});
router.patch('/editar-privacidade', async (Pedido, Resposta) => {
    const Body = Pedido.body; // Body do pedido, com os dados passados
    const id = Pedido.session.dados_utilizador?.id_utilizador;
    console.log(Body);
    if (Body.codigo == Pedido.session.codigo_confirmacao) {
        const query = Body.email ? `
            UPDATE utilizadores 
            SET 
                email = ?
            WHERE id_utilizador = ?`
            : `
            UPDATE utilizadores 
            SET 
                password = ?
            WHERE id_utilizador = ?`;
        await Globais_1.DB.execute(query, [Body.email || Body.password, id]);
        if (Body.email) {
            Pedido.session.dados_utilizador.email = Body.email;
        }
        Resposta.send(true);
    }
    else {
        Resposta.status(401).send();
    }
});
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, 'Server/Uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = (0, multer_1.default)({ storage });
router.patch('/minha-conta', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador;
    const { nome, nascimento, telefone, localidade } = Pedido.body;
    const query = `
        UPDATE utilizadores 
        SET 
            nome = ?, 
            nascimento = ?, 
            telefone = ?,
            localidade = ?
        WHERE id_utilizador = ?`;
    const parametros = [nome, nascimento, telefone, localidade, id];
    try {
        await Globais_1.DB.execute(query, parametros);
        if (Pedido.session.dados_utilizador) {
            Pedido.session.dados_utilizador.nome = nome;
            Pedido.session.dados_utilizador.nascimento = nascimento;
            Pedido.session.dados_utilizador.telefone = telefone;
            Pedido.session.dados_utilizador.localidade = localidade;
        }
        Resposta.send();
        console.log("dados alterados com sucesso!");
    }
    catch (erro) {
        console.error('Erro ao editar utilizador:', erro);
        Resposta.status(500).send({ sucesso: false, erro: 'Erro ao editar dados.' });
    }
});
module.exports = router;
