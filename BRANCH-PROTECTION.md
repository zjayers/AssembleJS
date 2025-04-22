# Branch Protection Rules for AssembleJS

To maintain the integrity of our release process, the following branch protection rules should be configured in GitHub:

## Setting the Default Branch

First, set `next` as the default branch:

1. Go to your repository on GitHub
2. Click on "Settings" → "General" → scroll down to "Default branch"
3. Click on the switch icon next to the current default branch
4. Select `next` from the dropdown
5. Click "Update"
6. Confirm the change

This ensures all new PRs target `next` by default.

## Main Branch Protection

The `main` branch must be strictly protected:

- **Requires pull request before merging**
  - At least 1 approving review
  - Dismiss stale pull request approvals when new commits are pushed
  - Require status checks to pass before merging
    - Require branches to be up to date before merging
    - Required status checks:
      - `test` job from CI
  - Restrict who can push to matching branches
    - Allow only GitHub Actions to push to main branch (add GitHub Actions bot)
  - Allow specified actors to bypass required pull requests
    - Add your GitHub Actions bot here
  - Allow force pushes: **Disabled**
  - Allow deletions: **Disabled**

## Next Branch Protection

The `next` branch:

- **Requires pull request before merging**
  - At least 1 approving review
  - Dismiss stale pull request approvals when new commits are pushed
  - Require status checks to pass before merging
    - Require branches to be up to date before merging
    - Required status checks:
      - `test` job from CI
  - Allow force pushes: **Disabled**
  - Allow deletions: **Disabled**

## Step-by-Step Configuration

### For Main Branch:

1. Go to the repository Settings
2. Select "Branches" from the sidebar
3. Click "Add rule" under "Branch protection rules"
4. Enter `main` for "Branch name pattern"
5. Check "Require a pull request before merging"
   - Check "Require approvals"
   - Set required number of approvals to 1 or more
   - Optionally check "Dismiss stale pull request approvals when new commits are pushed"
6. Check "Require status checks to pass before merging"
   - Check "Require branches to be up to date before merging"
   - Search for and select your test workflow in "Status checks that are required"
7. Check "Restrict who can push to matching branches"
   - Add the GitHub Actions bot or specific admin accounts
8. Check "Allow specified actors to bypass required pull requests"
   - Add the GitHub Actions bot
9. Leave "Allow force pushes" and "Allow deletions" unchecked
10. Click "Create"

### For Next Branch:

1. Go to the repository Settings
2. Select "Branches" from the sidebar
3. Click "Add rule" under "Branch protection rules" 
4. Enter `next` for "Branch name pattern"
5. Check "Require a pull request before merging"
   - Check "Require approvals"
   - Set required number of approvals to 1 or more
6. Check "Require status checks to pass before merging"
   - Check "Require branches to be up to date before merging"
   - Search for and select your test workflow in "Status checks that are required"
7. Leave "Allow force pushes" and "Allow deletions" unchecked
8. Click "Create"

## Workflow Overview

With these protections in place:

1. Developers cannot push directly to `main` or `next`
2. All changes require a pull request with approvals
3. The `main` branch can only be updated by the GitHub Actions workflow when promoting from `next`
4. All changes must pass tests before merging
5. PRs targeting `main` directly (except from `next`) will be rejected

This ensures the release process remains controlled and reliable.