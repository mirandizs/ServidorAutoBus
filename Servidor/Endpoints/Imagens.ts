
import express, { NextFunction } from 'express'
const router = express.Router()
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { DB } from '../Globais.ts';


const storage = multer.diskStorage({ //multer é para processar imagens em url_search params
    destination: (req, file, cb) => {
        cb(null, 'Servidor/Uploads');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const NomeFicheiro = String(req.session.dados_utilizador!.nif) + ext
        cb(null, NomeFicheiro); // cb é para processar a foto
    }
});
const ProcessarImagemUtilizador = multer({ storage });


// Image GET
const PastaUploads = path.join(__dirname, "../Uploads")
const EXTENSOES_SUPORTADAS = ['.jpg', '.jpeg', '.png', '.webp'];

function ProcurarImagem(NIF: string | number) {
    for (const ext of EXTENSOES_SUPORTADAS) {
        const caminho = path.join(PastaUploads, `${NIF}${ext}`);
        const Existe = fs.existsSync(caminho)

        if (Existe) {
            return caminho
        }
    }
    return undefined
}

function ApagarImagemAntiga(Pedido: Express.Request, Resposta:Express.Response, next:NextFunction) {

    const ImagemAntiga = ProcurarImagem(Pedido.session.dados_utilizador!.nif!)
    if (ImagemAntiga) {
        fs.unlinkSync(ImagemAntiga); // apaga a imagem antiga
    }
    next();
}


// Carregar imagem do utilizador
//PARA O WEBSITE
router.get('/imagens/utilizador', (Pedido, Resposta) => {
    const nif = Pedido.session.dados_utilizador?.nif
    //console.log(Pedido.params, 'Teste')

    const ImagemUtilizador = ProcurarImagem(nif!)
    if (ImagemUtilizador) {
        Resposta.sendFile(ImagemUtilizador)
    } else {
        Resposta.status(404).send('Imagem não encontrada');
    }
});




//PARA A APLICACAO 
router.get('/imagens/utilizador/:nif', (Pedido, Resposta) => {
    const nif = Pedido.params.nif || Pedido.session.dados_utilizador?.nif 
    //console.log(Pedido.params, 'Teste')

    const ImagemUtilizador = ProcurarImagem(nif!)
    if (ImagemUtilizador) {
        Resposta.sendFile(ImagemUtilizador)
    } else {
        Resposta.status(404).send('Imagem não encontrada');
    }
});




// Alterar imagem do utilizador
router.post('/imagens/utilizador', ApagarImagemAntiga, ProcessarImagemUtilizador.single('foto'), async (Pedido, Resposta) => {

    try {
        if (!Pedido.file) {
            Resposta.status(400).send({ message: 'No file uploaded' });
        }
        Resposta.send();
        console.log("Imagem trocada")

    } catch (err: any) {
        console.warn(err);
        Resposta.status(500).json({ error: err.message });
    }
});


router.post('/imagens/criar_conta', ProcessarImagemUtilizador.single('foto'), async (Pedido, Resposta) => {
    try {
        const file = Pedido.file;
        if (!file) {
            Resposta.status(400).json({ message: 'NIF é obrigatório.' });
            return;
        }
        Resposta.status(200).json({ message: 'Conta criada com imagem.' });
    }

    catch (err: any) {
        console.error(err);
        Resposta.status(500).json({ error: err.message });
    }
});

module.exports = router;