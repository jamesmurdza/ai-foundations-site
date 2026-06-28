Now that you know how to save versions of your work, the next step is understanding how to see and explore those saved versions.

Git does not just save your work. It keeps a full history of everything you have done.

## Understanding Git History

Every time you make a commit, Git stores it as part of a timeline. Each commit is like a point in time you can go back to. All commits together form a history of your project.

If you have been editing `poem.txt`, your history might look like this:

- add initial poem
- update second line

Each of these is a saved version that Git remembers.

## Viewing Your History

To see your project history, run:

```bash
git log
```

This shows a detailed list of all commits.

Each commit includes:

- a unique ID
- the message you wrote
- the time it was created

> 🖼️ _Image: I will add an image here showing the git log output_

## A Simpler View

The full history can feel a bit heavy at first. To make it easier to read, use:

```bash
git log --oneline
```

> 🖼️ _Image: I will add an image here showing the git log --oneline output_

This shows a shorter version of your history, with one line per commit.

## Visualizing the Timeline

To better understand how commits connect, run:

```bash
git log --graph
```

This gives you a visual structure of your history. It becomes more useful when working with branches later. You will learn more about this later in the course.

## Inspecting What Changed

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

For example, we add a new line to our poem.

> 🖼️ _Image: I will add the new line added to the poem_

When you run `git diff` you should see a similar output:

> 🖼️ _Image: I will add an image here showing the git diff output_

The image shows the removed line (in red) and the newly added line (green).

## Comparing with a Previous Version

You can also compare your current work with a past commit using the command below:

```bash
git diff <commit-id>
```

This shows the difference between now and that specific version. You can copy the commit id from `git log` or `git log --oneline`. It appears at the start of each line in the history output.

At this point, it should be clear that Git does not overwrite your work. It creates new versions each time you commit. Each version is stored permanently unless you remove it intentionally.

This means you can always:

- go back in time
- compare versions
- understand what changed

## Key Takeaways

- Commits form a timeline of your entire project
- `git log` shows your full history and `git log --oneline` makes it easier to read
- `git diff` shows exactly what changed in your files before committing
- You can always go back and compare any two versions of your work
