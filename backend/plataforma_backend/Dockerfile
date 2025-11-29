FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir el proyecto (si usas TypeScript/tsup)
RUN npm run build

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "run", "start"]
