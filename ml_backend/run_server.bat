@echo off
echo ===================================================
echo Starting CaseMind AI - Forensic ML Backend Server
echo 3rd Semester Machine Learning Project Service
echo ===================================================
py -3 -m uvicorn app:app --port 8000 --reload
pause
