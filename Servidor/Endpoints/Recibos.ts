import express from 'express'
import { DB } from '../Globais.ts';
import PDFDocument from 'pdfkit';

const router = express.Router();


//ROUTER DAS COMPRAS
//este router é para buscar as informações da compra que esta na base de dados para conseguir mostrar as compras realizadas ao utilizador
router.get('/compras', async (Pedido, Resposta) => {
    const id = Pedido.session.dados_utilizador?.id_utilizador

    const query = `
        SELECT 
            r.id_compraRealizada,
            DATE_FORMAT(r.data_compra, '%d/%m/%Y') AS data_compra,  
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

    const informacoesPedido = Pedido.body // body do pedido, com os dados passados~
    const idUtilizador = Pedido.session.dados_utilizador?.id_utilizador

    
    //query para inserir, caso o utilizador queira, os dados do cartão à db 
    const queryGuardarCartao = `
        INSERT INTO pagamentos (metodo, nome_cartao, numero_cartao, validade, cvv, id_utilizador) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    console.log(informacoesPedido.guardarCartao)

    if (informacoesPedido.guardarCartao) {
        const [GuardarCartao] = await DB.execute(queryGuardarCartao, [
            informacoesPedido.metodo,
            informacoesPedido.nome_cartao,
            informacoesPedido.numero_cartao,
            informacoesPedido.validade,
            informacoesPedido.cvv,
            idUtilizador
        ]) // executa a query com os valores passados.
        // console.log(GuardarCartao)
    }
    else {
        console.log("Os dados do cartão não foram guardados.")
        return;
    }




    // query para buscar os dados do carrinho
    const query = `
        SELECT * FROM carrinho WHERE id_utilizador = ?
    `;

    const [Carrinho] = await DB.execute<any[]>(query, [idUtilizador]) // executa a query com os valores passados. tambem pode usar "as any[]" para evitar erros do typescript
    console.log(Carrinho)




    
    // query para clonar os dados do carrinho para a entidade compras
    var queryCompras = `
        INSERT INTO compras (id_utilizador, id_ponto_partida, id_ponto_chegada, preco) 
        VALUES 
    `;

    
    const ValoresPassados:any[] = []

    //for para inserir os dados do carrinho, não importa a quantidade de bilhetes que o utilizador tem no carrinho, ele vai inserir todos os dados na tabela compras
    Carrinho.forEach((Bilhete: any) => {
        queryCompras += `(?, ?, ?, ?),`;
        ValoresPassados.push(
            idUtilizador, 
            Bilhete.id_ponto_partida, 
            Bilhete.id_ponto_chegada, 
            Bilhete.preco
        )
    });
    queryCompras = queryCompras.slice(0, -1); // remove a última vírgula para nao dar erro de sintaxe de SQL

    const [Resultado] = await DB.execute(queryCompras, ValoresPassados) // executa a query com os valores passados. 
    console.log(Resultado)





    //query para remover os dados do carrinho após ser adicionado à entidade compras
    const queryRemoverCarrinho = `
        DELETE FROM carrinho WHERE id_utilizador = ?
    `;

    await DB.execute(queryRemoverCarrinho, [idUtilizador]) // executa a query com os valores passados.
    Resposta.send()
});


router.get('/recibo/:id', async (Pedido, Resposta) => {
    const idCompra = Pedido.params.id;
    const idUtilizador = Pedido.session.dados_utilizador?.id_utilizador

    // Buscar os dados da compra
    const query = `
        SELECT 
        r.id_compraRealizada,
        DATE_FORMAT(r.data_compra, '%d/%m/%Y') AS data_compra,  
        r.preco,
        p1.local AS local_partida,
        p2.local AS local_chegada
        FROM compras AS r
        INNER JOIN pontos_rotas AS p1 ON r.id_ponto_partida = p1.id_ponto
        INNER JOIN pontos_rotas AS p2 ON r.id_ponto_chegada = p2.id_ponto
        WHERE r.id_utilizador = ? AND r.id_compraRealizada = ?
    `;

    const LocalPartida = Pedido.query.localPartida;

    const [result] = await DB.execute<any[]>(query, [idUtilizador, idCompra]);

    const dados = result[0];

    // Gerar o PDF
    const doc = new PDFDocument();
    Resposta.setHeader('Content-Type', 'application/pdf');
    Resposta.setHeader('Content-Disposition', `attachment; filename=recibo_${idCompra}.pdf`);
    doc.pipe(Resposta);

    doc.fontSize(20).text('Recibo de Compra', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Número da Compra: ${dados.id_compraRealizada}`);
    doc.text(`Data da Compra: ${dados.data_compra}`);
    doc.text(`Origem: ${dados.local_partida}`);
    doc.text(`Destino: ${dados.local_chegada}`);
    doc.text(`Preço: €${dados.preco.toFixed(2)}`);
    doc.end();
});


module.exports = router;