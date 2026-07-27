## Undoing Changes

One of the most reassuring things about Git is that mistakes are not permanent. No matter what you change, Git gives you a way to go back and fix it safely.

This section covers how to undo changes at three different stages.

### The Three Stages Where Mistakes Can Happen

Changes in Git happen in stages, and the way you undo them depends on how far along the change has gone.

The three stages are:

1. **Unstaged changes.** You have edited the file but have not run `git add` yet.
2. **Staged changes.** You have run `git add` but have not committed yet.
3. **Committed changes.** You have already saved a version with `git commit`.

Each stage has its own approach.

### Undoing Unstaged Changes

Imagine you open `poem.txt` and start editing. You change a line or add something by mistake. You have not staged anything yet.

To undo those changes and return the file to the way it was in your last commit, run:

```bash
git restore poem.txt
```

This removes everything you just edited and brings back the last saved version of the file.

After running this command, your file will look exactly as it did before you started editing.

### Undoing Staged Changes

Now imagine you have edited `poem.txt` and already run `git add poem.txt`. The change is in the staging area, waiting to be committed.

If you want to take it out of staging without losing your edits, run:

```bash
git restore --staged poem.txt
```

This moves the file back to the working directory. Your changes are still there, but the file is no longer staged.

You can then decide to either edit it further or discard it completely using the previous command.

### Fixing the Last Commit

Sometimes you do not want to undo a commit at all. You just want to correct it.

Two situations come up constantly. You commit and then notice the message has a typo or is vaguer than you meant. Or you commit and then realize you forgot to stage one of the files you meant to include.

Git has a single command for both. It replaces your last commit with a corrected one.

#### Correcting the Message

Run `git log --oneline` and look at your most recent commit.

To rewrite that message, run:

```bash
git commit --amend -m "add stanza about pausing to review"
```

![git commit --amend replacing the last commit message](/images/git/undoing-changes/git-commit-amend.gif)

Run `git log --oneline` again. The old message is gone and the new one is in its place. The number of commits has not changed. Your files have not changed either.

Git did not add a commit here. It swapped the last one for a corrected version.

#### Adding a Forgotten File

The second situation works the same way.

Imagine you meant to include two files in a commit but only staged one. Stage the file you missed, then run:

```bash
git add the-file-you-forgot.txt
git commit --amend --no-edit
```

`--no-edit` tells Git to keep the existing message and only update the contents. Without it, Git opens your editor and asks whether you want to change the message too.

The forgotten file is now part of that commit, exactly as if you had staged it the first time.

#### The One Rule

Amending replaces a commit rather than adding to it. That makes it a form of rewriting history, the same as `git reset`.

So the rule from the previous section applies here too. Amend freely while a commit only exists on your computer. Once you have sent it to GitHub, leave it alone and make a new commit instead.

### Undoing a Committed Change

If you have already committed a change and want to go back, Git gives you two options depending on what you want to keep.

#### Option 1: Keep the Changes

If you want to undo the commit but keep the changes in your file, run:

```bash
git reset --soft HEAD~1
```

This removes the last commit from your history but leaves your changes in the staging area. Nothing in your file is lost.

#### Option 2: Remove the Changes Completely

If you want to undo the commit and completely remove the changes, run:

```bash
git reset --hard HEAD~1
```

This removes the last commit and deletes the changes from your file entirely. The file returns to the state it was in before that commit.

Use this option with care. Once you run it, the changes are gone.

#### Option 3: Undo the Commit Without Removing It

Both reset commands work by erasing a commit from your history. That is fine while the commit only exists on your computer.

It becomes a problem once you have shared that commit with other people. Later in this course you will learn to send your work to GitHub. When a commit has already been shared, erasing it from your history means your version of the story no longer matches theirs, and Git will start complaining when you try to sync.

For those commits, there is a safer option:

```bash
git revert HEAD
```

This does not delete anything. Git looks at the commit you named, works out the opposite of it, and adds a brand new commit that cancels it out.

Your file ends up in the state you wanted. Your history keeps both the original commit and the one that undid it. Nothing disappears, so nobody else gets confused.

`HEAD` simply means the most recent commit. To undo an older commit, use its id from `git log --oneline` instead:

```bash
git revert <commit-id>
```

Git will open your editor with a message already written for you. You can accept it as it is. If Nano opens, press `Ctrl + O` then `Enter` to save, then `Ctrl + X` to exit.

#### Choosing Between Reset and Revert

The rule is short and worth remembering.

If the commit only exists on your computer, `git reset` is fine.

If the commit has already been shared with anyone, use `git revert`.

When you are unsure, choose `git revert`. It is always safe, because it never removes anything.

### Seeing This in Practice

Open `poem.txt` and add the next stanza at the end. Treat this as a change you are not ready to keep:

```
A second verse began to grow
Not perfect yet, but more to show
```

Run `git status` and you will see the file is modified but not staged.

To remove that change, run:

```bash
git restore poem.txt
```

Now open the file again. The stanza is gone. The file is back to the version before you added it.

![git restore removing the stanza from poem.txt](/images/git/undoing-changes/git-restore.gif)

Next, open `poem.txt` and add the same stanza again:

```
A second verse began to grow
Not perfect yet, but more to show
```

Stage it with `git add poem.txt`, then change your mind. Run:

```bash
git restore --staged poem.txt
```

The file is no longer staged, but the stanza is still in the file.

Finally, open `poem.txt` and add the stanza one more time:

```
A second verse began to grow
Not perfect yet, but more to show
```

Commit it with:

```bash
git add poem.txt
git commit -m "add verse about growth"
```

Then undo it with:

```bash
git reset --soft HEAD~1
```

![git log --oneline after reset, the commit is gone](/images/git/undoing-changes/git-log-after-reset.png)

Check your history with `git log --oneline` and you will see the last commit has been removed.

Now try the safe version. Commit the stanza one more time:

```bash
git add poem.txt
git commit -m "add verse about growth"
```

Then undo it with:

```bash
git revert HEAD
```

![git log --oneline after revert, original commit still listed with revert commit above](/images/git/undoing-changes/git-log-after-revert.png)

Open `poem.txt` and the stanza is gone, exactly as before. Now run `git log --oneline` and look at the difference. The commit you made is still listed, and a new commit sits above it saying it was reverted.

That is the whole distinction. Reset hides the mistake. Revert records that you fixed it.

### Git Keeps You in Control

At every stage of your work, Git gives you a way out.

If you made a change you did not want, you can undo it. If you staged something by mistake, you can unstage it. If you committed too early, you can go back.

This is what makes Git safe to use. You can experiment, make mistakes, and always find your way back to a stable version of your work.

### Key Takeaways

- `git restore poem.txt` undoes unstaged changes and restores the last committed version
- `git restore --staged poem.txt` removes a file from staging without losing your edits
- `git commit --amend` corrects the last commit instead of undoing it
- `git reset --soft HEAD~1` removes the last commit but keeps your changes in staging
- `git reset --hard HEAD~1` removes the last commit and deletes the changes completely
- `git revert HEAD` cancels a commit by adding a new one, which keeps your history intact
- Use reset for commits only on your computer and revert for commits you have shared
