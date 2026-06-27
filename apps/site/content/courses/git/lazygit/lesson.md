Everything you have learned so far has been done through the terminal by typing commands. That approach works, and it is important to understand it. But there is a tool that makes working with Git easier to see and follow, especially when you are still building confidence.

That tool is LazyGit.

## What LazyGit Is

LazyGit is a visual interface for Git that runs inside your terminal. Instead of typing commands one by one, you can see your files, history, and branches all at once and interact with them using your keyboard.

It does not replace Git. It uses Git underneath. Every action you take in LazyGit is the same as running a command you already know.

## LazyGit Is Optional

Before going further, it is worth being clear about this.

You do not need LazyGit to continue this course. Everything you have learned so far still works exactly the same. LazyGit is simply a tool that makes Git easier to use visually. If you prefer typing commands, that is completely fine.

## Installing LazyGit

Follow the instructions for your system below.

### Mac

Open Terminal and run:

```bash
brew install lazygit
```

> 🖼️ _Image: terminal after running brew install lazygit_

### Windows

Go to the official LazyGit releases page on GitHub and download the latest installer for Windows. Run the downloaded file to complete the installation.

> 🎥 _Video: downloading and installing LazyGit on Windows_

### Linux

Open your terminal and run:

```bash
sudo apt install lazygit
```

Once installation is complete, verify it by running:

```bash
lazygit --version
```

> 🖼️ _Image: terminal showing lazygit version after installation_

## Opening LazyGit

To open LazyGit, navigate to your project folder in the terminal and run:

```bash
lazygit
```

> 🖼️ _Image: LazyGit interface opening inside the project folder_

LazyGit will only work inside a folder that is already a Git project. Since you have been working with `poem.txt` throughout this course, your folder is already set up. Just open it and run the command.

## Understanding the Interface

When LazyGit opens, you will see several panels on the screen. It can look like a lot at first, but you do not need to understand everything immediately. Focus on the parts that connect to what you already know.

> 🖼️ _Image: full LazyGit interface with panels visible_

### The Files Panel

The panel on the left shows your changed files. This is the same information that `git status` gives you in the terminal. Any file you have edited but not yet staged will appear here.

> 🖼️ _Image: files panel highlighted with a modified poem.txt visible_

### Staging a File

To stage a file, move the cursor to it using the arrow keys and press the spacebar.

This is the same as running `git add poem.txt` in the terminal.

> 🎥 _Video: selecting poem.txt and pressing spacebar to stage it_

You will see the file move from the unstaged section to the staged section. The visual feedback makes it easy to confirm that the file is ready to commit.

### Making a Commit

To commit your staged changes, press `c`. A prompt will appear asking for a commit message. Type your message and press Enter to save.

This is the same as running `git commit -m "your message"` in the terminal.

> 🎥 _Video: typing a commit message and confirming in LazyGit_

### The Commit History Panel

One of the panels shows a list of your past commits. This is the same information that `git log` gives you. You can scroll through your history and see when each change was made.

> 🖼️ _Image: commit history panel showing previous commits for poem.txt_

### Switching Branches

LazyGit has a panel dedicated to branches. To switch to a different branch, move to that panel, select the branch you want, and press Enter.

This is the same as running `git switch branch-name` in the terminal.

> 🎥 _Video: selecting a branch and switching to it in LazyGit_

### Merging a Branch

To merge a branch, navigate to the branch you want to merge from and press `M`. LazyGit will carry out the merge and show you the result.

This is the same as running `git merge branch-name` in the terminal.

> 🎥 _Video: merging a branch inside LazyGit_

If there is a conflict, LazyGit will highlight it clearly and give you tools to resolve it without leaving the interface.

> 🖼️ _Image: LazyGit showing a merge conflict with both versions visible_

## A Quick Demo with poem.txt

To tie everything together, here is a simple workflow using LazyGit and the project you have already been working on.

Open your project folder and run `lazygit` to open the interface.

Edit `poem.txt` and add or change a line. You will see the file appear in the files panel.

> 🖼️ _Image: poem.txt appearing as modified in the LazyGit files panel_

Select the file and press spacebar to stage it.

> 🎥 _Video: staging poem.txt in LazyGit_

Press `c`, type a commit message, and press Enter to commit.

> 🎥 _Video: committing the change in LazyGit_

Switch to your `new-idea` branch using the branches panel, then switch back to `main`. Notice how the file contents change just as they did when using commands.

> 🎥 _Video: switching between branches and seeing poem.txt change_

Merge `new-idea` into `main` using the merge action.

> 🎥 _Video: completing the merge inside LazyGit_

Every step you just completed in LazyGit is something you already understood from the previous sections. LazyGit did not introduce anything new. It simply gave you a visual way to do the same things.

## Why LazyGit Helps

LazyGit lets you see your whole project at once. Your files, your history, and your branches are all visible at the same time.

It removes the need to remember every command. When you can see your options on screen, you do not have to recall the exact syntax for each one.

It makes it easier to catch mistakes before they happen. Seeing staged and unstaged files side by side helps you commit exactly what you intend to.

## Commands or LazyGit

Both approaches do the same thing. Typing commands and using LazyGit are two ways of working with the same tool.

Some people prefer the speed of commands. Others prefer the visual overview of LazyGit. Many people use both depending on what they are doing.

What matters most is that you understand how Git works. LazyGit is only useful because you already know what staging, committing, branching, and merging mean. The tool makes the actions easier to perform, but the understanding has to come first.

## Key Takeaways

- LazyGit is a visual interface for Git that runs inside your terminal
- Every action in LazyGit is the same as a Git command you already know
- Press space to stage, `c` to commit and `P` to push
- LazyGit is optional; CLI commands remain the primary approach
