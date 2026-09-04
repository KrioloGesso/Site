param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [int]$Port = 8124
)

Add-Type -AssemblyName System.Net.HttpListener -ErrorAction SilentlyContinue

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root on http://localhost:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".png"  = "image/png"
  ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
  } catch {
    break
  }
  $request = $context.Request
  $response = $context.Response

  $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
  if ($path -eq "/") { $path = "/index.html" }
  $filePath = Join-Path $Root ($path.TrimStart("/") -replace "/", "\")

  if (Test-Path $filePath -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    $contentType = $mime[$ext]
    if (-not $contentType) { $contentType = "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $response.ContentType = $contentType
    $response.ContentLength64 = $bytes.Length
    $response.StatusCode = 200
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $response.StatusCode = 404
    $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $path")
    $response.ContentLength64 = $notFound.Length
    $response.OutputStream.Write($notFound, 0, $notFound.Length)
  }
  $response.OutputStream.Close()
}
