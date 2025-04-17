import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';

//Buscar utilizadores
router.get('/utilizadores', async (Pedido, Resposta) => {
    
    const QUERY = `SELECT * FROM utilizadores`;
    const [Resultado] = await DB.query(QUERY)

    Resposta.send(Resultado)
});

//Buscar utilizador por nome
router.get('/utilizadores/:nome', async (Pedido, Resposta) => {
    
    const QUERY = `SELECT * FROM utilizadores WHERE nome = ?`; // ? é um placeholder, um valor sem nada que e substituido na funcao execute()
    // Placeholders sao utilizados para evitar injecao de SQL (Equivalente a htmlspecialchars, mas aqui e feito automaticamente desde que se use placeholders)

    const [Resultado] = await DB.execute(QUERY, [Pedido.params.nome]) // A funcao execute recebe a query, e depois os valores para substituir os placeholders
    

    Resposta.send(Resultado)
});

module.exports = router;