import express from 'express'
import { DB } from '../Globais';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';


const router = express.Router();


//ROUTER DAS COMPRAS
//este router é para buscar as informações da compra que esta na base de dados para conseguir mostrar as compras realizadas ao utilizador
router.get('/compras', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const query = `
        SELECT 
            r.id_compraRealizada,
            DATE_FORMAT(r.data, '%d/%m/%Y') AS data_compra,  
            r.preco,
            p1.local AS local_partida,
            p2.local AS local_chegada
        FROM compras AS r
        INNER JOIN pontos_rotas AS p1 ON r.id_ponto_partida = p1.id_ponto
        INNER JOIN pontos_rotas AS p2 ON r.id_ponto_chegada = p2.id_ponto
        WHERE r.id_utilizador = ${id}
    `;
    //na query, "DATE_FORMAT(r.data_compra, '%d/%m/%Y') AS data_compra" isto foi feito para formatar a data de forma a ficar mais legível para o utilizador, ou seja, de YYYY-MM-DD para DD/MM/YYYY, tirando a hora em que foi comprado o bilhete

    const [Resultado] = await DB.query(query)

    Resposta.send(Resultado)
});



//ROUTER DAS COMPRAS
router.post('/comprar', async (Pedido, Resposta) => {

    if (Pedido.session.codigo_confirmacao == Pedido.body.codigo_verificacao) {
        const informacoesPedido = Pedido.body
        const idUtilizador = Pedido.session.dados_utilizador?.id_utilizador


        //query para inserir, caso o utilizador queira, os dados do cartão à db 
        const queryGuardarCartao = `
        INSERT INTO pagamentos (nome_cartao, numero_cartao, validade, id_utilizador) 
        VALUES (?, ?, ?, ?)
    `;

        const campos = {
            nome_cartao: Pedido.body.nome_cartao,
            numero_cartao: Pedido.body.numero_cartao,
            validade: Pedido.body.validade,
            id_utilizador: idUtilizador,
        }

        //console.log(campos)

        const NumCartaoFormatado = String(informacoesPedido.numero_cartao).replaceAll(' ', '')

        if (informacoesPedido.guardarCartao) {
            const [GuardarCartao] = await DB.execute(queryGuardarCartao, [
                informacoesPedido.nome_cartao,
                NumCartaoFormatado,
                informacoesPedido.validade,
                idUtilizador
            ])
        }
        else {
            console.log("Os dados do cartão não foram guardados.")
        }



        // query para buscar os dados do carrinho
        const query = `
        SELECT * FROM carrinho WHERE id_utilizador = ?
    `;

        const [Carrinho] = await DB.execute<any[]>(query, [idUtilizador]) // executa a query com os valores passados. tambem pode usar "as any[]" para evitar erros do typescript






        // query para clonar os dados do carrinho para a entidade compras
        var queryCompras = `
        INSERT INTO compras (id_utilizador, id_ponto_partida, id_ponto_chegada, preco, data, hora, tipo, distancia_km, duracao_estimada, hora_chegada, tipo_pagamento) 
        VALUES 
    `;


        const ValoresPassados: any[] = []

        //for para inserir os dados do carrinho, não importa a quantidade de bilhetes que o utilizador tem no carrinho, ele vai inserir todos os dados na tabela compras
        Carrinho.forEach((Bilhete: any) => {
            queryCompras += `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),`;
            ValoresPassados.push(
                idUtilizador,
                Bilhete.id_ponto_partida,
                Bilhete.id_ponto_chegada,
                Bilhete.preco,
                Bilhete.data,
                Bilhete.hora,
                Bilhete.tipo,
                Bilhete.distancia_km,
                Bilhete.duracao_estimada,
                Bilhete.hora_chegada,
                informacoesPedido.tipo_pagamento
            )
        });
        console.log(ValoresPassados)

        queryCompras = queryCompras.slice(0, -1); // remove a última vírgula para nao dar erro de sintaxe de SQL

        const [Resultado] = await DB.execute(queryCompras, ValoresPassados) // executa a query com os valores passados. 
        console.log('compra executada')





        //query para remover os dados do carrinho após ser adicionado à entidade compras
        const queryRemoverCarrinho = `
        DELETE FROM carrinho WHERE id_utilizador = ?
    `;

        await DB.execute(queryRemoverCarrinho, [idUtilizador]) // executa a query com os valores passados.
        Resposta.send()
    } else {
        Resposta.status(401).send({ erro: "Código de confirmação inválido." });
    }

});




function gerarCodigo() {
    let codigo = '';
    for (let i = 0; i < 10; i++) {
        codigo += Math.floor(Math.random() * 10); // Gera um número entre 0 e 9
    }
    return codigo;
}

function gerarCodigoV() {
    let codigo = '';
    for (let i = 0; i < 4; i++) {
        codigo += Math.floor(Math.random() * 10); // Gera um número entre 0 e 9
    }
    return codigo;
}



// Exemplo de uso
// console.log("Código gerado:", gerarCodigo10Digitos());




router.get('/recibo/:id', async (Pedido, Resposta) => {
    const idCompra = Pedido.params.id;
    const idUtilizador = Pedido.session.dados_utilizador?.id_utilizador

    // Buscar os dados da compra
    const query = `
        SELECT 
        r.id_compraRealizada,
        DATE_FORMAT(r.data, '%d/%m/%Y') AS data_compra,  
        r.preco,
        r.hora,
        r.tipo,
        r.distancia_km,
        r.duracao_estimada,
        r.hora_chegada,
        r.tipo_pagamento,
        a.numero,
        p1.local AS local_partida,
        p2.local AS local_chegada,
        p1.hora_partida AS hora_partida,
        u.nome,
        u.nif
        FROM compras AS r
        INNER JOIN pontos_rotas AS p1 ON r.id_ponto_partida = p1.id_ponto
        INNER JOIN pontos_rotas AS p2 ON r.id_ponto_chegada = p2.id_ponto
        INNER JOIN utilizadores AS u ON r.id_utilizador = u.id_utilizador
        INNER JOIN pagamentos AS pg ON r.id_utilizador = pg.id_utilizador
        INNER JOIN autocarro AS a ON a.idautocarro = p1.idautocarro
        WHERE r.id_utilizador = ? AND r.id_compraRealizada = ?
    `;

    // pg.metodo N existe, tirei

    const LocalPartida = Pedido.query.localPartida;

    const [result] = await DB.execute<any[]>(query, [idUtilizador, idCompra]);

    const dados = result[0];

    console.log(dados)

    const numeroBilhete = gerarCodigo();
    const codigoReserva = gerarCodigo();
    const codigoViagem = gerarCodigoV();

    const logoPath = 'Servidor/logo.png'


    // Gerar QR Code
    const conteudoQR = `Reserva ${codigoReserva} | Bilhete ${numeroBilhete} | ${dados.local_partida} > ${dados.local_chegada}`;
    const qrDataURL = await QRCode.toDataURL(conteudoQR);
    const qrBuffer = Buffer.from(qrDataURL.split(',')[1], 'base64');

    const doc = new PDFDocument({ margin: 50 });
    Resposta.setHeader('Content-Type', 'application/pdf');
    Resposta.setHeader('Content-Disposition', `attachment; filename=bilhete_${idCompra}.pdf`);
    doc.pipe(Resposta);

    // TÍTULO
    const x = 50;
    const y = 40; // Common Y position for both
    doc.image(logoPath, x, y, { align: 'center', width: 120 })


    // QR CODE
    const qrSize = 150;
    const margin = 60;
    const qrX = doc.page.width - qrSize - margin; // Align to the right
    doc.image(qrBuffer, qrX, y, { width: qrSize }).moveDown(5)

    // CÓDIGOS
    doc.fontSize(12).font('Helvetica').text(`Reserva: ${codigoReserva}`, { align: 'right', width: doc.page.width - 4.5 * margin});
    doc.font('Helvetica').text(`Nº Bilhete: ${numeroBilhete}`, { align: 'right', width: doc.page.width - 4.5 * margin});
    doc.font('Helvetica').text(`Pagamento ID: ${gerarCodigo()}_${Math.floor(Math.random() * 9)}`, { align: 'right', width: doc.page.width - 4.5 * margin});
    doc.font('Helvetica').text(`Código Viagem: ${codigoViagem}`, { align: 'right', width: doc.page.width - 4.5 * margin})

    doc.moveDown(1);

    // Optional: right-align the text too
    doc.fontSize(7).text('Apresenta este QR Code ao motorista.', {
        align: 'right',
        width: doc.page.width - 2 * margin
    })
    
    // DADOS PESSOAIS
    doc.fillColor('black').fontSize(12);
    doc.fontSize(9).font('Helvetica').text(`Nome:`); 
    doc.fontSize(12).font('Helvetica-Bold').text(`${dados.nome}`).moveDown(0.7)

    doc.fontSize(9).font('Helvetica').text(`Preço: `);
    doc.fontSize(12).font('Helvetica-Bold').text(`${dados.preco.toFixed(2)} €`).moveDown(0.7)

    doc.fontSize(9).font('Helvetica').text(`NIF: `);
    doc.fontSize(12).font('Helvetica-Bold').text(`${dados.nif.toFixed(2)}`).moveDown(2.5)

    // doc.fontSize(9).font('Times-Roman').text(`Pagamento: ${dados.metodo}`);


    // INFO VIAGEM
    doc.fontSize(16).fillColor('#03033b').text('Detalhes da Viagem').moveDown(0.7);
    doc.fontSize(12).fillColor('black');
    doc.fontSize(12).font('Helvetica').text(`Data da viagem: ${dados.data_compra}`).moveDown(0.2);
    doc.text(`Origem: ${dados.local_partida}`).moveDown(0.2);
    doc.text(`Destino: ${dados.local_chegada}`).moveDown(0.2);
    doc.text(`Hora de partida: ${dados.hora_partida}`).moveDown(0.2);
    doc.text(`Hora de chegada: ${dados.hora_chegada}`).moveDown(0.2);
    doc.text(`Duração estimada da viagem: ${dados.duracao_estimada}`).moveDown(0.2);
    doc.text(`Distância em km: ${dados.distancia_km}`).moveDown(0.2);
    doc.text(`Autocarro Nº: ${dados.numero}`).moveDown(2);


    // INFO EXTRA
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#03033b').text('Checklist antes da viagem', { underline: true }).moveDown(1);
    doc.fontSize(10).fillColor('black').list([
        'Chega pelo menos 15 minutos antes da partida.',
        'Utiliza cadeado e identifica sempre a bagagem.',
        'Documentos e objetos de valor devem acompanhar o passageiro.',
        'Não te esqueças do teu cartão de cidadão/passaporte.',
    ]).moveDown(3);


    doc.fontSize(16).font('Helvetica-Bold').fillColor('#03033b').text('Apoio ao cliente').moveDown(1);
    doc.fontSize(10).text('Linha telefónica: +351 916 942 618').moveDown(0.2);
    doc.fontSize(10).text('E-mail: autobus.pap@gmail.com').moveDown(0.2);

    doc.end();
    console.log("recibo tranferido!")
});


module.exports = router;