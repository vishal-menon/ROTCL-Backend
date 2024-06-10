FROM node:17-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3001 3500

CMD ["npm", "run", "dev"]
