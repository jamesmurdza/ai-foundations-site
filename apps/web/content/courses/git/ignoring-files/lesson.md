## Ignoring Files

Right now, Git watches everything inside your project folder. That sounds helpful, but it becomes a problem very quickly.

Real projects contain files you never want to save. Some are created automatically by your computer or your tools. Some contain private information like passwords and keys. If you run `git add .`, all of them go straight into your history.

Git gives you a way to tell it what to leave alone.

### The Problem in Practice

Inside your project folder, create a file called `notes.txt` and put anything you like inside it. Treat it as a private scratch pad, something for your eyes only.

```
Ideas I am not ready to share yet
```

Now run:

```bash
git status
```

![git status showing notes.txt as untracked](/images/git/ignoring-files/git-status-untracked.png)

Git lists `notes.txt` as untracked. It is waiting for you to add it. If you run `git add .` right now, that private file joins your project history and gets pushed online later.

### Creating a .gitignore File

In your project folder, create a file named exactly `.gitignore`. The dot at the start is part of the name.

Inside it, add:

```
notes.txt
```

Save the file and run `git status` again.

![git status after saving .gitignore, notes.txt no longer listed](/images/git/ignoring-files/git-status-after-gitignore.png)

`notes.txt` has disappeared from the list. Git can still see the file on your computer, but it now knows to leave it alone. It will never be staged, never be committed, and never be uploaded.

### What Goes Inside a .gitignore

Each line is one thing to ignore. You can ignore a single file, a whole folder, or every file of a certain type.

```
notes.txt
node_modules/
.env
.DS_Store
*.log
```

Here is what each line means.

`notes.txt` ignores that one file.

`node_modules/` ignores an entire folder. The slash at the end means it is a folder. Projects that use JavaScript create this folder and it can hold thousands of files that nobody should ever commit.

`.env` ignores a file that usually holds passwords, API keys, and other secrets. This one matters most. Secrets pushed to GitHub are visible to anyone who finds them.

`.DS_Store` ignores a hidden file that macOS creates inside folders automatically. It has nothing to do with your project.

`*.log` ignores every file ending in `.log`. The `*` means "anything", so this covers `error.log`, `output.log`, and any other log file.

### Commit the .gitignore File

The `.gitignore` file itself should be saved into your project. That way anyone who works on the project gets the same rules.

```bash
git add .gitignore
git commit -m "ignore private notes and system files"
```

### One Important Limit

A `.gitignore` file only works on files Git is not already tracking.

If you commit a file first and add it to `.gitignore` afterwards, Git keeps tracking it. The rule arrives too late. This is why you should create your `.gitignore` early, ideally right after `git init`.

If it does happen, you can tell Git to stop tracking the file with:

```bash
git rm --cached notes.txt
```

The file stays on your computer. Git simply stops following it from that point forward. Commit that change and the `.gitignore` rule takes over.

### File State

**Before:**

Your project folder contains `poem.txt` and `notes.txt`. Git is watching both.

**After:**

Your project folder contains `poem.txt`, `notes.txt`, and `.gitignore`. Git is watching `poem.txt` and `.gitignore` only. `notes.txt` sits quietly on your computer, ignored.

```
.gitignore

notes.txt
node_modules/
.env
.DS_Store
*.log
```

### Key Takeaways

- A `.gitignore` file tells Git which files to leave alone
- Use it for secrets, system files, and folders created by your tools
- Create it early, because ignoring a file after committing it does not work
- Commit the `.gitignore` file so the rules travel with your project
