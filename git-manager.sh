#!/bin/bash

# Git Branch Management Script for Linux/macOS
# Handles pull from main and push with structured branch naming

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

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
    echo -e "\n${GREEN}🔄 Pulling latest changes from main branch...${NC}"

    # Stash any uncommitted changes
    local stash_output
    stash_output=$(git stash push -m "Auto-stash before pull $(date '+%Y-%m-%d %H:%M:%S')" 2>&1)
    local has_stash=false

    if [[ ! "$stash_output" =~ "No local changes to save" ]]; then
        has_stash=true
    fi

    # Switch to main and pull
    git checkout main
    git pull github main

    # Pop stash if we created one
    if [ "$has_stash" = true ]; then
        echo -e "\n${BLUE}📦 Restoring stashed changes...${NC}"
        git stash pop
    fi

    echo -e "\n${GREEN}✅ Successfully pulled from main!${NC}"
}

# Function to checkout existing branch
checkout_existing_branch() {
    echo -e "\n${BLUE}🌿 Available branches:${NC}"

    # Get all branches (local and remote)
    local branches
    branches=$(git branch -a | grep -v HEAD | sed 's/^\*\?\s*//' | sed 's/remotes\/[^\/]*\///' | sort | uniq)

    if [ -z "$branches" ]; then
        echo -e "${RED}❌ No branches found.${NC}"
        return 1
    fi

    # Convert to array
    local branch_array=()
    while IFS= read -r line; do
        if [ -n "$line" ]; then
            branch_array+=("$line")
        fi
    done <<< "$branches"

    echo -e "${CYAN}Select branch to checkout:${NC}"
    echo -e "${CYAN}=========================${NC}"

    for i in "${!branch_array[@]}"; do
        echo -e "${YELLOW}[$(($i + 1))] ${branch_array[$i]}${NC}"
    done

    while true; do
        echo
        read -p "Select an option (1-${#branch_array[@]}): " selection
        if [[ "$selection" =~ ^[1-9][0-9]*$ ]] && [ "$selection" -le "${#branch_array[@]}" ]; then
            local selected_branch="${branch_array[$((selection - 1))]}"
            echo -e "\n${BLUE}🔄 Checking out branch: $selected_branch${NC}"
            git checkout "$selected_branch"
            echo -e "${GREEN}✅ Successfully checked out branch: $selected_branch${NC}"
            return 0
        else
            echo -e "${RED}❌ Invalid selection. Please choose 1-${#branch_array[@]}${NC}"
        fi
    done
}

# Push with branch creation function
push_with_branch() {
    echo -e "\n${GREEN}🚀 Branch management...${NC}"

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
                checkout_existing_branch
                return $?
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

    # Push to origin and set upstream
    echo -e "\n${BLUE}⬆️  Pushing branch to origin...${NC}"
    git push -u github "$branch_name"

    echo -e "\n${GREEN}✅ Successfully created and pushed branch: $branch_name${NC}"
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