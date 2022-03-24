FROM node:16.14.2

WORKDIR /app

COPY package.json /app/
COPY yarn.lock /app/
RUN yarn install --frozen-lockfile

COPY . /app/


RUN yarn build

ENTRYPOINT [ "yarn", "start" ]