import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';
import multer from 'multer';



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






const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'Server/Uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });



router.patch('/minha-conta', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador;
    const { nome, nascimento, telefone, localidade } = Pedido.body;
    const nomeImagem = Pedido.file?.filename;

    const query = `
        UPDATE utilizadores 
        SET 
            nome = ?, 
            nascimento = ?, 
            telefone = ?,
            localidade = ?,
            ${nomeImagem ? 'foto = ?,' : ''}
            atualizado_em = NOW()
        WHERE id_utilizador = ?`;

    const parametros = nomeImagem
        ? [nome, nascimento, telefone, localidade, nomeImagem, id]
        : [nome, nascimento, telefone, localidade, id];

    try {
        await DB.execute(query.replace(', atualizado_em', 'atualizado_em'), parametros);

        if (Pedido.session.dados_utilizador) {
            Pedido.session.dados_utilizador.nome = nome;
            Pedido.session.dados_utilizador.nascimento = nascimento;
            Pedido.session.dados_utilizador.telefone = telefone;
            Pedido.session.dados_utilizador.localidade = localidade;
            if (nomeImagem) Pedido.session.dados_utilizador.foto = nomeImagem;
        }

        Resposta.send({ sucesso: true, filename: nomeImagem });
    } catch (erro) {
        console.error('Erro ao editar utilizador:', erro);
        Resposta.status(500).send({ sucesso: false, erro: 'Erro ao editar dados.' });
    }
});


module.exports = router