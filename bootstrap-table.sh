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
fi

TAG_NAME='awsfundamentals'

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
    if [ "$NAME" == "$TAG_NAME" ]; then
        CLUSTER_EXISTS=true
        echo "Cluster with name $TAG_NAME already exists: $CLUSTER_IDENTIFIER"
        # write the cluster identifier to the .env file if it doesn't exist yet
        if ! grep -q "CLUSTER_IDENTIFIER" .env; then
            echo "CLUSTER_IDENTIFIER=$CLUSTER_IDENTIFIER" >> "${SCRIPT_DIR}/.env"
        fi
    fi
done <<< "$CLUSTERS"

if [ "$CLUSTER_EXISTS" = false ]; then
    echo "Creating cluster with name $TAG_NAME"
    aws dsql create-cluster --region $AWS_REGION \
        --tags Name=$TAG_NAME \
        --no-deletion-protection-enabled
fi