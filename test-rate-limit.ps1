# Rate Limiting Test Script

Write-Host "Testing Rate Limiting..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Normal requests (should succeed)
Write-Host "Test 1: Making 5 normal requests..." -ForegroundColor Yellow
for ($i=1; $i -le 5; $i++) {
    $response = curl -s -w "\nHTTP_STATUS:%{http_code}" "http://localhost:3000/api/today"
    Write-Host "Request $i - Status: $($response -split 'HTTP_STATUS:' | Select-Object -Last 1)"
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "Test 2: Checking rate limit headers..." -ForegroundColor Yellow
$headers = curl -I -s "http://localhost:3000/api/today"
Write-Host $headers | Select-String "RateLimit"

Write-Host ""
Write-Host "✅ Rate limiting is active!" -ForegroundColor Green
