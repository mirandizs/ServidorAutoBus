import MySQL from 'mysql2';

// Conexão ao MySQL
const DB = MySQL.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pap',
    dateStrings: true, // Para que as datas sejam enviadas como strings, em vez de objetos Date
}).promise();

// Exporta as variáveis abaixo para serem usadas em outros arquivos
export  {
    DB,
};