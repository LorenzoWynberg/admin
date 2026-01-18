# Jujutsu (jj) Guide

jj differs from git: the working copy is always a commit, there's no staging area, and branches are called "bookmarks".

## Daily Workflow

```bash
jj new                              # Create new commit on top of current
jj describe -m "message"            # Set/edit commit message
jj status                           # Show working copy changes
jj diff                             # Show changes in working copy
jj log                              # Show commit history
```

## Bookmarks (Branches)

```bash
jj bookmark create NAME -r @        # Create bookmark at current commit
jj bookmark set NAME -r @           # Move existing bookmark to current commit
jj bookmark delete NAME             # Delete bookmark
jj bookmark list                    # List all bookmarks
jj bookmark track NAME --remote=origin  # Track remote bookmark (required before push)
```

## Remote Operations

```bash
jj git fetch                        # Fetch from remote
jj git push --bookmark NAME         # Push specific bookmark
jj git push --deleted               # Push bookmark deletions
```

## Rewriting History

```bash
jj squash                           # Squash current commit into parent
jj rebase -r @ -d TARGET            # Rebase current commit onto target
jj abandon @                        # Abandon current commit
```

## Undo Mistakes

```bash
jj undo                             # Undo last operation
jj op log                           # Show operation history
```

## Pushing New Bookmarks

Before pushing a new bookmark, you must track it:

```bash
jj bookmark create feature/foo -r @
jj bookmark track feature/foo --remote=origin
jj git push --bookmark feature/foo
```

**Note:** `--allow-new` flag is deprecated. Use `jj bookmark track` instead.

## Common Pitfall: Empty Working Copy After Push

When you push and the working copy becomes immutable, jj creates a new empty commit on top. If you then use `@` to move bookmarks, they'll point to this empty commit and fail to push.

```bash
# WRONG - after push, @ points to new empty commit
jj git push --bookmark feature/foo
jj bookmark set main -r @           # Moves to empty commit!

# CORRECT - use the change ID, not @
jj git push --bookmark feature/foo
jj bookmark set main -r <change-id> # Use actual change ID like "rpoznltr"
```

## Branch Strategy

Code flows one direction through environments:

```
feature/* → release/* → dev → main
  (work)    (integrate)  (staging)  (production)
```

| Branch      | Purpose                          | Merges to   |
| ----------- | -------------------------------- | ----------- |
| `feature/*` | Individual features/fixes        | `release/*` |
| `release/*` | Integrate features for a version | `dev`       |
| `dev`       | Staging/QA testing               | `main`      |
| `main`      | Production                       | -           |

**Workflow:**

1. Create `feature/xyz` from `release/X.X` for any work
2. Merge features into `release/X.X` when done
3. When release is ready for testing → merge `release/X.X` to `dev`
4. After QA approval → merge `dev` to `main`
5. Start new `release/X.Y` from `main`

**Hotfixes:** Branch from `main`, merge to `main` then backport to `dev`

**Cross-repo:** Use same branch names across all 3 repos when syncing
