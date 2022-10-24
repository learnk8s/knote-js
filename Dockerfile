FROM node:18.0-slim
RUN mkdir /usr/app
COPY . /usr/app
WORKDIR . /usr/app/01
RUN npm install
CMD [ "node", "index.js" ]
