@echo off
chcp 65001
rem 日本語です

call npm run build

if "%~1"=="" pause
