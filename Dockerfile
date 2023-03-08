FROM node:18
WORKDIR /usr/src/app

COPY . .

RUN ls -al

RUN yarn install --frozen-lockfile

RUN yarn build

CMD [ "node", "./dist/main.js" ]

EXPOSE 8080