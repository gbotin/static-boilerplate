FROM node:latest

RUN mkdir /app
WORKDIR /app

ADD package.json /app
ADD bower.json /app
ADD gulp.config.js /app
ADD gulpfile.js /app

RUN npm i -g bower gulp
RUN npm i

ADD . /app
