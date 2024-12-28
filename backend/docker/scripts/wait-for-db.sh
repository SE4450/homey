#!/bin/sh
MAX_WAIT_TIME=120
elapsed_time=0

while [ "$elapsed_time" -lt 120 ]; do
  if nc -z "$DB_HOST" "$DB_PORT"; then
    echo "Postgres is ready. Starting Express server..."
    exec "$@" 
  else
    echo "Waiting for the Postgres to be ready before starting the Express server..."
    sleep 10
    elapsed_time=$((elapsed_time + 10))
  fi
done

echo "Error: Postgres is not ready after ${MAX_WAIT_TIME} seconds."
exit 1 