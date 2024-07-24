FROM node:18-alpine

WORKDIR /app

ADD . .

RUN npm install

ENV NODE_ENV="development"

EXPOSE 80

CMD ["npm", "run", "dev"]
