## Staging and Committing

Now that Git is installed and set up, the next step is to understand how Git actually tracks and saves your work.

At this point, think of Git as a system that does not automatically save everything you do. Instead, it gives you control over what gets saved and when.

### Creating Your First Project

Start by creating a simple file with some text in it. In this course, we will use a file called `poem.txt`.

Here is what to put inside `poem.txt` when you first create it:

```
I started small with just a line
A quiet thought, a simple sign
```

![poem.txt open in the editor with its first two lines](/images/git/staging-committing/poem-initial.png)

You can create it in any way you prefer, but the important thing is that you have a file with some text inside.

### Terminal Basics (Optional)

Before running any Git command, you need to be inside the correct folder in your terminal.

The terminal is a text-based way to interact with your computer. Instead of clicking folders, you type commands to move around.

To move into a folder, run:

```bash
cd folder-name
```

Replace `folder-name` with the actual name of your folder. For example, if your project is in a folder called `my-poem`, type `cd my-poem` and press Enter.

To see what is inside your current folder, run:

```bash
ls
```

This lists all the files and folders at your current location. Use it to confirm you are in the right place.

[//]: # (TODO: 🎥 VIDEO: short terminal tour covering cd, ls, and finding your project folder)

Once you are inside your project folder, you are ready to continue.

---

Once your file is ready and your terminal is open inside the correct folder, run:

```bash
git init
```

![terminal showing the git init confirmation message](/images/git/staging-committing/git-init.png)

This command turns your folder into a Git project. From this moment, Git begins to watch what happens inside this folder.

### Understanding How Git Sees Your Work

Git organizes your work into three main areas.

1. The **working directory** is where you are actively editing your files. This is where `poem.txt` lives and where you make changes.
2. The **staging area** is where you prepare changes before saving them. It is like selecting what you want to include in your next save.
3. The **repository** is where Git permanently stores saved versions of your work.

A simple way to think about it is this:

You write in your file(working directory), you choose what to save(staging area), and then Git stores it as a version(repository).

### Checking the State of Your Project

To check the state of your project, use `git status` It helps you see what files Git is tracking, what has changed, and what is ready to be saved.

To see what Git is tracking, run:

```bash
git status
```

At this point, Git will tell you that your file is **untracked**. This simply means Git sees the file, but is not yet tracking it as part of your project history.

Git uses four simple states to describe where a file stands:

- **Untracked** means Git has not started tracking the file yet
- **Modified** means the file has changed since the last commit
- **Staged** means the file is prepared and ready to be committed
- **Committed** means the file has been saved into the project history

You will see each of these states as you work through the course.

![git status showing poem.txt as untracked](/images/git/staging-committing/git-status-untracked.png)

### Staging Your File

Before Git can save your file, you need to tell it what to include. This process is called **staging**.

To stage your file, run:

```bash
git add poem.txt
```

If you want to stage everything in the folder, you can use:

```bash
git add .
```

Staging does not save your work yet. It only prepares it.

Think of it as selecting items before clicking a save button.

### Making Your First Commit

Once your file is staged, you can save it using a commit.

Run:

```bash
git commit -m "add initial poem"
```

The text inside the quotes is called the **commit message**. It describes what changed in this version.

A commit is a **saved version of your project at a specific moment**. It acts like a checkpoint that you can always return to.

![git commit output showing files changed](/images/git/staging-committing/git-commit-output.png)

### Making Changes and Saving Again

Now open `poem.txt` and add the next stanza at the end of the file:

```
I wrote it down, then changed a word
It felt unsure, it felt absurd
```

After saving, run:

```bash
git status
```

You will notice that Git now shows the file as **modified**. This means something has changed since your last saved version.

![git status showing poem.txt as modified](/images/git/staging-committing/git-status-modified.png)

To save this new version, repeat the same process:

```bash
git add poem.txt
git commit -m "add second stanza"
```

[//]: # (TODO: 🎞️ GIF: the whole loop in one take, edit poem.txt, git add, git status, git commit)

Each commit creates a new version of your work.

> You would notice the message in our terminal is getting longer and it contains details we no longer need. To fix this, you need to run `clear` to clean the messages.

### Why Staging Exists

You might wonder why Git does not just save everything automatically.

The reason is control.

Staging allows you to choose exactly what goes into each version. This becomes very useful when you are working on multiple changes and only want to save specific ones.

For now, just understand that staging helps you prepare clean and meaningful saves.

### Writing Good Commit Messages

Every commit includes a message that describes what was changed.

A good commit message should be clear and direct. It should describe the change in a simple way.

For example:

Good messages:

- add initial poem
- update second line of poem
- fix spelling mistake in poem

Avoid messages like:

- update
- change
- stuff

> Git already records exactly which lines changed. You can see that at any time. What Git cannot record is your reason for making the change. When the reason is not obvious, put it in the message. Something like `shorten opening line so it reads better out loud` is far more useful later than `update poem`.

Keep the message short. One clear line is enough.

### A Simple Introduction to Conventional Commits

As you continue learning, you may see commit messages written like this:

- feat: add new stanza
- fix: correct spelling error

This style is called **conventional commits**. It helps keep commit messages organized, especially in team environments.

For now, you do not need to master it. Just focus on writing clear messages.

So far, the pattern has been to edit your file in the working area, stage the changes you want to save, and commit them to create a version. Each commit becomes a checkpoint you can return to at any time.

### Key Takeaways

- `git init` turns your folder into a Git project
- `git status` shows the current status of your project
- `git add` stages a file and `git commit -m "message"` saves it as a version
- Every commit is a checkpoint you can always return to
- Write clear commit messages that explain the reason for the change
