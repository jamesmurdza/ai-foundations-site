## Reading History

Now that you know how to save versions of your work, the next step is understanding how to see and explore those saved versions.

Git does not just save your work. It keeps a full history of everything you have done.

### Understanding Git History

Every time you make a commit, Git stores it as part of a timeline. Each commit is like a point in time you can go back to. All commits together form a history of your project

If you have been following along, your history so far might look like this:

- add initial poem
- add second stanza
- ignore private notes and system files

Each of these is a saved version that Git remembers.

### Viewing Your History

To see your project history, run:

```bash
git log
```

This shows a detailed list of all commits.

Each commit includes:

- a unique ID
- the message you wrote
- the time it was created

![full git log output showing commit ids, author and dates](/images/git/reading-history/git-log-full.png)

### Getting Out of the History View

When your history is long, Git does not print everything at once. It opens a viewer that shows one screen at a time. You will know you are inside it because the bottom of the screen shows a colon `:` and your typing does nothing.

This is not a freeze. Git is waiting for you.

- Press the down arrow or `Enter` to scroll through the history
- Press `q` to quit and return to your normal terminal

Remember `q`. The same viewer opens for `git diff` and several other commands, and `q` always closes it.

### A Simpler View

The full history can feel a bit heavy at first. To make it easier to read, use:

```bash
git log --oneline
```

![git log --oneline showing one line per commit](/images/git/reading-history/git-log-oneline.png)

This shows a shorter version of your history, with one line per commit.

### Visualizing the Timeline

To better understand how commits connect, run:

```bash
git log --graph
```

This gives you a visual structure of your history. It becomes more useful when working with branches later. You will learn more about this later in the course.

### Inspecting What Changed

Seeing commit messages is helpful, but sometimes you need to see the exact lines that changed.

This is where `git diff` comes in.

If you edit `poem.txt` but have not committed yet, run:

```bash
git diff
```

This shows the exact changes you made.

You will see:

- removed lines
- added lines

For example, open `poem.txt` and add the next stanza at the end:

```
I paused and looked, then tried again
Rewriting lines again and again
```

When you run `git diff` you should see a similar output

![git diff output with the new stanza in green](/images/git/reading-history/git-diff-output.png)

The image shows the new lines in green. Lines you removed would appear in red.

### Seeing What You Have Already Staged

There is one moment that confuses almost every beginner. You make a change, you run `git add poem.txt`, then you run `git diff` and Git shows you nothing at all.

Nothing is broken. `git diff` only shows changes that are still sitting in your working directory. Once you stage a change, it leaves that area, so there is nothing left for `git diff` to report.

To see what is waiting in the staging area, run:

```bash
git diff --staged
```

![git add then git diff shows nothing then git diff --staged shows the stanza](/images/git/reading-history/git-diff-staged.gif)

Try it now. Run `git add poem.txt`, then run `git diff` and see the empty result. Then run `git diff --staged` and watch your stanza appear.

The two commands answer two different questions. `git diff` shows what you have changed but not staged yet. `git diff --staged` shows what you have staged but not committed yet. Running both tells you exactly what will go into your next commit.

Remember to press `q` if the viewer opens and holds the screen.

After reviewing the diff, commit the stanza to save it:

```bash
git commit -m "add stanza about reviewing work"
```

### Comparing with a Previous Version

You can also compare your current work with a past commit with the command below

```bash
git diff <commit-id>
```

This shows the difference between now and that specific version. You can copy the commit id from `git log` or `git log --oneline`. It appears at the start of each line in the history output.

At this point, it should be clear that git does not overwrite your work. It creates new versions each time you commit. Each version is stored permanently unless you remove it intentionally

This means you can always:

- go back in time
- compare versions
- understand what changed

### Key Takeaways

- Commits form a timeline of your entire project
- `git log` shows your full history and `git log --oneline` makes it easier to read
- Press `q` to leave the history or diff viewer and get your terminal back
- `git diff` shows unstaged changes and `git diff --staged` shows what is ready to commit
- You can always go back and compare any two versions of your work
