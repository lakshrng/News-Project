Write-Host "🚀 Setting up News Project Admin User..." -ForegroundColor Green

# Start server in background
Write-Host "Starting server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location "G:\Development\new\News-Project\server"
    npm run dev
}

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Try to create admin user
Write-Host "Creating admin user..." -ForegroundColor Yellow
Set-Location "G:\Development\new\News-Project"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/create-admin" -Method POST -ContentType "application/json" -Body '{"username": "admin", "email": "admin@example.com", "password": "admin123"}'
    Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
    Write-Host "📧 Email: admin@example.com" -ForegroundColor Cyan
    Write-Host "🔑 Password: admin123" -ForegroundColor Cyan
    Write-Host "🎫 Token: $($response.token)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to create admin user. Server might not be ready yet." -ForegroundColor Red
    Write-Host "Please try running: node create-admin.js" -ForegroundColor Yellow
}

# Stop the server job
Stop-Job $serverJob
Remove-Job $serverJob

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "Access the application at:" -ForegroundColor Cyan
Write-Host "- Public News: http://localhost:5173" -ForegroundColor White
Write-Host "- Admin Login: http://localhost:5173/admin/login" -ForegroundColor White
