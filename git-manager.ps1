# Git Branch Management Script for Windows PowerShell
# Handles pull from default branch and push with structured branch naming

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("pull", "push")]
    [string]$Action
)

# ---------- Guard rails ----------
# Check time range restriction (12:01 AM to 7:01 AM)
$currentTime = Get-Date
$currentHour = $currentTime.Hour
$currentMinute = $currentTime.Minute

$isInValidTimeRange = $false
if ($currentHour -eq 0 -and $currentMinute -ge 1) {
    # 12:01 AM to 12:59 AM
    $isInValidTimeRange = $true
} elseif ($currentHour -ge 1 -and $currentHour -le 6) {
    # 1:00 AM to 6:59 AM
    $isInValidTimeRange = $true
} elseif ($currentHour -eq 7 -and $currentMinute -le 1) {
    # 7:00 AM to 7:01 AM
    $isInValidTimeRange = $true
}

if (-not $isInValidTimeRange) {
    Write-Host "ERROR: This script can only be executed between 12:01 AM and 7:01 AM." -ForegroundColor Red
    Write-Host "Current time: $($currentTime.ToString('HH:mm'))" -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed or not on PATH." -ForegroundColor Red
    exit 1
}

# ---------- Utilities ----------
function Show-Menu {
    param(
        [string]$Title,
        [string[]]$Options
    )
    Write-Host ""
    Write-Host $Title -ForegroundColor Cyan
    Write-Host ("=" * $Title.Length) -ForegroundColor Cyan

    for ($i = 0; $i -lt $Options.Length; $i++) {
        Write-Host ("[{0}] {1}" -f ($i + 1), $Options[$i]) -ForegroundColor Yellow
    }

    $index = -1
    do {
        $selection = Read-Host ("`nSelect an option (1-{0})" -f $Options.Length)
        $ok = [int]::TryParse($selection, [ref]$index)
        if ($ok) { $index = $index - 1 }
    } while (-not $ok -or $index -lt 0 -or $index -ge $Options.Length)

    return $Options[$index]
}

function Test-ProductName {
    param([string]$ProductName)
    return $ProductName -cmatch '^[a-z0-9]+(-[a-z0-9]+)*$'
}

# Hardcoded for GitLab downtime workflow - always use GitHub remote
$Global:GitRemote = 'github'
$Global:DefaultBranch = 'main'

function Test-RemotePointsToGitHub {
    param([string]$RemoteName)

    $url = git remote get-url $RemoteName 2>$null
    if (-not $url) { return $false }
    return ($url -match '(github\.com|git@github\.com:)')
}

function Ensure-RemoteConfigured {
    if (Test-RemotePointsToGitHub -RemoteName 'github') {
        Write-Host "`nOK: Using 'github' remote for GitHub backup." -ForegroundColor Green
        return $true
    }

    Write-Host "`nNo 'github' remote found or it doesn't point to GitHub." -ForegroundColor Yellow
    $setup = Read-Host "Set up the GitHub remote now? (y/N)"
    if ($setup -notin @('y','Y')) { return $false }

    while ($true) {
        $repoUrl = Read-Host "`nPaste your GitHub repository URL (HTTPS or SSH)"
        if (-not $repoUrl) {
            Write-Host "Repository URL cannot be empty!" -ForegroundColor Red
            continue
        }
        if ($repoUrl -notmatch '(github\.com|git@github\.com:)' -or $repoUrl -notmatch '(\.git)?/?$') {
            Write-Host "Invalid GitHub URL format!" -ForegroundColor Red
            Write-Host "Examples:" -ForegroundColor Gray
            Write-Host "  https://github.com/username/repository.git" -ForegroundColor Gray
            Write-Host "  git@github.com:username/repository.git" -ForegroundColor Gray
            continue
        }
        break
    }

    $name = 'github'
    if (git remote 2>$null | Select-String -SimpleMatch $name) {
        $overwrite = Read-Host "'github' remote exists. Overwrite its URL? (y/N)"
        if ($overwrite -in @('y','Y')) {
            git remote set-url $name $repoUrl | Out-Null
        } else {
            $name = Read-Host "Enter a different remote name (e.g., origin)"
            if (-not $name) { return $false }
            if (git remote 2>$null | Select-String -SimpleMatch $name) {
                git remote set-url $name $repoUrl | Out-Null
            } else {
                git remote add $name $repoUrl | Out-Null
            }
        }
    } else {
        git remote add $name $repoUrl | Out-Null
    }

    $Global:GitRemote = $name
    $Global:DefaultBranch = Get-DefaultBranch -RemoteName $GitRemote

    Write-Host "Added/updated remote '$GitRemote' -> $repoUrl" -ForegroundColor Green
    return $true
}

function Get-DirtyState {
    $status = git status --porcelain
    return [bool]$status
}

# ---------- Operations ----------
function Invoke-PullFromDefault {
    Write-Host "`nPulling latest from '$DefaultBranch' on '$GitRemote'..." -ForegroundColor Green
    try {
        $hasStash = $false
        if (Get-DirtyState) {
            git stash push -m ("Auto-stash before pull {0}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Out-Null
            $hasStash = $true
        }

        git checkout $DefaultBranch
        if ($LASTEXITCODE -ne 0) { throw "Failed to checkout $DefaultBranch" }

        git pull $GitRemote $DefaultBranch
        if ($LASTEXITCODE -ne 0) { throw "Failed to pull from $GitRemote/$DefaultBranch" }

        if ($hasStash) {
            Write-Host "Restoring stashed changes..." -ForegroundColor Cyan
            git stash pop | Out-Null
        }

        Write-Host "Pull successful." -ForegroundColor Green
        return $true
    } catch {
        Write-Host ("ERROR: {0}" -f $_) -ForegroundColor Red
        return $false
    }
}

function Invoke-CheckoutExistingBranch {
    Write-Host "`nListing branches..." -ForegroundColor Cyan
    try {
        $locals  = git branch --format="%(refname:short)"
        $remotes = git branch -r --format="%(refname:short)" `
                   | Where-Object { $_ -like "$GitRemote/*" } `
                   | ForEach-Object { $_ -replace "^$GitRemote/", "" }

        $branches = @($locals + $remotes) | Sort-Object -Unique | Where-Object { $_ -ne "main" }
        if (-not $branches -or $branches.Count -eq 0) {
            Write-Host "No branches found (excluding main branch)." -ForegroundColor Red
            return $false
        }

        $selected = Show-Menu -Title "Select branch to checkout:" -Options $branches
        Write-Host ("`nChecking out branch: {0}" -f $selected) -ForegroundColor Cyan

        git checkout $selected
        if ($LASTEXITCODE -ne 0) {
            git checkout --track "$GitRemote/$selected"
            if ($LASTEXITCODE -ne 0) { throw "Failed to checkout $selected" }
        }

        Write-Host ("Checked out: {0}" -f $selected) -ForegroundColor Green
        return $true
    } catch {
        Write-Host ("ERROR: {0}" -f $_) -ForegroundColor Red
        return $false
    }
}

function Invoke-PushWithBranch {
    Write-Host "`nBranch management..." -ForegroundColor Green

    $branchOptions = @("Checkout existing branch", "Create new branch")
    $choice = Show-Menu -Title "What would you like to do?" -Options $branchOptions

    if ($choice -eq "Checkout existing branch") {
        return (Invoke-CheckoutExistingBranch)
    }

    # Create new branch
    $branchTypes = @("feat", "fix", "test", "docs", "style", "refactor", "perf", "build", "ci", "chore", "revert")
    $selectedType = Show-Menu -Title "Select branch type:" -Options $branchTypes

    $scopes = @("frontend", "backend", "api", "ui", "database", "auth", "config", "deployment")
    $selectedScope = Show-Menu -Title "Select scope:" -Options $scopes

    while ($true) {
        $productName = (Read-Host "`nEnter product name (lowercase, hyphens for spaces)").Trim()
        if (-not $productName) {
            Write-Host "Product name cannot be empty!" -ForegroundColor Red
            continue
        }
        if (-not (Test-ProductName -ProductName $productName)) {
            Write-Host "Invalid format! Use lowercase letters, numbers, and hyphens only." -ForegroundColor Red
            Write-Host "Examples: user-authentication, api-endpoints, shopping-cart"
            continue
        }
        break
    }

    $branchName = "$selectedType/$selectedScope/$productName"
    Write-Host ("`nBranch name: {0}" -f $branchName) -ForegroundColor Cyan

    $confirm = Read-Host "Proceed with creating and pushing this branch? (y/N)"
    if ($confirm -notin @('y','Y')) {
        Write-Host "Cancelled." -ForegroundColor Yellow
        return $false
    }

    try {
        Write-Host ("`nEnsuring '{0}' is up to date..." -f $DefaultBranch) -ForegroundColor Cyan
        git checkout $DefaultBranch
        if ($LASTEXITCODE -ne 0) { throw "Failed to checkout $DefaultBranch" }

        git pull $GitRemote $DefaultBranch
        if ($LASTEXITCODE -ne 0) { throw ("Failed to pull $GitRemote/$DefaultBranch") }

        Write-Host ("Creating branch: {0}" -f $branchName) -ForegroundColor Cyan
        git checkout -b $branchName
        if ($LASTEXITCODE -ne 0) { throw "Failed to create $branchName" }

        $existsRemote = git ls-remote --heads $GitRemote $branchName 2>$null
        if ($existsRemote) {
            Write-Host "Warning: remote branch already exists; pushing will update its upstream." -ForegroundColor Yellow
        }

        Write-Host ("Pushing to remote '{0}'..." -f $GitRemote) -ForegroundColor Cyan
        git push -u $GitRemote $branchName
        if ($LASTEXITCODE -ne 0) { throw "Failed to push to $GitRemote/$branchName" }

        Write-Host ("Branch '{0}' created and pushed." -f $branchName) -ForegroundColor Green
        return $true
    } catch {
        Write-Host ("ERROR: {0}" -f $_) -ForegroundColor Red
        return $false
    }
}

# ---------- Main ----------
Write-Host "Git Branch Manager" -ForegroundColor Magenta
Write-Host "=================="

if (-not (Ensure-RemoteConfigured)) {
    Write-Host "`nA GitHub remote is required. Aborting." -ForegroundColor Red
    exit 1
}

switch ($Action) {
    "pull" { [void](Invoke-PullFromDefault) }
    "push" { [void](Invoke-PushWithBranch) }
    default { Write-Host "Unknown action." -ForegroundColor Red; exit 1 }
}

Write-Host "`nOperation completed." -ForegroundColor Green
