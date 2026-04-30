Add-Type -AssemblyName System.Drawing

$workspace = Split-Path -Parent $PSScriptRoot
$publicIconsDir = Join-Path $workspace "public/icons"
$sourcePath = Join-Path $workspace "Assets/Icons/ck-grow-favicon.png"

$targets = @(
  @{ Size = 512; Name = "ck-grow-icon-512-v1.png" },
  @{ Size = 192; Name = "ck-grow-icon-192-v1.png" },
  @{ Size = 180; Name = "ck-grow-apple-touch-v1.png" },
  @{ Size = 32; Name = "favicon-32x32-v1.png" },
  @{ Size = 16; Name = "favicon-16x16-v1.png" }
)

New-Item -ItemType Directory -Force -Path $publicIconsDir | Out-Null

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

      $destinationPath = Join-Path $publicIconsDir $target.Name
      $bitmap.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
      $bitmap.Dispose()
    }
  }
} finally {
  $sourceImage.Dispose()
}
