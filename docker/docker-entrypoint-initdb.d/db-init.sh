# ------------------------------------------------------------------------
# Creates the examples database and respective user. This database location
# and access credentials are defined on the environment variables
# ------------------------------------------------------------------------
set -e

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" <<-EOSQL
  CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';
  CREATE DATABASE ${POSTGRES_DB};
  GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
EOSQL

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" -d "${POSTGRES_DB}" <<-EOSQL
   GRANT ALL ON SCHEMA public TO ${POSTGRES_USER};
EOSQL
