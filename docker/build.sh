cp -rf ../../taskmill-code-arbitrary ../node_modules/

docker build --pull=true -t a7medkamel/taskmill-core-worker -f ./Dockerfile ../

# clean up
# docker rmi $(docker images -f "dangling=true" -q)