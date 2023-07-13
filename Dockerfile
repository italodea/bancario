# Use uma imagem base do Node.js
FROM node:18

# Defina o diretório de trabalho dentro do container
WORKDIR /backend

# Copie o arquivo package.json e o arquivo package-lock.json (se existir)
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o código do projeto para o diretório de trabalho no container
COPY . .

# Expõe a porta 8080 (ou qualquer outra porta que seu aplicativo Express esteja usando)
EXPOSE 8080

# Comando para iniciar o servidor do Express quando o container for executado
CMD ["npm", "start"]
