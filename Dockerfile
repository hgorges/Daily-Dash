# syntax=docker/dockerfile:1

FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY tsconfig.json ./
COPY nodemon.json ./

COPY ./src ./src
COPY ./db ./db
COPY ./public ./public
COPY ./views ./views
COPY ./secrets ./secrets

RUN npm run build
