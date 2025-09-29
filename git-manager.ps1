# Git Branch Management Script for Windows PowerShell
# Handles pull from main and push with structured branch naming

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("pull", "push")]
    [string]$Action
)

# Function to display menu and get selection
function Show-Menu {
    param(
        [string]$Title,
        [string[]]$Options
    )

    Write-Host "`n$Title" -ForegroundColor Cyan
    Write-Host ("=" * $Title.Length) -ForegroundColor Cyan

    for ($i = 0; $i -lt $Options.Length; $i++) {
        Write-Host "[$($i + 1)] $($Options[$i])" -ForegroundColor Yellow
    }

    do {
        $selection = Read-Host "`nSelect an option (1-$($Options.Length))"
        $index = [int]$selection - 1
    } while ($index -lt 0 -or $index -ge $Options.Length)

    return $Options[$index]
}

# Function to validate product name
function Test-ProductName {
    param([string]$ProductName)

    # Check if lowercase and uses hyphens for spaces
    return $ProductName -cmatch '^[a-z0-9]+(-[a-z0-9]+)*$'
}

# Function to check and setup GitHub remote
function Test-GitHubRemote {
    Write-Host "`n🔍 Checking GitHub remote configuration..." -ForegroundColor Blue

    try {
        # Get all remotes
        $remotes = git remote -v 2>$null

        if (-not $remotes) {
            Write-Host "❌ No remotes configured." -ForegroundColor Red
            return $false
        }

        # Check if github remote exists
        $githubRemote = $remotes | Where-Object { $_ -match "^github\s+" }

        if (-not $githubRemote) {
            Write-Host "❌ No 'github' remote found." -ForegroundColor Red
            Write-Host "Current remotes:" -ForegroundColor Yellow
            $remotes | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            return $false
        }

        # Verify github remote points to GitHub
        $githubPattern = "(github\.com|git@github\.com)"
        if ($githubRemote -notmatch $githubPattern) {
            Write-Host "❌ GitHub remote does not point to GitHub.com." -ForegroundColor Red
            Write-Host "Current github remote:" -ForegroundColor Yellow
            $githubRemote | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
            return $false
        }

        Write-Host "✅ GitHub remote is properly configured!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Error checking remotes: $_" -ForegroundColor Red
        return $false
    }
}

# Function to setup GitHub remote
function Set-GitHubRemote {
    Write-Host "`n🔧 Setting up GitHub remote..." -ForegroundColor Blue

    do {
        $repoUrl = Read-Host "`n📋 Please paste your GitHub repository URL"

        if (-not $repoUrl) {
            Write-Host "❌ Repository URL cannot be empty!" -ForegroundColor Red
            continue
        }

        # Basic validation for GitHub URL
        if ($repoUrl -notmatch "(github\.com|git@github\.com)" -or $repoUrl -notmatch "\.(git)?/?$") {
            Write-Host "❌ Invalid GitHub URL format!" -ForegroundColor Red
            Write-Host "   Examples:" -ForegroundColor Gray
            Write-Host "   • https://github.com/username/repository.git" -ForegroundColor Gray
            Write-Host "   • git@github.com:username/repository.git" -ForegroundColor Gray
            continue
        }

        break
    } while ($true)

    try {
        # Check if github remote already exists
        $existingGithub = git remote get-url github 2>$null

        if ($existingGithub) {
            Write-Host "`n⚠️  GitHub remote already exists: $existingGithub" -ForegroundColor Yellow
            $overwrite = Read-Host "Do you want to overwrite it? (y/N)"

            if ($overwrite -eq 'y' -or $overwrite -eq 'Y') {
                git remote set-url github $repoUrl
                Write-Host "✅ Updated github remote to: $repoUrl" -ForegroundColor Green
            } else {
                Write-Host "❌ Cancelled by user." -ForegroundColor Yellow
                return $false
            }
        } else {
            git remote add github $repoUrl
            Write-Host "✅ Added github remote: $repoUrl" -ForegroundColor Green
        }

        return $true
    }
    catch {
        Write-Host "❌ Error setting up remote: $_" -ForegroundColor Red
        return $false
    }
}

# Pull from main function
function Invoke-PullFromMain {
    Write-Host "`n🔄 Pulling latest changes from main branch..." -ForegroundColor Green

    try {
        # Stash any uncommitted changes
        $stashResult = git stash push -m "Auto-stash before pull $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        $hasStash = $stashResult -notmatch "No local changes to save"

        # Switch to main and pull
        git checkout main
        if ($LASTEXITCODE -ne 0) { throw "Failed to checkout main branch" }

        git pull github main
        if ($LASTEXITCODE -ne 0) { throw "Failed to pull from main" }

        # Pop stash if we created one
        if ($hasStash) {
            Write-Host "`n📦 Restoring stashed changes..." -ForegroundColor Blue
            git stash pop
        }

        Write-Host "`n✅ Successfully pulled from main!" -ForegroundColor Green
    }
    catch {
        Write-Host "`n❌ Error: $_" -ForegroundColor Red
        exit 1
    }
}

# Function to checkout existing branch
function Invoke-CheckoutExistingBranch {
    Write-Host "`n🌿 Available branches:" -ForegroundColor Blue

    try {
        # Get all branches (local and remote)
        $branches = git branch -a | Where-Object { $_ -notmatch "HEAD" } | ForEach-Object {
            $_.Trim() -replace '^\*?\s*', '' -replace '^remotes/[^/]+/', ''
        } | Sort-Object | Get-Unique

        if (-not $branches) {
            Write-Host "❌ No branches found." -ForegroundColor Red
            return $false
        }

        $selectedBranch = Show-Menu -Title "Select branch to checkout:" -Options $branches

        Write-Host "`n🔄 Checking out branch: $selectedBranch" -ForegroundColor Blue
        git checkout $selectedBranch
        if ($LASTEXITCODE -ne 0) { throw "Failed to checkout branch $selectedBranch" }

        Write-Host "✅ Successfully checked out branch: $selectedBranch" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        return $false
    }
}

# Push with branch creation function
function Invoke-PushWithBranch {
    Write-Host "`n🚀 Branch management..." -ForegroundColor Green

    # Ask if user wants to checkout existing branch or create new one
    $branchOptions = @("Checkout existing branch", "Create new branch")
    $selectedOption = Show-Menu -Title "What would you like to do?" -Options $branchOptions

    if ($selectedOption -eq "Checkout existing branch") {
        return Invoke-CheckoutExistingBranch
    }

    Write-Host "`n🚀 Creating new branch..." -ForegroundColor Green

    # Get branch type
    $branchTypes = @("feat", "fix", "test", "docs", "style", "refactor", "perf", "build", "ci", "chore", "revert")
    $selectedType = Show-Menu -Title "Select branch type:" -Options $branchTypes

    # Get scope
    $scopes = @("frontend", "backend", "api", "ui", "database", "auth", "config", "deployment")
    $selectedScope = Show-Menu -Title "Select scope:" -Options $scopes

    # Get product name with validation
    do {
        $productName = Read-Host "`n🏷️  Enter product name (lowercase, use hyphens for spaces)"

        if (-not $productName) {
            Write-Host "❌ Product name cannot be empty!" -ForegroundColor Red
            continue
        }

        if (-not (Test-ProductName -ProductName $productName)) {
            Write-Host "❌ Invalid format! Use lowercase letters, numbers, and hyphens only." -ForegroundColor Red
            Write-Host "   Examples: user-authentication, api-endpoints, shopping-cart" -ForegroundColor Gray
            continue
        }

        break
    } while ($true)

    # Construct branch name
    $branchName = "$selectedType/$selectedScope/$productName"

    Write-Host "`n🌿 Branch name: $branchName" -ForegroundColor Cyan

    # Confirm before proceeding
    $confirm = Read-Host "`nProceed with creating and pushing this branch? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "❌ Cancelled by user." -ForegroundColor Yellow
        exit 0
    }

    try {
        # Ensure we're on main and up to date
        Write-Host "`n📥 Ensuring main branch is up to date..." -ForegroundColor Blue
        git checkout main
        if ($LASTEXITCODE -ne 0) { throw "Failed to checkout main branch" }

        git pull github main
        if ($LASTEXITCODE -ne 0) { throw "Failed to pull latest main" }

        # Create and switch to new branch
        Write-Host "`n🌱 Creating new branch: $branchName" -ForegroundColor Blue
        git checkout -b $branchName
        if ($LASTEXITCODE -ne 0) { throw "Failed to create branch $branchName" }

        # Push to origin and set upstream
        Write-Host "`n⬆️  Pushing branch to origin..." -ForegroundColor Blue
        git push -u github $branchName
        if ($LASTEXITCODE -ne 0) { throw "Failed to push branch to origin" }

        Write-Host "`n✅ Successfully created and pushed branch: $branchName" -ForegroundColor Green
        Write-Host "🎯 You can now start working on your changes!" -ForegroundColor Green
    }
    catch {
        Write-Host "`n❌ Error: $_" -ForegroundColor Red
        exit 1
    }
}

# Main execution
Write-Host "🔧 Git Branch Manager" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta

# Check GitHub remote setup first
if (-not (Test-GitHubRemote)) {
    Write-Host "`n🔧 GitHub remote setup required." -ForegroundColor Yellow

    $setupRemote = Read-Host "`nWould you like to set up the GitHub remote now? (y/N)"
    if ($setupRemote -eq 'y' -or $setupRemote -eq 'Y') {
        if (-not (Set-GitHubRemote)) {
            Write-Host "`n❌ Cannot proceed without GitHub remote setup." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "`n❌ GitHub remote is required for this script to work." -ForegroundColor Red
        Write-Host "   Please run this script again after setting up your GitHub remote." -ForegroundColor Gray
        exit 1
    }
}

switch ($Action) {
    "pull" {
        Invoke-PullFromMain
    }
    "push" {
        Invoke-PushWithBranch
    }
}

Write-Host "`n🏁 Operation completed!" -ForegroundColor Green