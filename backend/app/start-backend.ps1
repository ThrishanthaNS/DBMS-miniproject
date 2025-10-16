# start-backend.ps1 - Creates venv, installs requirements, and starts uvicorn
param(
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $here

if (-not (Test-Path .\venv)) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Activating virtual environment..."
. .\venv\Scripts\Activate

Write-Host "Upgrading pip and installing requirements..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Write-Host "Starting uvicorn on port $Port..."
uvicorn app.main:app --reload --host 127.0.0.1 --port $Port
