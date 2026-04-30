$workspace = Split-Path -Parent $PSScriptRoot
$publicIconsDir = Join-Path $workspace "public/icons"

$icon192Source = Join-Path $workspace "Assets/Icons/icon-192.png"
$icon512Source = Join-Path $workspace "Assets/Icons/icon-512.png"
$appleTouchSource = Join-Path $workspace "Assets/Icons/apple-touch-icon.png"

$icon192Destination = Join-Path $publicIconsDir "ck-leaf-icon-192-v4.png"
$icon512Destination = Join-Path $publicIconsDir "ck-leaf-icon-512-v4.png"
$appleTouchDestination = Join-Path $publicIconsDir "ck-leaf-apple-touch-icon-v4.png"

New-Item -ItemType Directory -Force -Path $publicIconsDir | Out-Null
Copy-Item -LiteralPath $icon192Source -Destination $icon192Destination -Force
Copy-Item -LiteralPath $icon512Source -Destination $icon512Destination -Force
Copy-Item -LiteralPath $appleTouchSource -Destination $appleTouchDestination -Force
