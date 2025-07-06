"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Gestor do servidor
const express_session_1 = __importDefault(require("express-session")); // Gestor de sessoes
const path_1 = __importDefault(require("path"));
const MySQLStore = require('express-mysql-session')(express_session_1.default); // Connecta sessoes ao MySQL, para guardar
const multer = require('multer'); // Gestor de ficheiros
const fs = require('fs'); // Para aceder pastas
const cors = require('cors'); // Para ser possivel fazer pedidos de outros dominios (Do localhost:4200 para o localhost:3000 neste caso)
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '.env') });
console.log('A iniciar o servidor no environmento:', process.env.NODE_ENV);
const producao = process.env.NODE_ENV == 'production';
const Globais_1 = require("./Globais");
// SETUP PARA SESSOES (COOKIES).a
const SQLCookies = new MySQLStore(Globais_1.OpcoesDB);
const SessionMiddleware = (0, express_session_1.default)({
    secret: 'uh*&T*8787GT^hk0a(#R)@',
    store: SQLCookies,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, }
});
const Servidor = (0, express_1.default)(); // Cria o servidor
// MIDDLEWARE - Funcoes que interceptam pedidos antes de chegar ao servidor
// O SessionMiddleware permite que haja a propriedade .session no Pedido/Request, com todas as informacoes to utilizador, automaticamente
Servidor.use(SessionMiddleware);
// Converte dados de form, caso haja
Servidor.use(express_1.default.urlencoded({ extended: true }));
// Converte dados de JSON, caso haja
Servidor.use(express_1.default.json());
Servidor.use(cors({
    origin: ['http://localhost:4200'], // Permite pedidos de localhost:4200 (Angular)
    credentials: true, // Permite cookies
}));
// Aqui vai-se buscar todos os endpoints criados noutros ficheiros e adiciona-os ao servidor.
// Nao e necessario fazer isto, e apenas para organizacao
const Pasta = __dirname + '/Endpoints'; // Pega no nome da pasta onde estao os endpoints
fs.readdirSync(Pasta).forEach((Ficheiro) => {
    const Router = require("./Endpoints/" + Ficheiro);
    Servidor.use('/api/', Router);
});
// Comeca o servidor no porte definido
Servidor.listen(3000, () => {
    console.log('Servidor a correr');
});
