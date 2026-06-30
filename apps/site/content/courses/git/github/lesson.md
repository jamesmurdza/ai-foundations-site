## The Problem

You now understand what a remote is. You need somewhere to host it. That place needs to be reliable, accessible from anywhere, and easy to use. Setting this up manually would be complicated. This is the problem GitHub solves.

## The Idea

GitHub is a platform where you can store your Git projects online.

It is not Git itself. Git is the tool that runs on your computer and tracks changes. GitHub is a website that hosts your Git repositories so they are available anywhere, to anyone you choose.

Think of it this way. Git is your notebook. GitHub is the filing cabinet where you keep it safe and share it when needed.

GitHub is free to use and is where most developers store their work.

## The Action

### Step 1: Create a GitHub Account

Go to GitHub and create a free account.

> 🖼️ _Image: GitHub homepage with sign up button visible_

Click **Sign up** and fill in:

- Your email address
- A username (this will be visible to others, choose something simple)
- A password

> 🖼️ _Image: GitHub signup form_

Follow the steps to verify your email. Once that is done, your account is ready.

> 🖼️ _Image: GitHub dashboard after signing in_

### Step 2: Create a New Repository

A repository on GitHub is where your project will live. Think of it as a folder on GitHub that holds your project and its full history.

From your GitHub dashboard, click **New** or the plus icon at the top right and select **New repository**.

> 🖼️ _Image: GitHub new repository button_

Fill in the details:

- **Repository name:** give it a simple name that matches your project, for example `my-poem`
- **Visibility:** choose **Public** if you want others to see it, or **Private** if you want to keep it to yourself

> 🖼️ _Image: repository creation form with name and visibility options_

**Important:** do not check the box that says "Initialize this repository with a README." You already have a local project with commits. If you add a README here, GitHub will create a commit you do not have locally, and that will cause a conflict when you try to push.

Click **Create repository**.

> 🖼️ _Image: empty repository page on GitHub with the push instructions visible_

### Step 3: Connect Your Local Project

GitHub will show you a set of commands right on the page. Look for the section that says "push an existing repository from the command line."

Copy the `git remote add origin` command and run it in your terminal inside your project folder:

```bash
git remote add origin https://github.com/your-username/my-poem.git
```

> 🖼️ _Image: terminal after running git remote add origin_

This connects your local project to the GitHub repository. They are now linked.

### Step 4: Push Your Work

Now send your commits to GitHub:

```bash
git push -u origin main
```

> 🎥 _Video: terminal showing the push completing with progress output_

Git will upload your project. If this is your first time pushing, you may be asked to log in to GitHub. Follow the prompts to authenticate.

### Step 5: See Your Project on GitHub

Go back to your browser and refresh the repository page.

> 🖼️ _Image: GitHub repository page showing poem.txt uploaded_

Your `poem.txt` file is now visible. Click on it to see the contents.

> 🖼️ _Image: poem.txt file contents viewed on GitHub_

This is your project living on the internet, safely stored and accessible from any device.

### Step 6: Make a Change and Push Again

Open `poem.txt` locally and add a new line to the poem.

```bash
git add poem.txt
git commit -m "add new line to poem"
git push
```

> 🖼️ _Image: terminal showing git push after the new commit_

Refresh GitHub. The new line is there. Your remote is now in sync with your local project.

### Step 7: Pulling Changes

If you ever make a change directly on GitHub (for example by editing a file in the browser), you can bring it down to your local project with:

```bash
git pull
```

> 🖼️ _Image: terminal showing git pull fetching the change made on GitHub_

Your local `poem.txt` will update to match whatever is on the remote.

## 🖥️ Alternative: LazyGit

After connecting your remote, LazyGit shows you the remote status alongside your local branches.

To push from LazyGit, press `P`. To pull, press `p`.

> 🎥 _Video: pushing to GitHub from LazyGit after a new commit_

The same results happen. The commands run in the background. LazyGit just gives you a cleaner way to trigger them.

## What Just Happened

You created a GitHub account and a new repository. You connected your local Git project to that repository using `git remote add origin`. You pushed your commits, and GitHub received them and displayed your files.

Every time you commit locally and push, GitHub updates. Every time someone (or you on another device) makes a change on the remote and you pull, your local project updates.

Your project now lives in two places and stays in sync.

## File State

**Before:**

`poem.txt` exists only on your computer. No remote connection. If your machine fails, the work is lost.

**After:**

`poem.txt` exists locally and on GitHub. You can view it in your browser, share the link, and access it from any device.

```
The wind moves slowly through the trees,
A quiet sound that puts me at ease.
Each branch that sways, each leaf that falls,
Reminds me nature softly calls.
A new line added after pushing again.
```

## Key Takeaways

- GitHub is a platform for hosting Git repositories online
- Creating a repository on GitHub and connecting it with `git remote add origin` links your local work to the cloud
- `git push` sends your local commits to GitHub
- `git pull` brings changes from GitHub into your local project
- Do not initialize a new GitHub repository with a README when you already have local commits
