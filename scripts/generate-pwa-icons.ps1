Add-Type -AssemblyName System.Drawing

$workspace = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $workspace "Assets/Icons/icon-512.png"
$icon192Path = Join-Path $workspace "public/icons/icon-192-v3.png"
$icon512Path = Join-Path $workspace "public/icons/icon-512-v3.png"
$appleTouchIconPath = Join-Path $workspace "public/icons/apple-touch-icon-v3.png"

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

function New-LeafPath {
  param(
    [float]$BaseX,
    [float]$BaseY,
    [float]$TipX,
    [float]$TipY,
    [float]$InnerControlX,
    [float]$InnerControlY,
    [float]$OuterControlX,
    [float]$OuterControlY
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.StartFigure()
  $path.AddBezier(
    $BaseX, $BaseY,
    $BaseX, ($BaseY - 36),
    $OuterControlX, $OuterControlY,
    $TipX, $TipY
  )
  $path.AddBezier(
    $TipX, $TipY,
    $InnerControlX, $InnerControlY,
    ($BaseX + (($TipX - $BaseX) * 0.12)), ($BaseY - 86),
    $BaseX, $BaseY
  )
  $path.CloseFigure()
  return $path
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

$iconBox = 666
$iconX = [int](($masterSize - $iconBox) / 2)
$iconY = 160
$graphics.DrawImage($sourceImage, $iconX, $iconY, $iconBox, $iconBox)

$leafShadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(120, 7, 10, 8))
$leafEdgePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 18, 28, 18), 4)
$leafVeinPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(150, 20, 30, 18), 5)
$leafVeinPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$leafVeinPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

$leftLeaf = New-LeafPath -BaseX 445 -BaseY 742 -TipX 242 -TipY 545 -InnerControlX 328 -InnerControlY 548 -OuterControlX 218 -OuterControlY 628
$rightLeaf = New-LeafPath -BaseX 579 -BaseY 742 -TipX 782 -TipY 550 -InnerControlX 695 -InnerControlY 552 -OuterControlX 808 -OuterControlY 635

$centerLeaf = New-LeafPath -BaseX 512 -BaseY 742 -TipX 512 -TipY 590 -InnerControlX 560 -InnerControlY 640 -OuterControlX 462 -OuterControlY 640

$leafGradientLeft = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.PointF(242, 545)),
  (New-Object System.Drawing.PointF(445, 742)),
  ([System.Drawing.Color]::FromArgb(190, 236, 255, 96)),
  ([System.Drawing.Color]::FromArgb(190, 120, 184, 38))
)
$leafGradientRight = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.PointF(782, 550)),
  (New-Object System.Drawing.PointF(579, 742)),
  ([System.Drawing.Color]::FromArgb(190, 236, 255, 96)),
  ([System.Drawing.Color]::FromArgb(190, 120, 184, 38))
)
$leafGradientCenter = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.PointF(512, 590)),
  (New-Object System.Drawing.PointF(512, 742)),
  ([System.Drawing.Color]::FromArgb(160, 217, 247, 88)),
  ([System.Drawing.Color]::FromArgb(160, 95, 146, 34))
)

$graphics.TranslateTransform(0, 8)
$graphics.FillPath($leafShadowBrush, $centerLeaf)
$graphics.FillPath($leafShadowBrush, $leftLeaf)
$graphics.FillPath($leafShadowBrush, $rightLeaf)
$graphics.ResetTransform()

$graphics.FillPath($leafGradientCenter, $centerLeaf)
$graphics.FillPath($leafGradientLeft, $leftLeaf)
$graphics.FillPath($leafGradientRight, $rightLeaf)

$graphics.DrawPath($leafEdgePen, $centerLeaf)
$graphics.DrawPath($leafEdgePen, $leftLeaf)
$graphics.DrawPath($leafEdgePen, $rightLeaf)

$graphics.DrawCurve($leafVeinPen, @(
  (New-Object System.Drawing.PointF(448, 738)),
  (New-Object System.Drawing.PointF(404, 688)),
  (New-Object System.Drawing.PointF(352, 632)),
  (New-Object System.Drawing.PointF(296, 586))
))
$graphics.DrawCurve($leafVeinPen, @(
  (New-Object System.Drawing.PointF(576, 738)),
  (New-Object System.Drawing.PointF(620, 690)),
  (New-Object System.Drawing.PointF(674, 635)),
  (New-Object System.Drawing.PointF(728, 590))
))
$graphics.DrawCurve($leafVeinPen, @(
  (New-Object System.Drawing.PointF(512, 742)),
  (New-Object System.Drawing.PointF(512, 700)),
  (New-Object System.Drawing.PointF(512, 652)),
  (New-Object System.Drawing.PointF(512, 606))
))

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
$leafShadowBrush.Dispose()
$leafEdgePen.Dispose()
$leafVeinPen.Dispose()
$leafGradientLeft.Dispose()
$leafGradientRight.Dispose()
$leafGradientCenter.Dispose()
$leftLeaf.Dispose()
$rightLeaf.Dispose()
$centerLeaf.Dispose()
$cardStroke.Dispose()
$highlightPen.Dispose()
$cardPath.Dispose()
$highlightPath.Dispose()
$graphics.Dispose()
$master.Dispose()
$sourceImage.Dispose()
