#!/bin/bash
set -e

# Update pg_hba.conf to allow all connections with password
echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf

# Reload PostgreSQL configuration
pg_ctl reload
