#!/bin/bash

if [ "${NODE_ENV}" == "development" ]; 
then
    npm install
    npm run start:dev
else
    exec dumb-init -- node dist/main.js
fi