import MySQL from 'mysql2';
import nodemailer from 'nodemailer';

// Conexão ao MySQL
const DB = MySQL.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pap',
    dateStrings: true, // Para que as datas sejam enviadas como strings, em vez de objetos Date
}).promise();


var ServicoEmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gabrielmonteiroferreira@gmail.com',
        pass: 'eijn thtg ahsd fnco'
    }
});


// Exporta as variáveis abaixo para serem usadas em outros arquivos
export {
    DB, ServicoEmail,
};