@echo off
setlocal enabledelayedexpansion
title Setup ONUS Fitness System - Bulletproof Venv

:: Xac dinh thu muc goc (Root)
set "ROOT_DIR=%~dp0.."
cd /d "%ROOT_DIR%"

echo ======================================================
echo   HE THONG ONUS FITNESS - SETUP (ABSOLUTE PATH)
echo ======================================================

:: --------------------------------------------------------
:: 1. THIET LAP BACKEND
:: --------------------------------------------------------
echo.
echo [1/2] Dang thiet lap Backend...

:: Tao thu muc media
if not exist "backend\media" mkdir "backend\media"

:: Tao moi truong ao neu chua co
if not exist ".venv" (
    echo --- Dang tao moi truong ao .venv...
    python -m venv .venv
)

:: Cai dat thu vien BĂNG DUONG DAN TUYET DOI (Khong can activate)
echo --- Dang tai thu vien Python vao dung .venv...
"%ROOT_DIR%\.venv\Scripts\python.exe" -m pip install --upgrade pip

if exist "backend\requirements.txt" (
    "%ROOT_DIR%\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
) else (
    echo [LOI] Khong tim thay backend\requirements.txt
)

:: Migrate va Seed bang Python cua venv
cd backend
echo --- Dang migrate database...
"%ROOT_DIR%\.venv\Scripts\python.exe" manage.py migrate
echo --- Dang nap du lieu mau (Seed Data)...
"%ROOT_DIR%\.venv\Scripts\python.exe" manage.py seed_data
cd ..

:: --------------------------------------------------------
:: 2. THIET LAP FRONTEND
:: --------------------------------------------------------
echo.
echo [2/2] Dang thiet lap Frontend...

if not exist "frontend" goto no_frontend

cd frontend
echo --- Dang vao thu muc frontend...

if exist "node_modules" goto skip_npm

echo --- Dang tai thu vien npm (node_modules)...
call npm install
goto fe_done

:skip_npm
echo --- node_modules da ton tai, bo qua npm install.

:fe_done
cd ..
goto finish

:no_frontend
echo [LOI] Khong tim thay thu muc frontend!

:: --------------------------------------------------------
:: 3. HOAN TAT
:: --------------------------------------------------------
:finish
echo.
echo ======================================================
echo   DA THIET LAP XONG!
echo ======================================================
pause