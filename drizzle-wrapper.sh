#!/bin/bash

DRIZZLE_COMMAND=$1

# if command is not set, exit
if [ -z "$DRIZZLE_COMMAND" ]; then
    echo "Usage: drizzle-wrapper.sh <command>"
    exit 1
fi

# read the cluster identifier from the .env file
source .env

# if the cluster identifier is not set, exit
if [ -z "$CLUSTER_IDENTIFIER" ]; then
    echo "Cluster identifier not set. Please run 'bootstrap-db.sh' first."
    exit 1
fi

# export the cluster host
export CLUSTER_HOST="${CLUSTER_IDENTIFIER}.dsql.us-east-1.on.aws"

# generate a database token
export DB_TOKEN=$(aws dsql generate-db-connect-admin-auth-token --expires-in 3600 --hostname $CLUSTER_HOST)

drizzle-kit $DRIZZLE_COMMAND