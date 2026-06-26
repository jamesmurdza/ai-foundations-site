## The Problem

You have pushed your work to GitHub. Your project is online and safe.

Now imagine you want to make a change to the poem. You could just edit it directly on the `main` branch and push. But when collaborating, that approach causes problems. Changes can overwrite each other. Mistakes go straight into the main version. There is no moment to review before something is added.

You need a way to propose a change, review it, and then decide whether to add it. That is exactly what a Pull Request gives you.

## The Idea

A Pull Request is a way to say: "Here are my changes. Take a look before we add them to the main version."

You make your changes on a separate branch. You push that branch to GitHub. Then you open a Pull Request. This creates a space on GitHub where the changes can be seen, compared, and discussed before anything is merged.

Think of it as sending a draft for review before publishing. Nothing changes on `main` until you choose to merge.

Pull Requests are at the heart of how teams work with Git. They protect the main branch, keep history clean, and give everyone a chance to review work before it becomes permanent.

## The PR Lifecycle

Every Pull Request follows the same simple flow:

1. Create a new branch
2. Make your changes and commit them
3. Push the branch to GitHub
4. Open a Pull Request on GitHub
5. Review the changes
6. Merge the Pull Request into main

Each step builds on the last. Nothing happens all at once.

## The Action

### Step 1: Start from Main

Make sure you are on the `main` branch and your project is up to date.

```bash
git switch main
git pull
```

> 🖼️ _Image: terminal confirming switch to main and pull output_

### Step 2: Create a New Branch

Create a branch for your changes. Give it a clear name that describes what you are adding.

```bash
git branch add-final-stanza
git switch add-final-stanza
```

> 🖼️ _Image: terminal confirming creation of and switch to add-final-stanza branch_

### Step 3: Edit poem.txt

Open `poem.txt` and add a new stanza at the end.

> 🖼️ _Image: poem.txt open in editor with the new stanza added_

After the edit, your file should look like this:

```
The wind moves slowly through the trees,
A quiet sound that puts me at ease.
Each branch that sways, each leaf that falls,
Reminds me nature softly calls.
A new line added after pushing again.

The sky grows dark, the stars appear,
A gentle night that pulls me near.
```

### Step 4: Stage and Commit

```bash
git add poem.txt
git commit -m "add final stanza to poem"
```

> 🖼️ _Image: terminal after staging and committing the new stanza_

### Step 5: Push the Branch

Send the branch to GitHub:

```bash
git push -u origin add-final-stanza
```

> 🖼️ _Image: terminal showing git push output for the new branch_

Your branch is now on GitHub, but the `main` branch has not changed yet.

### Step 6: Open a Pull Request on GitHub

Go to your repository on GitHub. You will see a banner that says your branch was recently pushed and offers a button to open a Pull Request. Click it.

> 🖼️ _Image: GitHub repository page showing the "Compare and pull request" banner_

You will be taken to the Pull Request creation screen. Fill in:

- A short title describing the change, for example: `add final stanza to poem`
- An optional description if you want to explain the change

> 🖼️ _Image: Pull Request creation screen on GitHub showing the title field and description_

Click **Create pull request**.

> 🖼️ _Image: the newly created Pull Request page on GitHub_

### Step 7: Review the Changes

On the Pull Request page, click the **Files changed** tab. This shows exactly what was added or removed.

> 🖼️ _Image: Pull Request Files Changed tab showing the new stanza highlighted in green_

Lines added appear in green. Lines removed appear in red. This view makes it easy to see what the change actually does before merging.

This is the review step. In a team setting, this is where collaborators can leave comments or approve the work. For your own project, it is still a useful moment to confirm the change looks right.

### Step 8: Merge the Pull Request

Go back to the main tab of the Pull Request. When you are ready, click **Merge pull request** and then **Confirm merge**.

> 🖼️ _Image: Merge pull request button visible on GitHub_

> 🖼️ _Image: confirmation screen after clicking Merge pull request_

The changes are now part of `main`. GitHub will show a message confirming the merge.

### Step 9: Update Your Local Project

Back in your terminal, switch to `main` and pull the merged changes:

```bash
git switch main
git pull
```

> 🖼️ _Image: terminal showing git pull after the merge, with the new commit listed_

Open `poem.txt` locally. The final stanza is now part of `main`.

## Important: Work on Branches, Not Main

This is one of the most important habits to build.

When you are working with others, or even when working alone on a real project, you should not make changes directly on `main`. Use a branch for every change. Open a Pull Request. Merge when it is ready.

This keeps `main` stable. It gives you a chance to review before anything is permanent. It also makes your project history easier to follow.

## CLI Alternative: gh pr create

If you prefer to stay in the terminal, you can open a Pull Request using the GitHub CLI tool called `gh`.

First, make sure the GitHub CLI is installed. To install it on Mac, run:

```bash
brew install gh
```

On Windows, download it from the official GitHub CLI page. On Linux, run:

```bash
sudo apt install gh
```

Then authenticate by running:

```bash
gh auth login
```

Follow the prompts to connect to your GitHub account.

Once set up, after pushing your branch, you can create a Pull Request directly from the terminal:

```bash
gh pr create
```

The CLI will ask for a title and description. After you confirm, the Pull Request is created on GitHub.

> 🖼️ _Image: terminal showing gh pr create prompts and successful output_

To check out a Pull Request locally (for example, to review someone else's changes before merging), run:

```bash
gh pr checkout <number>
```

Replace `<number>` with the Pull Request number, which you can see on GitHub.

> 🖼️ _Image: terminal showing gh pr checkout switching to the Pull Request branch_

This is useful when reviewing work from a teammate.

## 🖥️ Alternative: LazyGit

LazyGit does not create Pull Requests directly, since those live on GitHub. However, you can view the branches you have pushed and manage them from LazyGit. The actual Pull Request is always opened and reviewed on GitHub.

Some people use LazyGit to push their branch and then switch to the browser to open the Pull Request. Both steps work well together.

## What Just Happened

You created a new branch called `add-final-stanza` and made a change to `poem.txt`. You pushed that branch to GitHub. GitHub noticed the new branch and offered to create a Pull Request.

On the Pull Request page, you could see exactly what changed. The diff view showed the new lines clearly. After reviewing, you clicked merge and GitHub added the changes to `main`.

Back in your terminal, you pulled the changes and your local `main` now matches what is on GitHub.

The key idea is that `main` was never touched directly. The change was proposed, reviewed, and then merged. That order of steps is what makes Pull Requests powerful.

## File State

**Before (on main, before the Pull Request):**

```
The wind moves slowly through the trees,
A quiet sound that puts me at ease.
Each branch that sways, each leaf that falls,
Reminds me nature softly calls.
A new line added after pushing again.
```

**After (on main, after the Pull Request is merged):**

```
The wind moves slowly through the trees,
A quiet sound that puts me at ease.
Each branch that sways, each leaf that falls,
Reminds me nature softly calls.
A new line added after pushing again.

The sky grows dark, the stars appear,
A gentle night that pulls me near.
```

The poem grew. The change came in safely through a Pull Request, not directly into `main`.

## Key Takeaways

- A Pull Request is a way to propose and review changes before merging them into `main`
- Always create a new branch, push it, and then open a Pull Request
- The Files Changed tab on GitHub shows exactly what was added or removed
- `gh pr create` lets you open a Pull Request from the terminal
- Never work directly on `main` when collaborating
