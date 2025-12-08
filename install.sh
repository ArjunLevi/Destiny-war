#!/bin/bash
# Clean installation script for Windows/Mac/Linux

echo "Cleaning up old dependencies..."
rm -rf node_modules
rm -f package-lock.json

echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "Installation complete!"
