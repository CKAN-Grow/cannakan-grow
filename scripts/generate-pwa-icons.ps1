Add-Type -AssemblyName System.Drawing

$workspace = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $workspace "Assets/Cannakan-growapp-favicon.png"
$icon192Path = Join-Path $workspace "pwa-icon-192.png"
$icon512Path = Join-Path $workspace "pwa-icon-512.png"
$appleTouchIconPath = Join-Path $workspace "apple-touch-icon.png"

function New-RoundedRectPath {
  param(
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-ResizedBitmap {
  param(
    [System.Drawing.Image]$Source,
    [int]$Size
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.Clear([System.Drawing.Color]::FromArgb(16, 20, 15))
  $graphics.DrawImage($Source, 0, 0, $Size, $Size)
  $graphics.Dispose()
  return $bitmap
}

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)
$masterSize = 1024
$master = New-Object System.Drawing.Bitmap $masterSize, $masterSize
$graphics = [System.Drawing.Graphics]::FromImage($master)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.Clear([System.Drawing.Color]::FromArgb(16, 20, 15))

$cardInset = 58
$cardRadius = 232
$cardWidth = [single]($masterSize - ($cardInset * 2))
$cardHeight = [single]($masterSize - ($cardInset * 2))
$cardRect = New-Object System.Drawing.RectangleF ([single]$cardInset), ([single]$cardInset), $cardWidth, $cardHeight
$cardPath = New-RoundedRectPath -X $cardRect.X -Y $cardRect.Y -Width $cardRect.Width -Height $cardRect.Height -Radius $cardRadius

$cardGradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.PointF(0, $cardRect.Y)),
  (New-Object System.Drawing.PointF(0, $cardRect.Bottom)),
  ([System.Drawing.Color]::FromArgb(24, 30, 24)),
  ([System.Drawing.Color]::FromArgb(16, 20, 15))
)
$graphics.FillPath($cardGradient, $cardPath)

$innerGlowRect = New-Object System.Drawing.RectangleF(132, 120, 760, 760)
$glowColor = [System.Drawing.Color]::FromArgb(38, 148, 209, 89)
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowPath.AddEllipse($innerGlowRect)
$glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$glowBrush.CenterColor = $glowColor
$glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 148, 209, 89))
$graphics.FillEllipse($glowBrush, $innerGlowRect)

$cardStroke = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(72, 148, 209, 89), 8)
$graphics.DrawPath($cardStroke, $cardPath)

$highlightPath = New-RoundedRectPath -X ($cardRect.X + 18) -Y ($cardRect.Y + 18) -Width ($cardRect.Width - 36) -Height ($cardRect.Height - 36) -Radius 208
$highlightPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(24, 255, 255, 255), 3)
$graphics.DrawPath($highlightPen, $highlightPath)

$iconBox = 680
$iconX = [int](($masterSize - $iconBox) / 2)
$iconY = [int](($masterSize - $iconBox) / 2) + 10
$graphics.DrawImage($sourceImage, $iconX, $iconY, $iconBox, $iconBox)

$master.Save($icon512Path, [System.Drawing.Imaging.ImageFormat]::Png)
$icon192 = New-ResizedBitmap -Source $master -Size 192
$icon192.Save($icon192Path, [System.Drawing.Imaging.ImageFormat]::Png)
$appleTouchIcon = New-ResizedBitmap -Source $master -Size 180
$appleTouchIcon.Save($appleTouchIconPath, [System.Drawing.Imaging.ImageFormat]::Png)

$icon192.Dispose()
$appleTouchIcon.Dispose()
$cardGradient.Dispose()
$glowBrush.Dispose()
$glowPath.Dispose()
$cardStroke.Dispose()
$highlightPen.Dispose()
$cardPath.Dispose()
$highlightPath.Dispose()
$graphics.Dispose()
$master.Dispose()
$sourceImage.Dispose()
