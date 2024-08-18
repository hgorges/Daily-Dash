# syntax=docker/dockerfile:1

FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

CMD [ "npm", "start" ]
