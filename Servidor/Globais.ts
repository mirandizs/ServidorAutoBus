import MySQL from 'mysql2';
import nodemailer from 'nodemailer';
import type { Request, Response } from 'express';
const producao = process.env.NODE_ENV == 'production'

// Conexão ao MySQL

const OpcoesDB = {
    host: producao ? 'sql8.freesqldatabase.com' : 'localhost',
    user: producao ? 'sql8788598' : 'root',
    password: producao ? 'DCEsAiJmje' : '',
    database: producao ? 'sql8788598' : 'pap',
};
const DB = MySQL.createPool({
    ...OpcoesDB,
    dateStrings: true, // Para que as datas sejam enviadas como strings, em vez de objetos Date
}).promise();


var ServicoEmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'autobus.pap@gmail.com',
        pass: 'xjbc mnzm yldm yvae'
    }
});


function CalcularPreco(Viagem: any) {
    const R = 6371; // Raio da Terra em km
    const toRad = (graus: number) => graus * Math.PI / 180

    const dLat = toRad(Viagem.chegada_latitude - Viagem.partida_latitude)
    const dLon = toRad(Viagem.chegada_longitude - Viagem.partida_longitude)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(Viagem.partida_latitude)) * Math.cos(toRad(Viagem.chegada_latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const Distancia = R * c
    const Preco = Distancia / 10
    return Preco;
}



export {
    DB, ServicoEmail, CalcularPreco, OpcoesDB
}