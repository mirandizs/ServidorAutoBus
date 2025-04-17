import express from 'express' // Gestor do servidor
import session from 'express-session' // Gestor de sessoes
const MySQLStore = require('express-mysql-session')(session) // Connecta sessoes ao MySQL, para guardar
const multer = require('multer') // Gestor de ficheiros
const fs = require('fs') // Para aceder pastas
const cors = require('cors') // Para ser possivel fazer pedidos de outros dominios (Do localhost:4200 para o localhost:3000 neste caso)

// SETUP PARA SESSOES (COOKIES).a
const SessionDatabase = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sessoes'
};
const SQLCookies = new MySQLStore(SessionDatabase);
const SessionMiddleware = session({
    secret: 'uh*&T*8787GT^hk0a(#R)@',
    store: SQLCookies,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, }
})



const Servidor = express(); // Cria o servidor


// MIDDLEWARE - Funcoes que interceptam pedidos antes de chegar ao servidor

// O SessionMiddleware permite que haja a propriedade .session no Pedido/Request, com todas as informacoes to utilizador, automaticamente
Servidor.use(SessionMiddleware)

// Converte dados de form, caso haja
Servidor.use(express.urlencoded({ extended: true }));

// Converte dados de JSON, caso haja
Servidor.use(express.json());

Servidor.use(cors({
    origin: 'http://localhost:4200', // Permite pedidos de localhost:4200 (Angular)
    credentials: true, // Permite cookies
}));



// Aqui vai-se buscar todos os endpoints criados noutros ficheiros e adiciona-os ao servidor.
// Nao e necessario fazer isto, e apenas para organizacao
const Pasta = "./Servidor/Endpoints"
fs.readdirSync(Pasta).forEach((Ficheiro:string) => {
    const Router = require("./Endpoints/"+Ficheiro);
    Servidor.use('/api/', Router)
});


// Comeca o servidor no porte definido
Servidor.listen(3000, ()=>{
    console.log('Servidor a correr')
})