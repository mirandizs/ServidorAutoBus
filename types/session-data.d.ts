import "express-session";

// Quaisquer dados que sao guardados na sessao, devem ter o seu tipo declarado aqui

declare module "express-session" {
  interface SessionData {
    utilizador: string;
    dados_utilizador:DadosUtilizador;
    codigo_confirmacao: number;
    // codigo_confirmacao?: string | number;
    // em_verificacao?: boolean;
  }
}

// Este ficheiro e apenas para sessao. Se for necessario adicionar tipos de dados como no (dados-utilizador.d.ts), deve-se adicionar em qualquer outro ficheiro .d.ts
// ou entao criar um novo ficheiro .d.ts com o nome que se quiser, desde que tenha a extensao .d.ts

// Como estamos a utilizar modulos ja existentes, o typescript nao sabe os tipos de dados que podem estar dentro de uma sessao
// por isso tem de ser declarados