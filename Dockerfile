FROM node:21
WORKDIR /app
COPY package.json .
RUN npm install

COPY . .

RUN npm install

CMD ["node", "index.js"]
