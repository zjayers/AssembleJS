# Branch Protection Rules for AssembleJS

To maintain the integrity of our release process, the following branch protection rules should be configured in GitHub:

## Main Branch Protection

The `main` branch:

- **Requires pull request before merging**
  - At least 1 approving review
  - Dismiss stale pull request approvals when new commits are pushed
  - Require status checks to pass before merging
    - Require branches to be up to date before merging
    - Required status checks:
      - `test` job from CI
  - Restrict who can push to matching branches
    - Allow only GitHub Actions to push to main branch
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

## Configuration Instructions

These branch protection rules can be configured by:

1. Go to the repository Settings
2. Select "Branches" from the sidebar
3. Click "Add rule" under "Branch protection rules"
4. Enter the branch name pattern (`main` or `next`)
5. Configure the protections as described above
6. Click "Create" or "Save changes"

## Workflow Overview

With these protections in place:

1. Developers cannot push directly to `main` or `next`
2. All changes require a pull request with approvals
3. The `main` branch can only be updated by the GitHub Actions workflow when promoting from `next`
4. All changes must pass tests before merging

This ensures the release process remains controlled and reliable.