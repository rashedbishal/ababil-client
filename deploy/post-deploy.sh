#!/usr/bin/env bash
# Runs on the Hostinger server, over SSH, after each rsync deploy.
# Keep this idempotent - it runs on every deploy, not just the first one.
set -euo pipefail

cd "$(dirname "$0")/.."

# Composer runs on the CI runner, not here, so it can't catch a PHP extension
# missing on the server. Money math needs bcmath (app/Support/Decimal.php);
# without it the storefront and checkout 500. Fail the deploy loudly instead.
for ext in bcmath mbstring pdo_mysql; do
    if ! php -r "exit(extension_loaded('$ext') ? 0 : 1);"; then
        echo "ERROR: PHP extension '$ext' is not enabled on this server - enable it in Hostinger hPanel (Advanced -> PHP Configuration -> PHP extensions)." >&2
        exit 1
    fi
done

php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart

if [ ! -L public/storage ]; then
    php artisan storage:link
fi
