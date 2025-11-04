# Git Branch Management Script for Windows PowerShell
# Handles pull from default branch and push with structured branch naming

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("pull", "push")]
    [string]$Action,

    [Parameter(Mandatory = $false)]
    [switch]$ForceTimeOverride
)

# ---------- Guard rails ----------
# Check time range restriction (1:31 AM to 6:59 AM - after GitLab servers close at 1:30 AM)
$currentTime = Get-Date
$currentHour = $currentTime.Hour
$currentMinute = $currentTime.Minute

$isInValidTimeRange = $false
if ($currentHour -eq 1 -and $currentMinute -ge 31) {
    # 1:31 AM to 1:59 AM
    $isInValidTimeRange = $true
} elseif ($currentHour -ge 2 -and $currentHour -le 6) {
    # 2:00 AM to 6:59 AM
    $isInValidTimeRange = $true
}

if (-not $isInValidTimeRange -and -not $ForceTimeOverride) {
    Write-Host "ERROR: This script can only be executed between 1:31 AM and 6:59 AM (after GitLab servers close)." -ForegroundColor Red
    Write-Host "Current time: $($currentTime.ToString('HH:mm'))" -ForegroundColor Yellow
    Write-Host "Use -ForceTimeOverride to bypass this restriction for emergency use." -ForegroundColor Gray
    exit 1
} elseif (-not $isInValidTimeRange -and $ForceTimeOverride) {
    Write-Host "WARNING: Time restriction bypassed with -ForceTimeOverride!" -ForegroundColor Yellow
    Write-Host "Current time: $($currentTime.ToString('HH:mm'))" -ForegroundColor Yellow
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

function Test-BranchNameValid {
    param([string]$BranchName)

    # Check for remote-tracking ref patterns (remote/branch)
    if ($BranchName -match '^[^/]+/.+') {
        Write-Host "ERROR: Branch name '$BranchName' looks like a remote-tracking ref." -ForegroundColor Red
        Write-Host "This could create a bogus branch on the remote. Use a plain branch name instead." -ForegroundColor Yellow
        return $false
    }

    # Check for other invalid patterns
    if ($BranchName -match '^\s|\s$|^\.|/\.|\.lock$|@{|\\') {
        Write-Host "ERROR: Branch name '$BranchName' contains invalid characters." -ForegroundColor Red
        return $false
    }

    return $true
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

function Test-UncommittedChanges {
    $status = git status --porcelain
    if ($status) {
        Write-Host "`nWARNING: You have uncommitted or staged changes:" -ForegroundColor Yellow
        git status --short
        Write-Host "`nPushes only send commits. Uncommitted changes won't be pushed." -ForegroundColor Yellow
        $confirm = Read-Host "Continue anyway? (y/N)"
        if ($confirm -notin @('y','Y')) {
            Write-Host "Cancelled." -ForegroundColor Yellow
            return $false
        }
    }
    return $true
}

function Invoke-PushCurrentHead {
    param([string]$TargetRemote = $GitRemote)

    $currentBranch = git branch --show-current
    $currentCommit = git rev-parse --short HEAD

    Write-Host "`nPushing current HEAD → $TargetRemote/$currentBranch" -ForegroundColor Cyan
    Write-Host "  Source: HEAD ($currentCommit)" -ForegroundColor Gray
    Write-Host "  Target: $TargetRemote/$currentBranch" -ForegroundColor Gray

    git push -u $TargetRemote $currentBranch
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed HEAD → $TargetRemote/$currentBranch" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Failed to push HEAD → $TargetRemote/$currentBranch" -ForegroundColor Red
        return $false
    }
}

# ---------- Operations ----------
function Invoke-PullFromDefault {
    try {
        # Get the configured upstream for the default branch
        $upstream = git config "branch.$DefaultBranch.merge" 2>$null
        $remote = git config "branch.$DefaultBranch.remote" 2>$null

        if ($upstream -and $remote) {
            Write-Host "`nPulling latest from configured upstream for '$DefaultBranch' (${remote}/${upstream})..." -ForegroundColor Green
        } else {
            Write-Host "`nNo upstream configured for '$DefaultBranch', using '$GitRemote/$DefaultBranch'..." -ForegroundColor Yellow
            $remote = $GitRemote
        }

        $hasStash = $false
        if (Get-DirtyState) {
            git stash push -m ("Auto-stash before pull {0}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) | Out-Null
            $hasStash = $true
        }

        git checkout $DefaultBranch
        if ($LASTEXITCODE -ne 0) { throw "Failed to checkout $DefaultBranch" }

        if ($upstream -and $remote) {
            # Use git pull without arguments to respect configured upstream
            git pull
        } else {
            # Fallback to explicit remote/branch
            git pull $remote $DefaultBranch
        }
        if ($LASTEXITCODE -ne 0) { throw "Failed to pull from upstream" }

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
    Write-Host "`nPruning stale remote references..." -ForegroundColor Cyan
    git remote prune $GitRemote 2>$null | Out-Null

    Write-Host "`nListing branches..." -ForegroundColor Cyan
    try {
        # Get local branches (exclude current branch and main)
        $locals = git branch --format="%(refname:short)" | Where-Object {
            $_ -ne "main" -and $_ -ne $DefaultBranch -and -not $_.StartsWith("*")
        } | Sort-Object

        # Filter out any remote-tracking ref names (contain slash after remote name)
        $locals = $locals | Where-Object { $_ -notmatch "^[^/]+/.+" }

        $options = @()
        $branchMap = @{}
        $index = 0

        # Add local branches first
        if ($locals.Count -gt 0) {
            foreach ($branch in $locals) {
                $options += "📁 $branch (local)"
                $branchMap[$index] = @{ Name = $branch; Type = "local" }
                $index++
            }
        }

        # Get remote-only branches (not tracked locally)
        $remotes = git branch -r --format="%(refname:short)" | Where-Object {
            $_ -like "$GitRemote/*" -and $_ -notlike "$GitRemote/HEAD*" -and $_ -notlike "$GitRemote/$DefaultBranch"
        } | ForEach-Object { $_ -replace "^$GitRemote/", "" } | Sort-Object

        # Filter remote branches that don't have local counterparts
        $remoteOnly = $remotes | Where-Object { $_ -notin $locals -and $_ -notmatch "^[^/]+/.+" }

        if ($remoteOnly.Count -gt 0) {
            foreach ($branch in $remoteOnly) {
                $options += "🌐 $branch (remote-only)"
                $branchMap[$index] = @{ Name = $branch; Type = "remote" }
                $index++
            }
        }

        if ($options.Count -eq 0) {
            Write-Host "No branches found (excluding main branch)." -ForegroundColor Red
            return $false
        }

        $selectedIndex = Show-Menu -Title "Select branch to checkout:" -Options $options
        $selectedOption = $branchMap[[array]::IndexOf($options, $selectedIndex)]
        $branchName = $selectedOption.Name
        $branchType = $selectedOption.Type

        Write-Host ("`nChecking out branch: {0} ({1})" -f $branchName, $branchType) -ForegroundColor Cyan

        if ($branchType -eq "local") {
            git checkout $branchName
            if ($LASTEXITCODE -ne 0) { throw "Failed to checkout local branch $branchName" }
        } else {
            # Create local tracking branch for remote-only branch
            git checkout -b $branchName --track "$GitRemote/$branchName"
            if ($LASTEXITCODE -ne 0) { throw "Failed to create tracking branch for $GitRemote/$branchName" }
        }

        Write-Host ("Checked out: {0}" -f $branchName) -ForegroundColor Green
        return $true
    } catch {
        Write-Host ("ERROR: {0}" -f $_) -ForegroundColor Red
        return $false
    }
}

function Invoke-PushWithBranch {
    Write-Host "`nBranch management..." -ForegroundColor Green

    # Check for uncommitted changes before proceeding
    if (-not (Test-UncommittedChanges)) {
        return $false
    }

    $currentBranch = git branch --show-current
    $branchOptions = @("Push current branch ($currentBranch)", "Checkout existing branch", "Create new branch")
    $choice = Show-Menu -Title "What would you like to do?" -Options $branchOptions

    if ($choice -eq "Push current branch ($currentBranch)") {
        # Push the current branch without switching
        Invoke-PushCurrentHead
        return $true
    } elseif ($choice -eq "Checkout existing branch") {
        if (Invoke-CheckoutExistingBranch) {
            # After successful checkout, push current HEAD
            Invoke-PushCurrentHead
        }
        return $true
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

    # Validate branch name
    if (-not (Test-BranchNameValid -BranchName $branchName)) {
        return $false
    }

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

        Write-Host ("Pushing branch to remote..." -f $GitRemote) -ForegroundColor Cyan
        if (Invoke-PushCurrentHead) {
            Write-Host ("Branch '{0}' created and pushed." -f $branchName) -ForegroundColor Green
        } else {
            throw "Failed to push branch $branchName"
        }
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

# Set default push remote to GitHub for routine pushes
Write-Host "`nSetting default push remote to GitHub..." -ForegroundColor Cyan
git config push.default simple 2>$null | Out-Null
git config remote.pushDefault $GitRemote 2>$null | Out-Null

switch ($Action) {
    "pull" { [void](Invoke-PullFromDefault) }
    "push" { [void](Invoke-PushWithBranch) }
    default { Write-Host "Unknown action." -ForegroundColor Red; exit 1 }
}

Write-Host "`nOperation completed." -ForegroundColor Green
