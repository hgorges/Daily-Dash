# syntax=docker/dockerfile:1

FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install && npm cache clean --force

COPY tsconfig.json ./

COPY ./src ./src
COPY ./db ./db
COPY ./public ./public
COPY ./views ./views
COPY ./secrets ./secrets

EXPOSE $PORT

RUN npm run build
