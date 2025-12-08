@echo off
REM Clean installation script for Windows

echo Cleaning up old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json

echo Installing dependencies with legacy peer deps...
npm install --legacy-peer-deps

echo Installation complete!
