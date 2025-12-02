#!/bin/bash

# Script to run Django migrations for document_control app

echo "Creating migrations for document_control app..."

cd "$(dirname "$0")"

# Activate virtual environment if exists
if [ -d "env/bin" ]; then
    source env/bin/activate
fi

# Create migrations for master app (Description model)
echo "Creating migrations for master app..."
python manage.py makemigrations master

# Create migrations for document_control app
echo "Creating migrations for document_control app..."
python manage.py makemigrations document_control

# Run migrations
echo "Running migrations..."
python manage.py migrate

echo "✅ Migrations completed!"
