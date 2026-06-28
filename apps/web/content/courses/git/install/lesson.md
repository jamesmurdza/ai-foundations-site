Before you can start using Git, you need to install it on your computer. The steps are slightly different depending on the type of system you are using.

Follow the instructions for your device below.

## Windows

To install Git on Windows:

1. Go to the official Git website: [https://git-scm.com](https://git-scm.com/)
2. Click on **Download for Windows**
3. Open the downloaded file to start installation

You will go through several setup screens. For most of them, you can simply click **Next** and keep the default options until you reach the screen below.

> 🖼️ *Image: I will add an image here*

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

## Mac

On macOS, the easiest way to install Git is by using a tool called **Homebrew**.

### Step 1: Open Terminal

- Press **Command (⌘) + Space**
- Type **Terminal**
- Open the application

> 🖼️ *Image: macOS Terminal Opened*

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

### Verify Installation

Run:

```bash
git --version
```

If a version number appears, you're good to go.

## Linux

To install Git on Linux, open your terminal and run the following command:

```bash
sudo apt install git
```

Once the installation is complete, verify it by running:

```bash
git --version
```

If you see a version number, Git is ready to use.
