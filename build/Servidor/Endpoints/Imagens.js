"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Servidor/Uploads');
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const NomeFicheiro = String(req.session.dados_utilizador.nif) + ext;
        cb(null, NomeFicheiro); // cb é para processar a foto
    }
});
const ProcessarImagemUtilizador = (0, multer_1.default)({ storage });
// Image GET
const PastaUploads = path_1.default.join(__dirname, "../Uploads");
const EXTENSOES_SUPORTADAS = ['.jpg', '.jpeg', '.png', '.webp'];
function ProcurarImagem(NIF) {
    for (const ext of EXTENSOES_SUPORTADAS) {
        const caminho = path_1.default.join(PastaUploads, `${NIF}${ext}`);
        const Existe = fs_1.default.existsSync(caminho);
        if (Existe) {
            return caminho;
        }
    }
    return undefined;
}
function ApagarImagemAntiga(Pedido, Resposta, next) {
    const ImagemAntiga = ProcurarImagem(Pedido.session.dados_utilizador.nif);
    if (ImagemAntiga) {
        fs_1.default.unlinkSync(ImagemAntiga); // apaga a imagem antiga
    }
    next();
}
// Carregar imagem do utilizador
//PARA O WEBSITE
router.get('/imagens/utilizador', (Pedido, Resposta) => {
    const nif = Pedido.session.dados_utilizador?.nif;
    //console.log(Pedido.params, 'Teste')
    const ImagemUtilizador = ProcurarImagem(nif);
    if (ImagemUtilizador) {
        Resposta.sendFile(ImagemUtilizador);
    }
    else {
        Resposta.status(404).send('Imagem não encontrada');
    }
});
//PARA A APLICACAO 
router.get('/imagens/utilizador/:nif', (Pedido, Resposta) => {
    const nif = Pedido.params.nif || Pedido.session.dados_utilizador?.nif;
    //console.log(Pedido.params, 'Teste')
    const ImagemUtilizador = ProcurarImagem(nif);
    if (ImagemUtilizador) {
        Resposta.sendFile(ImagemUtilizador);
    }
    else {
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
        console.log("Imagem trocada");
    }
    catch (err) {
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
    catch (err) {
        console.error(err);
        Resposta.status(500).json({ error: err.message });
    }
});
module.exports = router;
