@echo off
:: Lui ra thu muc goc (ONUS_Fitness_System) tu thu muc workspace
cd /d "%~dp0.."
set "PROJECT_ROOT=%cd%"

:: Dung Windows Terminal (wt) de mo 1 cua so duy nhat voi 2 tab
wt --title "ONUS Backend" -d "%PROJECT_ROOT%" cmd /k "call .venv\Scripts\activate && cd backend && python manage.py runserver" ; new-tab --title "ONUS Frontend" -d "%PROJECT_ROOT%\frontend" cmd /k "npm run dev"