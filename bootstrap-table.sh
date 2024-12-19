#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed"
    exit 1
fi

if ! aws configure list &> /dev/null; then
    echo "AWS credentials are not configured. Please configure them using 'aws configure'."
    exit 1
fi

echo "AWS CLI is installed and credentials are configured."

if [ ! -f .env ]; then
    touch "${SCRIPT_DIR}/.env"
    # write default cluster name to env file: awsfundamentals
    echo "CLUSTER_IDENTIFIER=awsfundamentals" >> "${SCRIPT_DIR}/.env"
fi

# load cluster name
source "${SCRIPT_DIR}/.env"

# doesn't work in many regions yet
AWS_REGION='us-east-1'

# check if our cluster already exists
CLUSTERS=$(aws dsql list-clusters --region $AWS_REGION --query 'clusters[*].[arn,identifier]' --output text)

CLUSTER_EXISTS=false

# describe each cluster and check for our tag
while read -r CLUSTER; do
    CLUSTER_ARN=$(echo $CLUSTER | awk '{print $1}')
    CLUSTER_IDENTIFIER=$(echo $CLUSTER | awk '{print $2}')
    NAME=$(aws dsql list-tags-for-resource --resource-arn $CLUSTER_ARN --region $AWS_REGION | jq -r '.tags.Name')
    if [ "$NAME" == "$CLUSTER_NAME" ]; then
        CLUSTER_EXISTS=true
        echo "Cluster with name $CLUSTER_NAME already exists: $CLUSTER_IDENTIFIER"
        # write the cluster identifier to the .env file if it doesn't exist yet
        if ! grep -q "CLUSTER_IDENTIFIER" .env; then
            echo "CLUSTER_IDENTIFIER=$CLUSTER_IDENTIFIER" >> "${SCRIPT_DIR}/.env"
        fi
        # if it already exists, overwrite it
        if [ "$CLUSTER_IDENTIFIER" != "$CLUSTER_NAME" ]; then
            echo "Overwriting CLUSTER_IDENTIFIER in .env file"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/CLUSTER_IDENTIFIER=.*/CLUSTER_IDENTIFIER=$CLUSTER_IDENTIFIER/" .env
            else
                sed -i "s/CLUSTER_IDENTIFIER=.*/CLUSTER_IDENTIFIER=$CLUSTER_IDENTIFIER/" .env
            fi
        fi
    fi
done <<< "$CLUSTERS"

if [ "$CLUSTER_EXISTS" = false ]; then
    echo "Creating cluster with name $CLUSTER_NAME"
    aws dsql create-cluster --region $AWS_REGION \
        --tags Name=$CLUSTER_NAME \
        --no-deletion-protection-enabled
fi