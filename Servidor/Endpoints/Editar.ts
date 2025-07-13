import express from 'express'
const router = express.Router();
import { DB } from '../Globais';
import multer from 'multer';



router.patch('/editar-utilizador', async (Pedido, Resposta) => {
    const Body = Pedido.body // Body do pedido, com os dados passados

    const query = `
            UPDATE utilizadores 
            SET 
                nome = ?, 
                nascimento = ?, 
                localidade = ?,
                telefone = ?,
                tipo_utilizador = ?,
                atividade = ?
            WHERE id_utilizador = ?`

    await DB.execute(query, [Body.nome, Body.nascimento, Body.localidade, Body.telefone,Body.tipo_utilizador, Body.atividade, Body.id_utilizador])


    Resposta.send(true)
});



router.patch('/editar-privacidade', async (Pedido, Resposta) => {
    const Body = Pedido.body // Body do pedido, com os dados passados
    const id = Pedido.session.dados_utilizador?.id_utilizador

    console.log(Body)
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
            WHERE id_utilizador = ?`

        await DB.execute(query, [Body.email || Body.password, id])

        if (Body.email) {
            Pedido.session.dados_utilizador!.email = Body.email
        }

        Resposta.send(true)
    }
    else{
        Resposta.status(401).send()
    }
});






const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'Server/Uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });



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
        await DB.execute(query, parametros);

        if (Pedido.session.dados_utilizador) {
            Pedido.session.dados_utilizador.nome = nome;
            Pedido.session.dados_utilizador.nascimento = nascimento;
            Pedido.session.dados_utilizador.telefone = telefone;
            Pedido.session.dados_utilizador.localidade = localidade;
        }
        Resposta.send();
        console.log("dados alterados com sucesso!")
    } 
    
    catch (erro) {
        console.error('Erro ao editar utilizador:', erro);
        Resposta.status(500).send({ sucesso: false, erro: 'Erro ao editar dados.' });
    }
});


router.patch('/desativarConta', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    if (!id) {
        Resposta.statusMessage = 'Sessão inválida!';
        Resposta.status(401).send();
    }

    const query = `
        UPDATE utilizadores 
        SET atividade = 0
        WHERE id_utilizador = ?`

    try {
        await DB.execute(query, [id])

        Pedido.session.destroy(() => {
                console.log('Conta desativada e sessão terminada');
        });

        // Resposta.statusMessage = "Conta desativada com sucesso."
        Resposta.send({ mensagem: 'Conta desativada com sucesso.' });
    }

    catch (erro) {
        console.error(erro);
        Resposta.status(500).send({ erro: 'Erro ao desativar a conta.' });
    }
})


module.exports = router