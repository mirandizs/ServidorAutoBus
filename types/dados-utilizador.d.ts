
// Aqui e declarado um tipo de objeto, com campos relativamento a um utilizador
// Qualquer tipo de objeto declarado num ficheiro de d.ts pode ser usado em qualquer parte do projeto
// serve puramente para autocomplete, nao e necessario

interface DadosUtilizador {
    id_utilizador: number;
    nif: number;
    nome: string;
    nascimento: string;
    telefone: number;
    localidade: string;
    email: string;
    //password: string; // Nao e necessario, pois a password nunca e enviada para o cliente
    tipo_utilizador: number;
    atividade: number;
  }