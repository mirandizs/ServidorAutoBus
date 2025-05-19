import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';



router.patch('/definicoes/editar-utilizador', async (Pedido, Resposta) => {
    const Body = Pedido.body // Body do pedido, com os dados passados
    const id = Pedido.session.dados_utilizador?.id_utilizador

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
            WHERE id_utilizador = ?`

    await DB.execute(query, [Body.nome, Body.nascimento, Body.localidade, Body.telefone, Body.email, Body.tipo_utilizador, Body.atividade, id])

    Resposta.send(true)
});



router.patch('/definicoes/privacidade', async (Pedido, Resposta) => {
    const Body = Pedido.body // Body do pedido, com os dados passados
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const query = `
            UPDATE utilizadores 
            SET 
                email = ?,
                password = ?
            WHERE id_utilizador = ?`

    await DB.execute(query, [Body.email, Body.password, id])

    Resposta.send(true)
});



router.patch('/minha-conta', async (Pedido, Resposta) => {
    console.log(Pedido.body)
    const id = Pedido.session.dados_utilizador?.id_utilizador
    const { nome, nascimento, telefone, localidade } = Pedido.body

    const query = `
        UPDATE utilizadores 
        SET 
            nome = ?, 
            nascimento = ?, 
            telefone = ?,
            localidade = ?
        WHERE id_utilizador = ?`

    try {
        const [Resultado] = await DB.query(query, [nome, nascimento, telefone, localidade, id])
        if (Pedido.session.dados_utilizador) {
            Pedido.session.dados_utilizador.nome = nome
            Pedido.session.dados_utilizador.nascimento = nascimento
            Pedido.session.dados_utilizador.telefone = telefone
            Pedido.session.dados_utilizador.localidade = localidade
        }
        Resposta.send({ sucesso: true, resultado: Resultado })
    }

    catch (erro) {
        console.error('Erro ao editar utilizador:', erro)
        Resposta.status(500).send({ sucesso: false, erro: 'Erro ao editar dados.' })
    }
});


module.exports = router