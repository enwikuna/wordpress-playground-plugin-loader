!#/bin/bash

container_id=$(docker run --name wordpress-playground-plugin-loader -p 6379:6379 -d redis)
nodemon --exec ts-node src/index.ts
docker stop $container_id
docker rm $container_id