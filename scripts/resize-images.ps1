<#
  Generates the responsive JPEG sizes the site uses from the originals in
  assets/img/src/<name>.jpg. Run this after adding or replacing a photo.

  Usage (from the project root):
    powershell -ExecutionPolicy Bypass -File scripts/resize-images.ps1

  To add a new photo:
    1. Put the full-resolution file at assets/img/src/<name>.jpg
    2. Add an entry to $jobs below: "<name>" = @(<width1>, <width2>, ...)
    3. Re-run this script — it writes assets/img/<name>-<width>.jpg
    4. Reference assets/img/<name>-<width>.jpg in index.html (srcset/img)
#>

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$imgRoot = Join-Path $root "assets\img"
$src = Join-Path $imgRoot "src"
$out = $imgRoot

$jobs = @{
    "hero"                    = @(1600,1200,800)
    "about"                   = @(900,600)
    "materiais-humidade"      = @(700,480)
    "gallery-teto-01"         = @(1200,700)
    "gallery-teto-02"         = @(1200,700)
    "gallery-parede-01"       = @(1200,700)
    "gallery-parede-02"       = @(1200,700)
    "gallery-iluminacao-01"   = @(1200,700)
    "gallery-detalhe-01"      = @(1200,700)
    "gallery-detalhe-02"      = @(1200,700)
    "gallery-detalhe-03"      = @(1200,700)
    "gallery-acabamento-01"   = @(1200,700)
    "gallery-acabamento-02"   = @(1200,700)
    "gallery-acabamento-03"   = @(1200,700)
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)

function Get-OrientedImage($path) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $img = [System.Drawing.Image]::FromStream($ms)
    if ($img.PropertyIdList -contains 274) {
        $orientation = $img.GetPropertyItem(274).Value[0]
        switch ($orientation) {
            2 { $img.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
            3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
            4 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
            5 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
            6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
            7 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
            8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
        }
    }
    return $img
}

foreach ($name in $jobs.Keys) {
    $srcPath = Join-Path $src ($name + ".jpg")
    if (-not (Test-Path $srcPath)) {
        Write-Host "MISSING $srcPath"
        continue
    }
    $img = Get-OrientedImage $srcPath
    $origW = $img.Width
    $origH = $img.Height

    foreach ($w in $jobs[$name]) {
        $targetW = [Math]::Min($w, $origW)
        $targetH = [Math]::Round($origH * ($targetW / $origW))

        $bmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
        $bmp.SetResolution($img.HorizontalResolution, $img.VerticalResolution)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($img, 0, 0, $targetW, $targetH)
        $g.Dispose()

        $outPath = Join-Path $out ("$name-$targetW.jpg")
        $qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 68L)
        $encParams.Param[0] = $qualityParam
        $bmp.Save($outPath, $jpegCodec, $encParams)
        $bmp.Dispose()
        $sizeKb = [Math]::Round((Get-Item $outPath).Length / 1KB)
        Write-Host "$name -> ${targetW}px ($sizeKb KB)"
    }
    $img.Dispose()
}

Write-Host "DONE"
