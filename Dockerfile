FROM node

WORKDIR /code
COPY src/ /code

COPY package.json /code/package.json
COPY yarn.lock /code/yarn.lock
RUN yarn
RUN yarn build

CMD yarn start