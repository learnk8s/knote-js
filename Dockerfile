FROM node:18.0-slim
RUN mkdir /usr/app
WORKDIR . /usr/app
COPY . /usr/app
RUN npm install
CMD [ "node", "index.js" ]
