# Petit serveur local, le temps de développer.
# Lancer :  powershell -ExecutionPolicy Bypass -File serveur.ps1
# Puis ouvrir http://localhost:8080 dans le navigateur. Ctrl+C pour arrêter.
#
# Il sert juste les fichiers du dossier. Il ne sert à rien en production :
# là, ce sera GitHub Pages ou un autre hébergeur statique.

$port = 8080
$racine = $PSScriptRoot

$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.png'  = 'image/png'
  '.ico'  = 'image/x-icon'
}

$ecouteur = New-Object System.Net.HttpListener
$ecouteur.Prefixes.Add("http://localhost:$port/")
try {
  $ecouteur.Start()
} catch {
  Write-Host "Impossible d'ouvrir le port $port. Il est peut-etre deja utilise." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "  Mediator tourne sur http://localhost:$port" -ForegroundColor Green
Write-Host "  Ctrl+C pour arreter."
Write-Host ""

while ($ecouteur.IsListening) {
  try {
    $contexte = $ecouteur.GetContext()
  } catch {
    break
  }
  $chemin = [System.Uri]::UnescapeDataString($contexte.Request.Url.AbsolutePath)
  if ($chemin -eq '/' ) { $chemin = '/index.html' }

  $fichier = Join-Path $racine ($chemin -replace '^/', '' -replace '/', '\')

  # On ne sort pas du dossier servi.
  $complet = [System.IO.Path]::GetFullPath($fichier)
  if (-not $complet.StartsWith([System.IO.Path]::GetFullPath($racine))) {
    $contexte.Response.StatusCode = 403
    $contexte.Response.Close()
    continue
  }

  if (Test-Path $complet -PathType Leaf) {
    $octets = [System.IO.File]::ReadAllBytes($complet)
    $ext = [System.IO.Path]::GetExtension($complet).ToLower()
    $contexte.Response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
    $contexte.Response.Headers.Add('Cache-Control', 'no-store')
    $contexte.Response.ContentLength64 = $octets.Length
    $contexte.Response.OutputStream.Write($octets, 0, $octets.Length)
    Write-Host ("200  " + $chemin)
  } else {
    $contexte.Response.StatusCode = 404
    Write-Host ("404  " + $chemin) -ForegroundColor DarkYellow
  }
  $contexte.Response.Close()
}

$ecouteur.Stop()
