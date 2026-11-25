# Servidor Web Estático Local (PowerShell)
# Executa sem depender de Node.js, Python ou qualquer outro runtime externo!

$port = 8080
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " NutriFit Pro - Webapp de Dieta & Projeção em Execução!" -ForegroundColor Cyan
    Write-Host " No Computador: $prefix" -ForegroundColor Yellow

    $localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*', 'Ethernet*' -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1).IPAddress
    if ($localIP) {
        Write-Host " No Celular (conectado ao mesmo Wi-Fi): http://${localIP}:$port/" -ForegroundColor Yellow
    }

    Write-Host " Pressione Ctrl+C para encerrar o servidor." -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Green
    
    # Abre o navegador automaticamente
    Start-Process $prefix

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/" -or $localPath -eq "") {
            $localPath = "/index.html"
        }

        $filePath = Join-Path $PSScriptRoot ($localPath.TrimStart("/").Replace("/", "\"))

        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($extension) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".webmanifest" { "application/manifest+json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                Default { "application/octet-stream" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Arquivo não encontrado")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }

        $response.OutputStream.Close()
    }
}
finally {
    $listener.Stop()
}
