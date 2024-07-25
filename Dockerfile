FROM node:18-alpine

WORKDIR /app

ADD . .

ENV NODE_ENV="development"

EXPOSE 80
