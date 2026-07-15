$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 5500)
$listener.Start()

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".svg" { return "image/svg+xml" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".webp" { return "image/webp" }
    ".json" { return "application/json; charset=utf-8" }
    default { return "application/octet-stream" }
  }
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }

      while (($line = $reader.ReadLine()) -ne "") {
        if ($null -eq $line) { break }
      }

      $requestTarget = ($requestLine -split " ")[1]
      $requestUri = [System.Uri]::new([System.Uri]"http://127.0.0.1", $requestTarget)
      $path = $requestUri.AbsolutePath
      if ([string]::IsNullOrWhiteSpace($path) -or $path -eq "/") {
        $path = "/index.html"
      }

      if ($path.StartsWith("/api/")) {
        $bodyText = "This local-server.ps1 helper serves static files only. CSTP admin browser QA requires an API-capable local runtime so protected /api/cstp-admin-* routes can authorize against local Supabase."
        $body = [System.Text.Encoding]::UTF8.GetBytes($bodyText)
        $headers = "HTTP/1.1 501 Not Implemented`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
        continue
      }

      $relativePath = [System.Uri]::UnescapeDataString($path.TrimStart("/")).Replace("/", "\")
      $filePath = Join-Path $root $relativePath
      $publicFilePath = Join-Path (Join-Path $root "public") $relativePath
      $resolvedFilePath = $null

      if ((Test-Path $filePath) -and -not (Get-Item $filePath).PSIsContainer) {
        $resolvedFilePath = $filePath
      } elseif ((Test-Path $publicFilePath) -and -not (Get-Item $publicFilePath).PSIsContainer) {
        $resolvedFilePath = $publicFilePath
      }

      if ($resolvedFilePath) {
        $bytes = [System.IO.File]::ReadAllBytes($resolvedFilePath)
        $headers = "HTTP/1.1 200 OK`r`nContent-Type: $(Get-ContentType $resolvedFilePath)`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($bytes, 0, $bytes.Length)
      } else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        $headers = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
      }
    } finally {
      if ($stream) { $stream.Dispose() }
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
