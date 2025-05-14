import express from 'express'
const router = express.Router();
import { DB } from '../Globais.ts';

// router.get('/recibos', async (Pedido, Resposta) => {
//     const id = Pedido.session.dados_utilizador?.id_utilizador

//     const query = `
//         SELECT 
//             r.id_recibo,
//             r.data,
//             r.valor,
//             r.estado,
//             p.local AS local_partida,
//             p2.local AS local_chegada
//         FROM recibos AS r
//         INNER JOIN pontos_rotas AS p ON r.id_ponto_partida = p.id_ponto
//         INNER JOIN pontos_rotas AS p2 ON r.id_ponto_chegada = p2.id_ponto
//         WHERE r.id_utilizador = ${id}
//     `

//     const [Resultado] = await DB.query(query)

//     Resposta.send(Resultado)
// });



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

module.exports = router;