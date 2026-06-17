FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN npm run build

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "dist/main"]
