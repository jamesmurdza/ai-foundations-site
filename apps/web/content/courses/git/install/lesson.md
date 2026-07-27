## Installing Git

Before you can start using Git, you need to install it on your computer. The steps are slightly different depending on the type of system you are using.

Follow the instructions for your device below.

### Windows

To install Git on Windows:

1. Go to the official Git website: [https://git-scm.com](https://git-scm.com/)
2. Click on **Download for Windows**
3. Open the downloaded file to start installation

You will go through several setup screens. For most of them, you can simply click **Next** and keep the default options until you reach the screen below.

![Windows Git installer showing Git Bash selected](/images/git/install/git-bash-setup.png)

### Important Settings to Notice

- Make sure **Git Bash** is included in the installation
- When choosing a default editor, select something simple like:
  - Visual Studio Code (recommended)
  - Or Nano

Continue clicking **Next** until you see the **Install** button, then click it to complete the process.

After installation:

1. Open **Git Bash** (search for it in your system)
2. Type the command below and press Enter:

```bash
git --version
```

If you see a version number, Git has been installed successfully.

### Important for Windows Users

Windows gives you more than one terminal. You will see Command Prompt, PowerShell, and Git Bash. They look similar and they are not the same.

Use **Git Bash** for this entire course.

Git Bash understands the same commands as Mac and Linux, which means every command shown in this course will work for you exactly as written. Command Prompt and PowerShell handle some of them differently, and that difference is a common source of confusion for beginners.

Whenever a lesson says to open your terminal, open Git Bash.

You can open it in two ways. Search for **Git Bash** in your Start menu, or right click inside your project folder and choose **Open Git Bash here**. The second option is quicker, because it starts you off in the right folder.

![Windows right click menu showing Open Git Bash here](/images/git/install/git-bash-right-click.png)

### Mac

On macOS, the easiest way to install Git is by using a tool called **Homebrew**.

### Step 1: Open Terminal

- Press **Command (⌘) + Space**
- Type **Terminal**
- Open the application

### Step 2: Install Homebrew

Copy and paste this command into Terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Press Enter and follow the instructions.

> You may be asked to enter your password. Do not worry if you do not see anything while typing. This is normal.

### Step 3: Install Git

After Homebrew is installed, run:

```bash
brew install git
```

---

### Verify Installation

Run:

```bash
git --version
```

If a version number appears, you're good to go.

### Linux

To install Git on Linux, open your terminal and run the following command:

```bash
sudo apt install git
```

Once the installation is complete, verify it by running:

```bash
git --version
```

If you see a version number, Git is ready to use.
