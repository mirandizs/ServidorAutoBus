
import express from 'express'
const router = express.Router()
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { DB } from '../Globais.ts';


// STORAGE SETUP
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Server/images/menu-thumbnails');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname); // Unique filename
    }
});
const upload = multer({ storage });


// Image GET
const PastaUploads = path.join(__dirname, "../Uploads")
const EXTENSOES_SUPORTADAS = ['.jpg', '.jpeg', '.png', '.webp'];

router.get('/imagens/utilizador', (Pedido, Resposta) => {
    const utilizador = Pedido.session.utilizador

    for (const ext of EXTENSOES_SUPORTADAS) {
        const caminho = path.join(PastaUploads, `${utilizador}${ext}`);
        const Existe = fs.existsSync(caminho)

        if (Existe) {
            Resposta.sendFile(caminho);
            return
        }
    }

    Resposta.status(404).send('Imagem não encontrada');
});



// Image MENU POST
router.post('/imagens/utilizadores', async (Pedido, Resposta) => {

    try {
        if (!Pedido.file) {
            Resposta.status(400).send({ message: 'No file uploaded' });
        }
        const FileName = Pedido.file?.filename
        const FileUrl = `http://localhost:3000/imagens/utilizadores/${FileName}`
        Resposta.send({ url: FileUrl, filename: FileName });

    } catch (err: any) {
        console.warn(err);
        Resposta.status(500).json({ error: err.message });
    }
});


router.post('/imagens/criar_conta', upload.single('foto'), async (Pedido, Resposta) => {
    try {
        const { nif } = Pedido.body;
        const file = Pedido.file;

        if (!nif) {
            Resposta.status(400).json({ message: 'NIF é obrigatório.' });
            return;
        }

        const nomeImagem = file ? file.filename : 'default.jpg';

        // Atualiza a base de dados com a imagem (real ou default)
        const sql = 'UPDATE utilizadores SET foto = ? WHERE nif = ?';
        await DB.execute(sql, [nomeImagem, nif]);

        Resposta.status(200).json({ message: 'Conta criada com imagem.', filename: nomeImagem });
    } 
    
    catch (err: any) {
        console.error(err);
        Resposta.status(500).json({ error: err.message });
    }
});

module.exports = router;