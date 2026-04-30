@echo off
setlocal enabledelayedexpansion
title Setup ONUS Fitness System - Final Fix

:: Xac dinh thu muc goc la noi chua file .bat nay
set "ROOT_DIR=%~dp0..\"
cd /d "%ROOT_DIR%"

echo ======================================================
echo   HE THONG ONUS FITNESS - SETUP (PATH FIXED)
echo ======================================================

:: --------------------------------------------------------
:: 1. THIET LAP BACKEND
:: --------------------------------------------------------
echo.
echo [1/2] Dang thiet lap Backend...


:: Tao moi truong ao .venv tai thu muc goc (de dung chung cho tien)
if not exist ".venv\Scripts\python.exe" (
    cd /d "%ROOT_DIR%"
    echo --- Dang tao moi truong ao .venv...
    if exist ".venv" rd /s /q ".venv"
    python -m venv .venv
    if errorlevel 1 (
        echo [LOI] Tao moi truong ao .venv that bai. Kiem tra Python da cai dat va duong dan hop le!
        pause
        exit /b
    )
)


:: Kiem tra file requirements.txt dung vi tri trong anh (backend\requirements.txt)
if exist "backend\requirements.txt" (
    echo --- Dang cai dat thu vien tu backend\requirements.txt...
    ".venv\Scripts\python.exe" -m pip install --upgrade pip
    if errorlevel 1 (
        echo [LOI] Cap nhat pip that bai!
        pause
        exit /b
    )
    ".venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
    if errorlevel 1 (
        echo [LOI] Cai dat thu vien tu requirements.txt that bai!
        pause
        exit /b
    )
) else (
    echo [LOI] Khong tim thay: %ROOT_DIR%backend\requirements.txt
    echo Vui long kiem tra lai ten file hoac thu muc!
    pause
    exit /b
)


:: Chay Migrate va Seed
if exist "backend\manage.py" (
    echo --- Dang thuc hien Migrate database...
    cd backend
    "..\.venv\Scripts\python.exe" manage.py migrate
    if errorlevel 1 (
        echo [LOI] Loi khi migrate database!
        cd ..
        pause
        exit /b
    )
    "..\.venv\Scripts\python.exe" manage.py seed_data
    if errorlevel 1 (
        echo [LOI] Loi khi seed database!
        cd ..
        pause
        exit /b
    )
    cd ..
)

:: --------------------------------------------------------
:: 2. THIET LAP FRONTEND
:: --------------------------------------------------------
echo.
echo [2/2] Dang thiet lap Frontend...

if exist "frontend\package.json" (
    cd frontend
    if not exist "node_modules" (
        echo --- Dang cai dat npm packages cho Frontend...
        call npm install
    ) else (
        echo --- Frontend da co node_modules, bo qua.
    )
    cd ..
) else (
    echo [CANH BAO] Khong tim thay thu muc frontend hoac package.json
)

:finish
echo.
echo ======================================================
echo   DA THIET LAP XONG! CHUC BAN CODE VUI VE.
echo ======================================================
pause