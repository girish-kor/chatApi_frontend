# chatapi-tests.ps1
# PowerShell script to test chatapi.miniproject.in endpoints sequentially.
# Run with pwsh: pwsh -File .\chatapi-tests.ps1

$base = 'https://chatapi.miniproject.in'
Write-Host "Base URL: $base`n"

function Pretty($obj) {
    if ($null -eq $obj) { return }
    $obj | ConvertTo-Json -Depth 10
}

# 1) GET /api/auth/me without header
Write-Host "1) GET /api/auth/me (no header)"
try {
    $res = Invoke-RestMethod -Uri "$base/api/auth/me" -Method Get -ErrorAction Stop
    Write-Host (Pretty $res)
} catch {
    Write-Host "Error:" $_.Exception.Message
}
Write-Host "`n"

# 2) POST /api/users (create user)
Write-Host "2) POST /api/users (create user)"
$userName = "ps_test_user_$([Guid]::NewGuid().ToString().Substring(0,8))"
$body = @{ username = $userName } | ConvertTo-Json
try {
    $create = Invoke-RestMethod -Uri "$base/api/users" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
    Write-Host "Created user:"
    Write-Host (Pretty $create)
    $userId = $create.id
} catch {
    Write-Host "Error creating user:" $_.Exception.Message
    if ($_.Exception.Response) { $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host $sr.ReadToEnd() }
    exit 1
}
Write-Host "`n"

# 3) POST /api/matchmaking/join
Write-Host "3) POST /api/matchmaking/join (join matchmaking)"
$body = @{ userId = $userId } | ConvertTo-Json
try {
    $joinRes = Invoke-RestMethod -Uri "$base/api/matchmaking/join" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
    Write-Host (Pretty $joinRes)
} catch {
    Write-Host "Error joining matchmaking:" $_.Exception.Message
    if ($_.Exception.Response) { $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host $sr.ReadToEnd() }
}
Write-Host "`n"

# 4) GET /api/matchmaking/status/{userId} (poll a few times)
Write-Host "4) GET /api/matchmaking/status/{userId} (poll up to 10 times)"
$matchedRoom = $null
for ($i=0; $i -lt 10; $i++) {
    try {
        $status = Invoke-RestMethod -Uri "$base/api/matchmaking/status/$userId" -Method Get -ErrorAction Stop
        Write-Host "Attempt $($i+1):" (Pretty $status)
        if ($status.status -eq 'MATCHED' -and $status.roomId) { $matchedRoom = $status.roomId; break }
    } catch {
        Write-Host "Error checking status:" $_.Exception.Message
        if ($_.Exception.Response) { $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host $sr.ReadToEnd() }
        break
    }
    Start-Sleep -Seconds 2
}
Write-Host "Matched room: $matchedRoom`n"

# 5) If matched, POST /api/chat/{roomId}/send
if ($matchedRoom) {
    Write-Host "5) POST /api/chat/{roomId}/send (send message)"
    $msgBody = @{ senderId = $userId; content = "Hello from PowerShell test at $(Get-Date -Format o)" } | ConvertTo-Json
    try {
        $sendRes = Invoke-RestMethod -Uri "$base/api/chat/$matchedRoom/send" -Method Post -Body $msgBody -ContentType 'application/json' -ErrorAction Stop
        Write-Host (Pretty $sendRes)
    } catch {
        Write-Host "Error sending message:" $_.Exception.Message
        if ($_.Exception.Response) { $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host $sr.ReadToEnd() }
    }
    Write-Host "`n"

    # 6) GET /api/chat/{roomId}
    Write-Host "6) GET /api/chat/{roomId} (fetch room)"
    try {
        $room = Invoke-RestMethod -Uri "$base/api/chat/$matchedRoom" -Method Get -ErrorAction Stop
        Write-Host (Pretty $room)
    } catch {
        Write-Host "Error fetching chat room:" $_.Exception.Message
        if ($_.Exception.Response) { $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host $sr.ReadToEnd() }
    }
} else {
    Write-Host "No matched room found after polling. Skipping chat send and fetch tests.`n"
}

Write-Host "Tests complete."
