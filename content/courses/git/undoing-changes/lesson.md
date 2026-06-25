One of the most reassuring things about Git is that mistakes are not permanent. No matter what you change, Git gives you a way to go back and fix it safely.

This section covers how to undo changes at three different stages.

## The Three Stages Where Mistakes Can Happen

Changes in Git happen in stages, and the way you undo them depends on how far along the change has gone.

The three stages are:

1. **Unstaged changes.** You have edited the file but have not run `git add` yet.
2. **Staged changes.** You have run `git add` but have not committed yet.
3. **Committed changes.** You have already saved a version with `git commit`.

Each stage has its own approach.

## Undoing Unstaged Changes

Imagine you open `poem.txt` and start editing. You change a line or add something by mistake. You have not staged anything yet.

To undo those changes and return the file to the way it was in your last commit, run:

```bash
git restore poem.txt
```

This removes everything you just edited and brings back the last saved version of the file.

After running this command, your file will look exactly as it did before you started editing.

## Undoing Staged Changes

Now imagine you have edited `poem.txt` and already run `git add poem.txt`. The change is in the staging area, waiting to be committed.

If you want to take it out of staging without losing your edits, run:

```bash
git restore --staged poem.txt
```

This moves the file back to the working directory. Your changes are still there, but the file is no longer staged.

You can then decide to either edit it further or discard it completely using the previous command.

## Undoing a Committed Change

If you have already committed a change and want to go back, Git gives you two options depending on what you want to keep.

### Option 1: Keep the Changes

If you want to undo the commit but keep the changes in your file, run:

```bash
git reset --soft HEAD~1
```

This removes the last commit from your history but leaves your changes in the staging area. Nothing in your file is lost.

### Option 2: Remove the Changes Completely

If you want to undo the commit and completely remove the changes, run:

```bash
git reset --hard HEAD~1
```

This removes the last commit and deletes the changes from your file entirely. The file returns to the state it was in before that commit.

Use this option with care. Once you run it, the changes are gone.

## Seeing This in Practice

Open `poem.txt` and add a line you do not want to keep.

> 🖼️ _Image: poem.txt open in editor with an unwanted line added_

Run `git status` and you will see the file is modified but not staged.

> 🖼️ _Image: git status showing poem.txt as modified but not staged_

To remove that change, run:

```bash
git restore poem.txt
```

Now open the file again. The unwanted line is gone.

> 🖼️ _Image: poem.txt restored to its previous state_

Next, add a line, stage it, and then change your mind. Run:

```bash
git restore --staged poem.txt
```

> 🖼️ _Image: git status showing poem.txt back in the working directory after unstaging_

The file is no longer staged, but your edit is still in the file.

Finally, make a change, commit it, and then undo it with:

```bash
git reset --soft HEAD~1
```

> 🖼️ _Image: git log --oneline showing the commit has been removed_

Check your history with `git log --oneline` and you will see the last commit has been removed.

## Git Keeps You in Control

At every stage of your work, Git gives you a way out.

If you made a change you did not want, you can undo it. If you staged something by mistake, you can unstage it. If you committed too early, you can go back.

This is what makes Git safe to use. You can experiment, make mistakes, and always find your way back to a stable version of your work.

## Key Takeaways

- `git restore poem.txt` undoes unstaged changes and restores the last committed version
- `git restore --staged poem.txt` removes a file from staging without losing your edits
- `git reset --soft HEAD~1` removes the last commit but keeps your changes in staging
- `git reset --hard HEAD~1` removes the last commit and deletes the changes completely
