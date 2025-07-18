import express from 'express'
const router = express.Router();
import { DB } from '../Globais';



router.post('/autenticar', async (Pedido, Resposta) => {
    if (Pedido.session.utilizador) {
        Resposta.send(Pedido.session.dados_utilizador)
    } else {
        Resposta.statusMessage = 'Nao tem sessao iniciada!' // Define a mensagem de erro
        Resposta.status(401).send() // Manda um codigo de erro com resposta vazia
    }
});


router.post('/login', async (Pedido, Resposta) => {

    const Body = Pedido.body // Body do pedido, com os dados passados
    const Email = Body.email
    const Password = Body.password

    const QUERY = `SELECT id_utilizador, nif, nome, nascimento, telefone, localidade, email, tipo_utilizador, atividade
    FROM utilizadores 
    WHERE email = ? AND password = ?` // Substitui os ? pelos valores passados na funcao execute()

    // Verifica que os valores do SELECT sao iguais aos que estao presentes no ficheiro dados-utilizador.d.ts, senao o autocomplete pode ter coisas em falta


    const [Resultado] = await DB.execute(QUERY, [Email, Password]) as any[] // Executa a query com os valores passados. Utiliza-se "as any[]" para evitar erros do typescript


    if (Resultado.length > 0) { // Se o resultado tiver algum utilizador
        const DadosUtilizador = Resultado[0]
        const atividadeConta = DadosUtilizador.atividade

        if (atividadeConta === 0) {
            Resposta.statusMessage = 'A sua conta está inativa. Contacte o administrador.';
            Resposta.status(403).send();
            return;
        }

        Pedido.session.dados_utilizador = DadosUtilizador
        Pedido.session.utilizador = DadosUtilizador.nome // Guarda o email na sessao

        Resposta.send(DadosUtilizador) // Envia os dados do utilizador de volta
        console.log('Sessão iniciada')
    }

    else {
        Resposta.statusMessage = 'Email ou password invalidos!' // Define a mensagem de erro
        Resposta.status(401).send() // Manda um codigo de erro com resposta vazia
    }

    //Resposta.redirect('http://localhost:4200');
});




// Destroi a sessao do utilizador, apagando todos os dados
router.post('/logout', async (Pedido, Resposta) => {
    Pedido.session.destroy(() => {
        console.log('Sessao terminada')
    })
    Resposta.send(true)
});

router.get('/verificar_existe', async (Pedido, Resposta) => {
    const Valores = [Pedido.query.nif, Pedido.query.email]

    const Query = 'SELECT nif, email FROM utilizadores WHERE nif=? OR email=?'
    const [Resultado] = await DB.execute(Query, Valores) as any[]

    const Existe = Resultado[0] != undefined
    Resposta.send({ existe: Existe })
})

router.post('/criar_conta', async (Pedido, Resposta) => {

    const Campos = Pedido.body // Body do pedido, com os dados passados

    if (Pedido.session.codigo_confirmacao == Campos.codigo_confirmacao) {
        const ValoresParaInserir = [
            Campos.nome,
            Campos.nif,
            Campos.nascimento,
            Campos.telefone,
            Campos.localidade,
            Campos.email,
            Campos.password,
            1, // Tipo de utilizador
            1, // Atividade
        ]

        try {
            const QUERY = `INSERT INTO utilizadores (nome, nif, nascimento, telefone, localidade, email, password, tipo_utilizador, atividade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const [Resultado] = await DB.execute(QUERY, ValoresParaInserir) as any[];

            const  Query = `SELECT id_utilizador, nif, nome, nascimento, telefone, localidade, email, tipo_utilizador, atividade
                            FROM utilizadores 
                            WHERE nif = ?`
            const [dadosUtilizador] = await DB.execute(Query, [Campos.nif]) as any[]

            Pedido.session.dados_utilizador = dadosUtilizador[0]
            Pedido.session.utilizador = Campos.nome

            Resposta.send()

        } catch (err: any) {
            if (err.code === 'ER_DUP_ENTRY') {
                if (err.sqlMessage.includes('email')) {
                    Resposta.status(400).json({ erro: "O email já está em uso" });
                } else if (err.sqlMessage.includes('nif')) {
                    Resposta.status(400).json({ erro: "O NIF já está em uso" });
                } else {
                    Resposta.status(400).json({ erro: "Valor duplicado" });
                }
            } else {
                console.error(err);
                Resposta.status(500).json({ erro: "Erro interno do servidor" });
            }
        }

    } else {
        Resposta.statusMessage = 'Codigo de confirmação inválido!'
        Resposta.status(401).send()
    }
})

module.exports = router;