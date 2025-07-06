"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpcoesDB = exports.ServicoEmail = exports.DB = void 0;
exports.CalcularPreco = CalcularPreco;
const mysql2_1 = __importDefault(require("mysql2"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const producao = process.env.NODE_ENV == 'production';
// Conexão ao MySQL
const OpcoesDB = {
    host: producao ? 'sql8.freesqldatabase.com' : 'localhost',
    user: producao ? 'sql8788598' : 'root',
    password: producao ? 'DCEsAiJmje' : '',
    database: 'pap',
};
exports.OpcoesDB = OpcoesDB;
const DB = mysql2_1.default.createPool({
    ...OpcoesDB,
    dateStrings: true, // Para que as datas sejam enviadas como strings, em vez de objetos Date
}).promise();
exports.DB = DB;
var ServicoEmail = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'autobus.pap@gmail.com',
        pass: 'xjbc mnzm yldm yvae'
    }
});
exports.ServicoEmail = ServicoEmail;
function CalcularPreco(Viagem) {
    const R = 6371; // Raio da Terra em km
    const toRad = (graus) => graus * Math.PI / 180;
    const dLat = toRad(Viagem.chegada_latitude - Viagem.partida_latitude);
    const dLon = toRad(Viagem.chegada_longitude - Viagem.partida_longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(Viagem.partida_latitude)) * Math.cos(toRad(Viagem.chegada_latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const Distancia = R * c;
    const Preco = Distancia / 10;
    return Preco;
}
