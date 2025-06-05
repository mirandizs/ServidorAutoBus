import express from 'express'
const router = express.Router();
import { DB, ServicoEmail } from '../Globais.ts';


// Gera um codigo de confirmacao aleatorio e guarda na sessao. A verificacao de codigo e realizada em outros endpoints que precisam de confirmacao
router.post('/email-confirmacao', async (Pedido, Resposta) => {

    const Email = Pedido.session.dados_utilizador?.email

    const OpcoesEmail = {
        from: 'Auto Bus',
        to: Email,
        subject: 'Código de Verificação',
        text: 'i hope this works',
    }

    if (Email) {
        const NovoCodigo = Math.floor(Math.random() * 1000000) // Gera um numero aleatorio entre 0 e 999999
        Pedido.session.codigo_confirmacao = NovoCodigo // Guarda o codigo na sessao


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
    } else {
        Resposta.statusMessage = 'Nao tem login'
        Resposta.status(401).send()
    }

});

router.post('/email-contacto', async (Pedido, Resposta) => {

    const Email = Pedido.body.email

    const OpcoesEmail = {
        from: 'Auto Bus',
        to: Email,
        subject: 'Código de Verificação',
        text: 'i hope this works',
    }

    ServicoEmail.sendMail(OpcoesEmail, (Erro, Info) => {
        {
            if (Erro) {
                console.log('Erro ao enviar email: ', Erro)
                Resposta.status(500).send()
            } else {
                console.log('Email enviado')
                Resposta.send(true)
            }
        }
    })


});


module.exports = router;