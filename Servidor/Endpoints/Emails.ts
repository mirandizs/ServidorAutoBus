import express from 'express'
const router = express.Router();
import { DB, ServicoEmail } from '../Globais.ts';
import { Console } from 'console';





// Gera um codigo de confirmacao aleatorio e guarda na sessao. A verificacao de codigo e realizada em outros endpoints que precisam de confirmacao
router.post('/email-confirmacao', async (Pedido, Resposta) => {

    const emailUtilizador = Pedido.session.dados_utilizador?.email
    const nome = Pedido.session.dados_utilizador?.nome
    const nif = Pedido.session.dados_utilizador?.nif

    const code = Math.floor(Math.random() * 1000000) // Gera um numero aleatorio entre 0 e 999999

    const html = `
            <div style='
            padding-top: 20px;
            padding-left: 20px;
            padding-right: 20px;
            width: 620px;
            height: 490px; 
            border-radius: 10px;
            background-color: rgb(3,3,59); /* Cor de fundo */
        '>
            <div style='
                color: black;
                padding-top: 10px;
                padding-left: 20px;
                padding-right: 20px;
                width: 580px;
                height: 450px; 
                border-radius: 10px;
                border: 1px solid rgba(3, 3, 56, 0.945); /* Bordas */
                background-color: rgb(255, 255, 255); /* Cor de fundo */
                box-shadow: 0 4px 10px 2px rgba(0, 0, 0, 0.4); /* Sombra */
                margin-bottom: 10px;
                margin-right: 200px;
            '>
                <h1 style='text-align: left;padding-left: 10px;color: rgb(0, 0, 150);'>AutoBus</h1>

                <hr style='border: 1px solid rgb(0, 0, 150); margin-left: 10px; margin-right: 10px; width: 540px;'><br>

                <div style='margin-left: 10px; color:black; word-wrap: break-word; white-space: normal; overflow-wrap: break-word;'>
                    <p>Olá, <strong style='color:rgb(0, 0, 150)'>${nome}</strong></p>
                    <p style='word-wrap: break-word; padding-bottom: 15px; white-space: normal; overflow-wrap: break-word;'>Agradecemos por utilizar o AutoBus. Para continuar com a tua verificação, utiliza o código abaixo:</p>
                    <h2 style='color: rgb(30, 0, 200);padding-bottom: 15px'>${code}</h2>
                    <p style='padding-bottom: 15px'>Se não foste tu a solicitar este código, por favor, ignore este email.</p>

                    <p>Atenciosamente,<br>
                       <strong style='color:rgb(110, 110, 110)'>Equipa AutoBus.</strong></a>
                    </p>
                </div>
            </div>
        </div>
    `

    const OpcoesEmail = {
        from: 'AutoBus', //<autobus.pap@gmail.com>
        to: emailUtilizador,
        subject: 'Código de Verificação',
        html: html,
        replyTo: 'autobus.pap@gmail.com'
    }

    if (emailUtilizador) {
        Pedido.session.codigo_confirmacao = code // Guarda o codigo na sessao
        console.log('Código de confirmação guardado na sessão:', code)


        ServicoEmail.sendMail(OpcoesEmail, (Erro, Info) => {
            {
                // Nao da para utilizar o await aqui, por isso usa-se um callback
                // O callback e uma funcao chamada apos o email ser enviado, independentemente de ter dado erro ou nao

                if (Erro) {
                    console.log('Erro ao enviar email: ', Erro)
                    Resposta.status(500).send()
                } else {
                    console.log('Email enviado')
                    Resposta.send(true)
                }
            }
        })
        Resposta.send(true)
    } 
    
    else {
        Resposta.statusMessage = 'Nao tem login'
        Resposta.status(401).send()
    }
});



// router de contacto com os administradores (página contacto)
router.post('/email-contacto', async (Pedido, Resposta) => {

    try {
        const { email, assunto, mensagem } = Pedido.body;

        // const Email = Pedido.body.email

        const [rows]: any = await DB.execute('SELECT id_utilizador, nome, nif FROM utilizadores WHERE email = ?', [email]);

        const { id_utilizador, nome, nif } = rows[0] || {};
        const msg = mensagem.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        const html = `
            <div style='
                padding-top: 20px;
                padding-left: 20px;
                padding-right: 20px;
                width: 620px;
                height: 490px; 
                border-radius: 10px;
                background-color: rgb(3,3,59);
            '>
                <div style='
                    color: black;
                    padding-top: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    width: 580px;
                    height: 450px; 
                    border-radius: 10px;
                    border: 1px solid rgba(3, 3, 56, 0.945);
                    background-color: rgb(255, 255, 255);
                    box-shadow: 0 4px 10px 2px rgba(0, 0, 0, 0.4);
                    margin-bottom: 10px;
                    margin-right: 200px;
                '>
                    <h1 style='text-align: left;padding-left: 10px;color: rgb(0, 0, 150);'>AutoBus</h1>

                    <hr style='border: 1px solid rgb(0, 0, 150); margin-left: 10px; margin-right: 10px; width: 550px;'><br>

                    <div style='margin-left: 10px; color:black; word-wrap: break-word; white-space: normal; overflow-wrap: break-word;'>
                        <p>Id do utilizador: <strong style='color:rgb(0, 0, 150)'>${id_utilizador}</strong><br>
                            NIF: <strong style='color:rgb(0, 0, 150)'>${nif}</strong>
                        </p>

                        <p> Nome do utilizador: <strong style='color:rgb(0, 0, 150)'>${nome}</strong><br>
                            Email: <strong style='color:rgb(0, 0, 150)'>${email}</strong>
                        </p><br>

                        <div style='display: flex; /*align-items: center;*/'>
                            <p style='margin-right: 10px;'>Mensagem: </p>
                            
                            <div style='
                                display: block;
                                width: 460px; 
                                height: 150px; 
                                white-space: normal;
                                word-wrap: normal;
                                word-break: normal;
                                border: 2px solid rgb(224, 224, 224); 
                                border-radius: 4px;
                                font-weight: bold;
                                color: rgb(0, 0, 150);
                                font-family: Calibri;
                                font-size: 16px;
                                margin-top:12px;
                                padding-top: 5px;
                                padding-right:15px;
                                padding-left:10px;
                                overflow-y: auto;
                                text-align:justify;
                            '><div style='white-space: pre-wrap;'>${msg}</div>
                    </div>
                </div>
            </div>
        `



        const OpcoesEmail = {
            from: email,
            to: 'autobus.pap@gmail.com',
            subject: assunto,
            html: html,
        }
        

        ServicoEmail.sendMail(OpcoesEmail, (Erro, Info) => {
            if (Erro) {
                console.log('Erro ao enviar email: ', Erro)
                Resposta.status(500).send()
            } else {
                console.log('Email enviado')
                Resposta.send(true)
            }
        })
    }

    catch (err) {
        console.error("Erro interno:", err);
        Resposta.status(500).send('Erro no servidor');
    }
});


router.post('/verificar-email', async (Pedido, Resposta) => { 
    const { email } = Pedido.body; // Pega o email do body do pedido

    if (Pedido.session.codigo_confirmacao) {
        // Verifica se o email corresponde ao da sessão
        if (Pedido.session.dados_utilizador?.email === email) {
            // Pedido.session.em_verificacao = true;

            // Remover o código da sessão
            delete Pedido.session.codigo_confirmacao;
            console.log('Código de confirmação verificado com sucesso:', Pedido.session.codigo_confirmacao);

            Resposta.send(true); // Envia resposta positiva
            console.log('Não há códigos na sessão');
        } 
        
        else {
            Resposta.statusMessage = 'Email inválido';
            Resposta.status(401).send(); // Código errado
        }
    } 
    
    else {
        Resposta.statusMessage = 'Não tem login';
        Resposta.status(401).send(); // Não há código na sessão
    }
})


// router.post('/verificar-codigo', async (Pedido, Resposta) => {
//     const { codigo } = Pedido.body; // Pega o codigo do body do pedido

//     if (Pedido.session.codigo_confirmacao) {
//         if (Pedido.session.codigo_confirmacao == codigo) {
//             //Pedido.session.em_verificacao = true;

//             // Remover o código da sessão
//             delete Pedido.session.codigo_confirmacao;
//             console.log('Código de confirmação verificado com sucesso:', codigo);

//             Resposta.send(true); // Envia resposta positiva
//             console.log('Não há codigos na sessão');
//         } 
        
//         else {
//             Resposta.statusMessage = 'Código inválido';
//             Resposta.status(401).send(); // Código errado
//         }
//     } 
    
//     else {
//         Resposta.statusMessage = 'Não tem login';
//         Resposta.status(401).send(); // Não há código na sessão
//     }
// });



module.exports = router;