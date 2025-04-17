import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';

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
        Pedido.session.dados_utilizador = DadosUtilizador
        Pedido.session.utilizador = DadosUtilizador.nome // Guarda o email na sessao

        Resposta.send(DadosUtilizador) // Envia os dados do utilizador de volta
    }
    else {
        Resposta.statusMessage = 'Utilizador ou password invalidos!' // Define a mensagem de erro
        Resposta.status(401).send() // Manda um codigo de erro com resposta vazia
    }

    //Resposta.redirect('http://localhost:4200');
});




// Destroi a sessao do utilizador, apagando todos os dados
router.post('/logout', async (Pedido, Resposta) => {
    Pedido.session.destroy(()=>{
        console.log('Sessao terminada')
    })
    Resposta.send(true) 
});


module.exports = router;