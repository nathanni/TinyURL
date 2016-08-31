FROM node

RUN npm install bower -g

RUN mkdir -p /app

ADD . /app

RUN cd /app && npm install

RUN cd /app/frontend && bower install --allow-root


EXPOSE 3000

CMD ["node", "/app/server.js"]