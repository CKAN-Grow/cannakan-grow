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

      $path = ($requestLine -split " ")[1]
      if ([string]::IsNullOrWhiteSpace($path) -or $path -eq "/") {
        $path = "/index.html"
      }

      $relativePath = [System.Uri]::UnescapeDataString($path.TrimStart("/")).Replace("/", "\")
      $filePath = Join-Path $root $relativePath

      if ((Test-Path $filePath) -and -not (Get-Item $filePath).PSIsContainer) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $headers = "HTTP/1.1 200 OK`r`nContent-Type: $(Get-ContentType $filePath)`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
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
