FROM node:18.0-slim
WORKDIR . /usr/app
COPY . /usr/app
RUN npm install
CMD [ "node", "index.js" ]
