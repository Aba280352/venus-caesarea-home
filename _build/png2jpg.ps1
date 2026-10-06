# Converts every assets\shop\*.src.png (downloaded as-is from the store) into a resized JPEG (max 900px, quality 85).
param([string]$Dir)
Add-Type -AssemblyName System.Drawing
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
Get-ChildItem -Path $Dir -Filter '*.src.png' | ForEach-Object {
  $src = [System.Drawing.Image]::FromFile($_.FullName)
  try {
    $scale = [Math]::Min(1.0, 900.0 / [Math]::Max($src.Width, $src.Height))
    $w = [int]($src.Width * $scale); $h = [int]($src.Height * $scale)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $w, $h)
    $g.Dispose()
    $out = $_.FullName -replace '\.src\.png$', '.jpg'
    $bmp.Save($out, $enc, $params)
    $bmp.Dispose()
  } finally { $src.Dispose() }
  Remove-Item $_.FullName
}
