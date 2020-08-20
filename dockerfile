FROM node:alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY index.js ./
COPY config.js ./
COPY device.js ./
COPY platform.js ./
COPY state.js ./

CMD [ "node", "index.js" ]