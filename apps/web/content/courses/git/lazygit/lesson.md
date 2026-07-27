## LazyGit

Everything you have learned so far has been done through the terminal by typing commands. That approach works, and it is important to understand it. But there is a tool that makes working with Git easier to see and follow, especially when you are still building confidence.

That tool is LazyGit.

### What LazyGit Is

LazyGit is a visual interface for Git that runs inside your terminal. Instead of typing commands one by one, you can see your files, history, and branches all at once and interact with them using your keyboard.

It does not replace Git. It uses Git underneath. Every action you take in LazyGit is the same as running a command you already know.

### LazyGit Is Optional

Before going further, it is worth being clear about this.

You do not need LazyGit to continue this course. Everything you have learned so far still works exactly the same. LazyGit is simply a tool that makes Git easier to use visually. If you prefer typing commands, that is completely fine.

### Installing LazyGit

Follow the instructions for your system below.

#### Mac

Open Terminal and run:

```bash
brew install lazygit
```

#### Windows

Go to the official LazyGit releases page on GitHub and download the latest installer for Windows. Run the downloaded file to complete the installation.

#### Linux

LazyGit is not included in the standard Ubuntu package list, so `sudo apt install lazygit` will not find it. Use one of the two options below instead.

The simplest option is snap:

```bash
sudo snap install lazygit
```

If snap is not available on your system, download the latest release directly:

```bash
LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": *"v\K[^"]*')
curl -Lo lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz"
tar xf lazygit.tar.gz lazygit
sudo install lazygit -D -t /usr/local/bin/
```

That looks like a lot, but it is only four steps. It finds the latest version, downloads it, unpacks it, and moves it somewhere your terminal can find.

Once installation is complete, verify it by running:

```bash
lazygit --version
```

### Opening LazyGit

To open LazyGit, navigate to your project folder in the terminal and run:

```bash
lazygit
```

LazyGit will only work inside a folder that is already a Git project. Since you have been working with `poem.txt` throughout this course, your folder is already set up. Just open it and run the command.

To quit LazyGit at any time, press `q`.

### Understanding the Interface

When LazyGit opens, you will see several panels on the screen. It can look like a lot at first, but you do not need to understand everything immediately. Focus on the parts that connect to what you already know.

You navigate between panels using the number keys or Tab. Inside a panel, use the arrow keys to move between items.

![full LazyGit interface with panels labeled](/images/git/lazygit/lazygit-interface.png)

#### The Files Panel

The panel on the left shows your changed files. This is the same information that `git status` gives you in the terminal. Any file you have edited but not yet staged will appear here.

#### Staging a File

To stage a file, move the cursor to it using the arrow keys and press the spacebar.

This is the same as running `git add poem.txt` in the terminal.

You will see the file move from the unstaged section to the staged section. The visual feedback makes it easy to confirm that the file is ready to commit.

[//]: # (TODO: 🎞️ GIF: selecting poem.txt and pressing spacebar to stage it)

#### Making a Commit

To commit your staged changes, press `c`. A prompt will appear asking for a commit message. Type your message and press Enter to save.

This is the same as running `git commit -m "your message"` in the terminal.

[//]: # (TODO: 🎞️ GIF: typing a commit message and confirming in LazyGit)

#### The Commit History Panel

One of the panels shows a list of your past commits. This is the same information that `git log` gives you. You can scroll through your history and see when each change was made.

#### Switching Branches

LazyGit has a panel dedicated to branches. To switch to a different branch, move to that panel, select the branch you want, and press Enter.

This is the same as running `git switch branch-name` in the terminal.

[//]: # (TODO: 🎞️ GIF: selecting a branch and switching to it in LazyGit)

#### Merging a Branch

To merge a branch, navigate to the branch you want to merge from and press `M`. LazyGit will carry out the merge and show you the result.

This is the same as running `git merge branch-name` in the terminal.

If there is a conflict, LazyGit will highlight it clearly and give you tools to resolve it without leaving the interface.

### A Quick Demo with poem.txt

To tie everything together, here is a simple workflow using LazyGit and the project you have already been working on.

Open your project folder and run `lazygit` to open the interface.

Edit `poem.txt` and add or change a line. You will see the file appear in the files panel.

Select the file and press spacebar to stage it.

Press `c`, type a commit message, and press Enter to commit.

Switch to another branch using the branches panel, then switch back to `main`. Notice how the file contents change just as they did when using commands.

[//]: # (TODO: 🎞️ GIF: full workflow in LazyGit, stage, commit, switch branch, switch back)

Every step you just completed in LazyGit is something you already understood from the previous sections. LazyGit did not introduce anything new. It simply gave you a visual way to do the same things.

### Why LazyGit Helps

LazyGit lets you see your whole project at once. Your files, your history, and your branches are all visible at the same time.

It removes the need to remember every command. When you can see your options on screen, you do not have to recall the exact syntax for each one.

It makes it easier to catch mistakes before they happen. Seeing staged and unstaged files side by side helps you commit exactly what you intend to.

### Commands or LazyGit

Both approaches do the same thing. Typing commands and using LazyGit are two ways of working with the same tool.

Some people prefer the speed of commands. Others prefer the visual overview of LazyGit. Many people use both depending on what they are doing.

What matters most is that you understand how Git works. LazyGit is only useful because you already know what staging, committing, branching, and merging mean. The tool makes the actions easier to perform, but the understanding has to come first.

### Key Takeaways

- LazyGit is a visual interface for Git that runs inside your terminal
- Every action in LazyGit is the same as a Git command you already know
- Press space to stage, `c` to commit, `q` to quit
- Navigate between panels with Tab or number keys
- LazyGit is optional — CLI commands remain the primary approach
