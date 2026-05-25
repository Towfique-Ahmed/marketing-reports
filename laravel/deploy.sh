#!/bin/bash
# xCloud Deployment Script for Marketing Insights Board
# Paste this into xCloud's "Deployment Script" field when setting up the site.

set -e

echo "==> Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Generating app key (skips if already set)..."
php artisan key:generate --force

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Caching config, routes and views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Setting storage permissions..."
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

echo "==> Installing Node dependencies and building assets..."
npm ci --prefer-offline
npm run build

echo "==> Deployment complete!"
