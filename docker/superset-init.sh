#!/bin/bash

# Initialize the database
echo  "1" "Starting" "Applying DB migrations"
superset db upgrade
echo  "1" "Complete" "Applying DB migrations"

# Create Admin user, you can read these values from env or anywhere else possible
superset fab create-admin --username "$ADMIN_USERNAME" --firstname Superset --lastname Admin --email "$ADMIN_EMAIL" --password "$ADMIN_PASSWORD"

superset init

cd shillelagh
pip install --upgrade --no-deps --force-reinstall .
# Start the service
/bin/sh -c /usr/bin/run-server.sh
# superset run -h 0.0.0.0 -p 8088 --with-threads --reload --debugger