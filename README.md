
## Ler campos
Para ler campos que foram passados do cliente para o servidor, há vários métodos:

- Pedido.query - Quando o as informacões estão codificadas no link do pedido (ex: http://localhost:3000/api/utilizadores?nome=sofia)
Geralmente apenas se usa no metodo GET, pois o número de informações é limitado e menos seguro

- Pedido.params - Quando o as informacões, geralmente apenas uma, são passadas dinamicamente pelo link (ex: http://localhost:3000/api/utilizadores/sofia)
O nome dos parametros está definido no servidor (ex: /utilizadores/:nome)

- Pedido.body - Quando as informa
Geralmente é sempre usado em métodos

## Tipos de body (Content-Type)
Isto é mais para o front-end. O servidor já converte estes tipos automaticamente

application/json:
- Usado mais normalmente

application/x-www-form-urlencoded
- Usado sempre em forms. Quando um form tem definido no frontend uma action, isto é automatico

## Erros comuns
(Nome da propriedade) não é parte de .session (Pedido/Request .session)

Para resolver isto, tens que adicionar uma certa propriedade ao tipo de SessionData. Isto encontra-se na pasta "types", no ficheiro session-data.d.ts