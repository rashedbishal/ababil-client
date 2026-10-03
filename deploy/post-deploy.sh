#!/usr/bin/env bash
# Runs on the Hostinger server, over SSH, after each rsync deploy.
# Keep this idempotent - it runs on every deploy, not just the first one.
set -euo pipefail

cd "$(dirname "$0")/.."

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart

if [ ! -L public/storage ]; then
    php artisan storage:link
fi
