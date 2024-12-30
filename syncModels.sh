#!/bin/bash

set -e

cleanup() {
    echo "Cleaning up Docker containers and images..."

    docker ps -aq | xargs -r docker rm -f
    docker images -q | xargs -r docker rmi -f

    echo "Cleanup complete."
    exit 0
}

dos2unix ./backend/docker/scripts/wait-for-db.sh

rm -rf ./backend/docker/postgres-data

export SYNC=true
docker compose -f ./backend/docker/docker-compose.yml up --build -d

trap cleanup SIGINT SIGTERM EXIT

timeout=60
elapsed=0
interval=2

postgres_container=$(docker compose -f ./backend/docker/docker-compose.yml ps -q postgres)
express_container=$(docker compose -f ./backend/docker/docker-compose.yml ps -q express)

while true; do
  if docker logs "$express_container" 2>&1 | grep -q "Postgres is ready"; then
    echo "Postgres is ready"
    break
  fi

  elapsed=$((elapsed + interval))
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "Timeout reached: Postgres did not start on time"
    exit 1
  fi
  sleep "$interval"
done

docker exec -i "$postgres_container" sh -c 'pg_dump -U "admin" --schema-only "homey_db"' > ./backend/docker/dumps/init.sql

cleanup