cleanup() {
    echo "Cleaning up images and containers"
    docker rm -f $(docker ps -aq)
    docker rmi -f $(docker images -q)
    exit 0
}

trap cleanup SIGINT

(cd ./frontend && npx expo start) &
docker-compose -f ./backend/docker/docker-compose.yml up --build &

wait

cleanup