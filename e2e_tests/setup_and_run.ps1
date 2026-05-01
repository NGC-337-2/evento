# setup_and_run.ps1
Write-Host "Setting up Python Virtual Environment..." -ForegroundColor Green
python -m venv venv

Write-Host "Activating venv and installing requirements..." -ForegroundColor Green
# Activate the venv and run pip in a new process to ensure path is correct
& .\venv\Scripts\python.exe -m pip install --upgrade pip
& .\venv\Scripts\python.exe -m pip install -r requirements.txt

Write-Host "Starting tests with pytest..." -ForegroundColor Green
& .\venv\Scripts\pytest.exe test_app.py -v -s

Write-Host "Tests completed." -ForegroundColor Green
