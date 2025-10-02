#!/bin/bash

# Git Branch Management Script for Linux/macOS
# Handles pull from main and push with structured branch naming

set -euo pipefail

# Parse command line arguments
FORCE_TIME_OVERRIDE=false
ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --force-time-override)
            FORCE_TIME_OVERRIDE=true
            shift
            ;;
        *)
            ARGS+=("$1")
            shift
            ;;
    esac
done

# Restore positional parameters
set -- "${ARGS[@]}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# ---------- Guard rails ----------
# Check time range restriction (12:01 AM to 6:59 AM)
current_hour=$(date +%H)
current_minute=$(date +%M)

is_valid_time=false

# Convert to 24-hour format for easier comparison
if [[ "$current_hour" == "00" && "$current_minute" -ge 01 ]]; then
    # 12:01 AM to 12:59 AM
    is_valid_time=true
elif [[ "$current_hour" -ge 01 && "$current_hour" -le 06 ]]; then
    # 1:00 AM to 6:59 AM
    is_valid_time=true
fi

if [[ "$is_valid_time" == "false" && "$FORCE_TIME_OVERRIDE" == "false" ]]; then
    echo -e "${RED}❌ ERROR: This script can only be executed between 12:01 AM and 6:59 AM.${NC}"
    echo -e "${YELLOW}Current time: $(date '+%H:%M')${NC}"
    echo -e "${GRAY}Use --force-time-override to bypass this restriction for emergency use.${NC}"
    exit 1
elif [[ "$is_valid_time" == "false" && "$FORCE_TIME_OVERRIDE" == "true" ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Time restriction bypassed with --force-time-override!${NC}"
    echo -e "${YELLOW}Current time: $(date '+%H:%M')${NC}"
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ ERROR: Git is not installed or not on PATH.${NC}"
    exit 1
fi

# Function to display menu and get selection
show_menu() {
    local title="$1"
    shift
    local options=("$@")

    echo -e "\n${CYAN}$title${NC}"
    printf "${CYAN}%*s${NC}\n" ${#title} "" | tr " " "="

    for i in "${!options[@]}"; do
        echo -e "${YELLOW}[$(($i + 1))] ${options[$i]}${NC}"
    done

    while true; do
        echo
        read -p "Select an option (1-${#options[@]}): " selection
        if [[ "$selection" =~ ^[1-9][0-9]*$ ]] && [ "$selection" -le "${#options[@]}" ]; then
            echo "${options[$((selection - 1))]}"
            break
        else
            echo -e "${RED}❌ Invalid selection. Please choose 1-${#options[@]}${NC}"
        fi
    done
}

# Function to validate product name
validate_product_name() {
    local product_name="$1"

    # Check if lowercase and uses hyphens for spaces
    if [[ "$product_name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate branch name
validate_branch_name() {
    local branch_name="$1"

    # Check for remote-tracking ref patterns (remote/branch)
    if [[ "$branch_name" =~ ^[^/]+/.+ ]]; then
        echo -e "${RED}❌ ERROR: Branch name '$branch_name' looks like a remote-tracking ref.${NC}"
        echo -e "${YELLOW}This could create a bogus branch on the remote. Use a plain branch name instead.${NC}"
        return 1
    fi

    # Check for other invalid patterns
    if [[ "$branch_name" =~ ^[[:space:]]|[[:space:]]$|^\.|/\.|\.lock$|@\{|\\ ]]; then
        echo -e "${RED}❌ ERROR: Branch name '$branch_name' contains invalid characters.${NC}"
        return 1
    fi

    return 0
}

# Function to check for uncommitted changes
check_uncommitted_changes() {
    local status_output
    status_output=$(git status --porcelain 2>/dev/null)

    if [ -n "$status_output" ]; then
        echo -e "\n${YELLOW}⚠️  WARNING: You have uncommitted or staged changes:${NC}"
        git status --short
        echo -e "\n${YELLOW}Pushes only send commits. Uncommitted changes won't be pushed.${NC}"
        echo
        read -p "Continue anyway? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}❌ Cancelled by user.${NC}"
            return 1
        fi
    fi
    return 0
}

# Function to push current HEAD with explicit intent
push_current_head() {
    local target_remote="${1:-github}"
    local current_branch
    local current_commit

    current_branch=$(git branch --show-current)
    current_commit=$(git rev-parse --short HEAD)

    echo -e "\n${CYAN}⬆️  Pushing current HEAD → $target_remote/$current_branch${NC}"
    echo -e "${GRAY}  Source: HEAD ($current_commit)${NC}"
    echo -e "${GRAY}  Target: $target_remote/$current_branch${NC}"

    if git push -u "$target_remote" "$current_branch"; then
        echo -e "${GREEN}✅ Successfully pushed HEAD → $target_remote/$current_branch${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to push HEAD → $target_remote/$current_branch${NC}"
        return 1
    fi
}

# Function to check GitHub remote
check_github_remote() {
    echo -e "\n${BLUE}🔍 Checking GitHub remote configuration...${NC}"

    # Get all remotes
    local remotes
    remotes=$(git remote -v 2>/dev/null)

    if [ -z "$remotes" ]; then
        echo -e "${RED}❌ No remotes configured.${NC}"
        return 1
    fi

    # Check if github remote exists
    local github_remote
    github_remote=$(echo "$remotes" | grep "^github")

    if [ -z "$github_remote" ]; then
        echo -e "${RED}❌ No 'github' remote found.${NC}"
        echo -e "${YELLOW}Current remotes:${NC}"
        echo "$remotes" | sed 's/^/  /' | while read -r line; do echo -e "${GRAY}$line${NC}"; done
        return 1
    fi

    # Verify github remote points to GitHub
    if [[ ! "$github_remote" =~ (github\.com|git@github\.com) ]]; then
        echo -e "${RED}❌ GitHub remote does not point to GitHub.com.${NC}"
        echo -e "${YELLOW}Current github remote:${NC}"
        echo "$github_remote" | sed 's/^/  /' | while read -r line; do echo -e "${GRAY}$line${NC}"; done
        return 1
    fi

    echo -e "${GREEN}✅ GitHub remote is properly configured!${NC}"
    return 0
}

# Function to setup GitHub remote
setup_github_remote() {
    echo -e "\n${BLUE}🔧 Setting up GitHub remote...${NC}"

    local repo_url

    while true; do
        echo
        read -p "📋 Please paste your GitHub repository URL: " repo_url

        if [ -z "$repo_url" ]; then
            echo -e "${RED}❌ Repository URL cannot be empty!${NC}"
            continue
        fi

        # Basic validation for GitHub URL
        if [[ ! "$repo_url" =~ (github\.com|git@github\.com) ]] || [[ ! "$repo_url" =~ \.(git)?/?$ ]]; then
            echo -e "${RED}❌ Invalid GitHub URL format!${NC}"
            echo -e "${GRAY}   Examples:${NC}"
            echo -e "${GRAY}   • https://github.com/username/repository.git${NC}"
            echo -e "${GRAY}   • git@github.com:username/repository.git${NC}"
            continue
        fi

        break
    done

    # Check if github remote already exists
    local existing_github
    existing_github=$(git remote get-url github 2>/dev/null)

    if [ -n "$existing_github" ]; then
        echo -e "\n${YELLOW}⚠️  GitHub remote already exists: $existing_github${NC}"
        read -p "Do you want to overwrite it? (y/N): " overwrite

        if [[ "$overwrite" =~ ^[Yy]$ ]]; then
            git remote set-url github "$repo_url"
            echo -e "${GREEN}✅ Updated github remote to: $repo_url${NC}"
        else
            echo -e "${YELLOW}❌ Cancelled by user.${NC}"
            return 1
        fi
    else
        git remote add github "$repo_url"
        echo -e "${GREEN}✅ Added github remote: $repo_url${NC}"
    fi

    return 0
}

# Pull from main function
pull_from_main() {
    # Get the configured upstream for main branch
    local upstream
    local remote
    upstream=$(git config branch.main.merge 2>/dev/null)
    remote=$(git config branch.main.remote 2>/dev/null)

    if [ -n "$upstream" ] && [ -n "$remote" ]; then
        echo -e "\n${GREEN}🔄 Pulling latest from configured upstream for main (${remote}/${upstream})...${NC}"
    else
        echo -e "\n${YELLOW}⚠️  No upstream configured for main, using github/main...${NC}"
        remote="github"
    fi

    # Stash any uncommitted changes
    local stash_output
    stash_output=$(git stash push -m "Auto-stash before pull $(date '+%Y-%m-%d %H:%M:%S')" 2>&1)
    local has_stash=false

    if [[ ! "$stash_output" =~ "No local changes to save" ]]; then
        has_stash=true
    fi

    # Switch to main and pull
    git checkout main

    if [ -n "$upstream" ] && [ -n "$remote" ]; then
        # Use git pull without arguments to respect configured upstream
        git pull
    else
        # Fallback to explicit remote/branch
        git pull "$remote" main
    fi

    # Pop stash if we created one
    if [ "$has_stash" = true ]; then
        echo -e "\n${BLUE}📦 Restoring stashed changes...${NC}"
        git stash pop
    fi

    echo -e "\n${GREEN}✅ Successfully pulled from main!${NC}"
}

# Function to checkout existing branch
checkout_existing_branch() {
    echo -e "\n${CYAN}🔧 Pruning stale remote references...${NC}"
    git remote prune github &>/dev/null || true

    echo -e "\n${BLUE}🌿 Available branches:${NC}"

    # Get local branches (exclude current and main branches)
    local locals
    locals=$(git branch --format="%(refname:short)" | grep -v "^main$" | grep -v "^\*" | grep -v "^[^/]*/.*" | sort | uniq)

    # Get remote-only branches
    local remotes
    remotes=$(git branch -r --format="%(refname:short)" | grep "^github/" | grep -v "github/HEAD" | grep -v "github/main" | sed 's/^github\///' | grep -v "^[^/]*/.*" | sort)

    # Find remote-only branches (not tracked locally)
    local remote_only=()
    if [ -n "$remotes" ]; then
        while IFS= read -r remote_branch; do
            if [ -n "$remote_branch" ] && ! echo "$locals" | grep -q "^${remote_branch}$"; then
                remote_only+=("$remote_branch")
            fi
        done <<< "$remotes"
    fi

    # Build options array
    local options=()
    local branch_map=()
    local index=0

    # Add local branches first
    if [ -n "$locals" ]; then
        while IFS= read -r branch; do
            if [ -n "$branch" ]; then
                options+=("📁 $branch (local)")
                branch_map[$index]="local:$branch"
                ((index++))
            fi
        done <<< "$locals"
    fi

    # Add remote-only branches
    for remote_branch in "${remote_only[@]}"; do
        options+=("🌐 $remote_branch (remote-only)")
        branch_map[$index]="remote:$remote_branch"
        ((index++))
    done

    if [ ${#options[@]} -eq 0 ]; then
        echo -e "${RED}❌ No branches found (excluding main branch).${NC}"
        return 1
    fi

    echo -e "${CYAN}Select branch to checkout:${NC}"
    echo -e "${CYAN}=========================${NC}"

    for i in "${!options[@]}"; do
        echo -e "${YELLOW}[$(($i + 1))] ${options[$i]}${NC}"
    done

    while true; do
        echo
        read -p "Select an option (1-${#options[@]}): " selection
        if [[ "$selection" =~ ^[1-9][0-9]*$ ]] && [ "$selection" -le "${#options[@]}" ]; then
            local selected_mapping="${branch_map[$((selection - 1))]}"
            local branch_type="${selected_mapping%%:*}"
            local branch_name="${selected_mapping#*:}"

            echo -e "\n${BLUE}🔄 Checking out branch: $branch_name ($branch_type)${NC}"

            if [ "$branch_type" = "local" ]; then
                git checkout "$branch_name"
                if [ $? -ne 0 ]; then
                    echo -e "${RED}❌ Failed to checkout local branch: $branch_name${NC}"
                    return 1
                fi
            else
                # Create local tracking branch for remote-only branch
                git checkout -b "$branch_name" --track "github/$branch_name"
                if [ $? -ne 0 ]; then
                    echo -e "${RED}❌ Failed to create tracking branch for github/$branch_name${NC}"
                    return 1
                fi
            fi

            echo -e "${GREEN}✅ Successfully checked out branch: $branch_name${NC}"
            break
        else
            echo -e "${RED}❌ Invalid selection. Please choose 1-${#options[@]}${NC}"
        fi
    done
}

# Push with branch creation function
push_with_branch() {
    echo -e "\n${GREEN}🚀 Branch management...${NC}"

    # Check for uncommitted changes before proceeding
    if ! check_uncommitted_changes; then
        return 1
    fi

    # Ask if user wants to checkout existing branch or create new one
    local branch_options=("Checkout existing branch" "Create new branch")

    echo -e "\n${CYAN}What would you like to do?${NC}"
    echo -e "${CYAN}=========================${NC}"

    for i in "${!branch_options[@]}"; do
        echo -e "${YELLOW}[$(($i + 1))] ${branch_options[$i]}${NC}"
    done

    while true; do
        echo
        read -p "Select an option (1-${#branch_options[@]}): " selection
        if [[ "$selection" =~ ^[1-2]$ ]]; then
            if [ "$selection" -eq 1 ]; then
                if checkout_existing_branch; then
                    # After successful checkout, push current HEAD
                    push_current_head
                fi
                return 0
            else
                break
            fi
        else
            echo -e "${RED}❌ Invalid selection. Please choose 1-${#branch_options[@]}${NC}"
        fi
    done

    echo -e "\n${GREEN}🚀 Creating new branch...${NC}"

    # Get branch type
    local branch_types=("feat" "fix" "test" "docs" "style" "refactor" "perf" "build" "ci" "chore" "revert")
    local selected_type

    echo -e "\n${CYAN}Select branch type:${NC}"
    echo -e "${CYAN}==================${NC}"

    for i in "${!branch_types[@]}"; do
        echo -e "${YELLOW}[$(($i + 1))] ${branch_types[$i]}${NC}"
    done

    while true; do
        echo
        read -p "Select an option (1-${#branch_types[@]}): " selection
        if [[ "$selection" =~ ^[1-9][0-9]*$ ]] && [ "$selection" -le "${#branch_types[@]}" ]; then
            selected_type="${branch_types[$((selection - 1))]}"
            break
        else
            echo -e "${RED}❌ Invalid selection. Please choose 1-${#branch_types[@]}${NC}"
        fi
    done

    # Get scope
    local scopes=("frontend" "backend" "api" "ui" "database" "auth" "config" "deployment")
    local selected_scope

    echo -e "\n${CYAN}Select scope:${NC}"
    echo -e "${CYAN}==============${NC}"

    for i in "${!scopes[@]}"; do
        echo -e "${YELLOW}[$(($i + 1))] ${scopes[$i]}${NC}"
    done

    while true; do
        echo
        read -p "Select an option (1-${#scopes[@]}): " selection
        if [[ "$selection" =~ ^[1-9][0-9]*$ ]] && [ "$selection" -le "${#scopes[@]}" ]; then
            selected_scope="${scopes[$((selection - 1))]}"
            break
        else
            echo -e "${RED}❌ Invalid selection. Please choose 1-${#scopes[@]}${NC}"
        fi
    done

    # Get product name with validation
    local product_name
    while true; do
        echo
        read -p "🏷️  Enter product name (lowercase, use hyphens for spaces): " product_name

        if [ -z "$product_name" ]; then
            echo -e "${RED}❌ Product name cannot be empty!${NC}"
            continue
        fi

        if ! validate_product_name "$product_name"; then
            echo -e "${RED}❌ Invalid format! Use lowercase letters, numbers, and hyphens only.${NC}"
            echo -e "${GRAY}   Examples: user-authentication, api-endpoints, shopping-cart${NC}"
            continue
        fi

        break
    done

    # Construct branch name
    local branch_name="$selected_type/$selected_scope/$product_name"

    echo -e "\n${CYAN}🌿 Branch name: $branch_name${NC}"

    # Validate branch name
    if ! validate_branch_name "$branch_name"; then
        return 1
    fi

    # Confirm before proceeding
    echo
    read -p "Proceed with creating and pushing this branch? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Cancelled by user.${NC}"
        exit 0
    fi

    # Ensure we're on main and up to date
    echo -e "\n${BLUE}📥 Ensuring main branch is up to date...${NC}"
    git checkout main
    git pull github main

    # Create and switch to new branch
    echo -e "\n${BLUE}🌱 Creating new branch: $branch_name${NC}"
    git checkout -b "$branch_name"

    # Push branch using centralized function
    echo -e "\n${BLUE}⬆️  Pushing branch to remote...${NC}"
    if push_current_head; then
        echo -e "\n${GREEN}✅ Successfully created and pushed branch: $branch_name${NC}"
    else
        echo -e "\n${RED}❌ Failed to push branch: $branch_name${NC}"
        return 1
    fi
    echo -e "${GREEN}🎯 You can now start working on your changes!${NC}"
}

# Show usage if no arguments
show_usage() {
    echo -e "${MAGENTA}🔧 Git Branch Manager${NC}"
    echo -e "${MAGENTA}=====================${NC}"
    echo
    echo "Usage: $0 <pull|push>"
    echo
    echo "Commands:"
    echo "  pull    Pull latest changes from main branch"
    echo "  push    Create and push a new feature branch"
    echo
    echo "Examples:"
    echo "  $0 pull"
    echo "  $0 push"
    exit 1
}

# Main execution
if [ $# -eq 0 ]; then
    show_usage
fi

echo -e "${MAGENTA}🔧 Git Branch Manager${NC}"
echo -e "${MAGENTA}=====================${NC}"

# Check GitHub remote setup first
if ! check_github_remote; then
    echo -e "\n${YELLOW}🔧 GitHub remote setup required.${NC}"

    read -p $'\nWould you like to set up the GitHub remote now? (y/N): ' setup_remote
    if [[ "$setup_remote" =~ ^[Yy]$ ]]; then
        if ! setup_github_remote; then
            echo -e "\n${RED}❌ Cannot proceed without GitHub remote setup.${NC}"
            exit 1
        fi
    else
        echo -e "\n${RED}❌ GitHub remote is required for this script to work.${NC}"
        echo -e "${GRAY}   Please run this script again after setting up your GitHub remote.${NC}"
        exit 1
    fi
fi

# Set default push remote to GitHub for routine pushes
echo -e "\n${CYAN}🔧 Setting default push remote to GitHub...${NC}"
git config push.default simple &>/dev/null || true
git config remote.pushDefault github &>/dev/null || true

case "$1" in
    "pull")
        pull_from_main
        ;;
    "push")
        push_with_branch
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_usage
        ;;
esac

echo -e "\n${GREEN}🏁 Operation completed!${NC}"