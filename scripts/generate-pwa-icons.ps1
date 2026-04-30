Add-Type -AssemblyName System.Drawing

$workspace = Split-Path -Parent $PSScriptRoot
$outputDir = $workspace
$sourcePath = Join-Path $workspace "Assets/Icons/ck-grow-favicon.png"

$targets = @(
  @{ Size = 512; Name = "icon-512.png" },
  @{ Size = 192; Name = "icon-192.png" },
  @{ Size = 180; Name = "apple-touch-icon.png" },
  @{ Size = 32; Name = "favicon-32x32.png" },
  @{ Size = 16; Name = "favicon-16x16.png" }
)

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
try {
  foreach ($target in $targets) {
    $bitmap = New-Object System.Drawing.Bitmap $target.Size, $target.Size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage($sourceImage, 0, 0, $target.Size, $target.Size)

      $destinationPath = Join-Path $outputDir $target.Name
      $bitmap.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  }

  Copy-Item (Join-Path $outputDir "icon-512.png") (Join-Path $outputDir "icon-maskable-512.png") -Force
  Copy-Item (Join-Path $outputDir "favicon-32x32.png") (Join-Path $outputDir "favicon.ico") -Force
} finally {
  $sourceImage.Dispose()
}
