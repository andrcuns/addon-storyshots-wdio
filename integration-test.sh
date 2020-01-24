#!/bin/bash

set -e

yarn build-storybook

docker run -d --name=grid -p 4444:24444 \
  -v /dev/shm:/dev/shm  \
  -v $PWD:/app \
  elgalu/selenium:3.141.59-p36

docker exec grid wait_all_done 30s

yarn integration-test $@

docker rm -vf grid
