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
        console.log('Sessão iniciada')
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



router.post('/criar_conta', async (Pedido, Resposta) => {

    const Campos = Pedido.body // Body do pedido, com os dados passados
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
    
    const QUERY = `INSERT INTO utilizadores (nome, nif, nascimento, telefone, localidade, email, password, tipo_utilizador, atividade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const [Resultado] = await DB.execute(QUERY, ValoresParaInserir) as any[]


    if (Resultado.affectedRows > 0) { // Se tiver inserido algum utilizador
        
        Pedido.session.dados_utilizador = Campos // guarda a sessao do utilizador
        Pedido.session.utilizador = Campos.nome
        
        console.log('Conta criada')
        Resposta.redirect('/foto_perfil'); // Envia os dados do utilizador de volta
    } else {
        Resposta.statusMessage = 'Erro a criar conta!' // Define a mensagem de erro
        Resposta.status(401).send() // Manda um codigo de erro com resposta vazia
    }
})

module.exports = router;