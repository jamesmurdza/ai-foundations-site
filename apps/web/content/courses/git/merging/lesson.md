## Merging

You now know how to create branches and switch between them. Merging is how you bring those changes back together.

### What Merging Does

When you merge, you take the changes from one branch and bring them into another. In most cases, you will be merging work from a separate branch back into `main`.

Think of it like this. You walked down a different path and made some good changes. Merging is how you bring those changes back to the main path so they become part of your project.

### The Simple Case

Start by switching to the branch you want to merge into. Since you want your new work to become part of `main`, switch to it first:

```bash
git switch main
```

Then run:

```bash
git merge new-idea
```

![terminal showing the fast-forward merge output](/images/git/merging/fast-forward-merge.png)

Git will take the commit from `new-idea` and add it to `main`. Open `poem.txt` and you will see the new stanza is now part of the main version.

This type of merge is called a **fast-forward merge**. It happens when the branch you are merging has new commits that `main` does not, and `main` has not moved forward on its own. Git simply moves `main` forward to include the new work. No conflict, no extra steps.

Run `git log --oneline` to see that the history now includes the commit from `new-idea`.

![git log --oneline on main including the commit from new-idea](/images/git/merging/git-log-after-merge.png)

### When a Conflict Happens

A conflict happens when two branches have both changed the same part of the same file. Git does not know which version to keep, so it stops and asks you to decide.

This sounds alarming, but it is a normal part of working with branches. Git is being careful, not broken.

To see a conflict in action, start from a clean state. On `main`, open `poem.txt` and change the second line of the third stanza from:

```
Rewriting lines again and again
```

to:

```
Rewriting words again and again
```

Stage and commit: `git add poem.txt` and `git commit -m "update third stanza on main"`.

Now switch to `new-idea` and change that same line to:

```
Going through it all once more
```

Stage and commit: `git add poem.txt` and `git commit -m "update third stanza on new-idea"`.

Switch back to `main` and run:

```bash
git switch main
git merge new-idea
```

![merge conflict message naming poem.txt](/images/git/merging/merge-conflict-message.png)

Git will tell you there is a conflict and that automatic merging has failed. It will name the file where the conflict occurred.

### Reading a Conflict

Open `poem.txt` and you will see something like this:

```
<<<<<<< HEAD
Rewriting words again and again
=======
Going through it all once more
>>>>>>> new-idea
```

![poem.txt showing conflict markers with both versions](/images/git/merging/conflict-markers.png)

This is Git marking the two versions of the same line.

The part between `<<<<<<< HEAD` and `=======` is what exists on your current branch, `main`.

The part between `=======` and `>>>>>>> new-idea` is what came from the branch you are merging.

Everything outside these markers is content that was not affected by the conflict and is already merged correctly.

### Resolving the Conflict

To resolve the conflict, edit the file and decide what the final version should look like. You might keep one version, keep the other, or combine them into something new.

In this case, you could restore the original line from the poem:

```
Rewriting lines again and again
```

Remove the conflict markers entirely. After editing, the file should have no conflict markers left. It should look exactly how you want the final version to be.

![deleting conflict markers and choosing the final line](/images/git/merging/resolve-conflict.gif)

Once you are happy with the result, stage and commit the file:

```bash
git add poem.txt
git commit -m "resolve merge conflict in poem"
```

The merge is now complete. The conflict has been resolved and the project history moves forward.

### Cleaning Up After a Merge

Once a branch has been merged, its work lives on `main`. The branch itself has done its job and you no longer need it.

Leaving old branches around is not dangerous, but they build up. After a few months of work you can end up with a long list of names you no longer recognize.

To see what you have, run:

```bash
git branch
```

To delete a branch you have finished with, make sure you are not standing on it, then run:

```bash
git switch main
git branch -d new-idea
```

![terminal confirming the new-idea branch was deleted](/images/git/merging/branch-deleted.png)

Git confirms the branch is gone. Your commits are safe. They were merged into `main`, so deleting the branch only removes the label, not the work.

The `-d` is doing something helpful here. It refuses to delete a branch whose work has not been merged anywhere. If Git blocks the deletion, take it seriously. It is telling you that branch holds commits that exist nowhere else.

Run `git branch` again and you will see only `main`.

### Using lazygit for Conflicts

Resolving conflicts inside a plain text editor works well, but it can be hard to read when files are long or conflicts are complex. A tool called **lazygit** gives you a cleaner, visual way to see both versions side by side and choose what to keep.

You will get a full introduction to lazygit in the next section. For now, just know that it is available and makes conflict resolution much easier to work through.

### Merging Is a Routine Part of Git

Every team that uses Git merges regularly. Conflicts are common and resolving them is a skill that becomes natural with practice.

The important thing to remember is that Git never silently overwrites your work. When two versions cannot be combined automatically, it stops and waits for you. You are always the one making the final decision.

### Key Takeaways

- Merging brings changes from one branch into another
- Switch to the target branch first, then run `git merge branch-name`
- A fast-forward merge happens when there are no conflicting changes between branches
- When a conflict occurs, Git pauses and marks the file so you can decide what to keep
- `git branch -d name` deletes a branch once its work has been merged
