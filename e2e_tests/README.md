# End-to-End Testing with Selenium and Pytest

This folder contains automated browser tests for the EventO application using Python, Selenium, and Pytest.

## Prerequisites
- Python 3.8+ installed on your system.
- Google Chrome browser installed.

## Setup Instructions (Windows)

1. **Open PowerShell** and navigate to this folder:
   ```powershell
   cd d:\Project\event-platform\e2e_tests
   ```

2. **Create a virtual environment**:
   ```powershell
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   *(If you get an execution policy error, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` first)*

4. **Install the dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

## Running the Tests

Ensure your frontend and backend servers are running first (Vite on port 5173).

To run the complete test suite:
```powershell
pytest test_app.py -v
```

If you want to see the browser running, leave the options as they are. To run tests in the background (headless mode), open `test_app.py` and uncomment the `options.add_argument('--headless')` line.

## What is tested?
1. The homepage loads successfully.
2. A new user is automatically registered.
3. The explore events page is searchable.
4. The user profile is updated successfully.
5. The user logs out.
