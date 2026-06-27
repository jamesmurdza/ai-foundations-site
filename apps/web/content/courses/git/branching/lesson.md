So far, all of your work has been happening in one place. Every change, every commit, everything has been part of one continuous timeline. That works well for simple projects, but as your work grows, you will face a new challenge.

Sometimes you want to try something new without risking what you already have. Branching is exactly how you do that.

## What Is a Branch

A branch is another version of your project where you can make changes safely.

Think of it like this. Imagine your project is a path you have been walking along. Every commit is a step forward on that path. Branching allows you to step off that main path and try a different direction without leaving the original one behind.

Your original path stays exactly as it was. The new direction is yours to explore. You can switch between them at any time.

In Git, the default branch is called **main**. It is the starting point of every project.

Before going further, it is important to understand the difference between a commit and a branch.

A **commit** is a saved version of your work. It captures your project at a specific moment in time.

A **branch** is a separate path of work. It is made up of a series of commits that exist independently from other branches.

Think of commits as snapshots and branches as the roads those snapshots live on.

## Seeing Your Branches

To see the branches in your project, run:

```bash
git branch
```

> 🖼️ _Image: terminal showing git branch output with only main listed_

At this point, you will likely see only one branch called `main`. The asterisk next to it shows that you are currently on that branch.

## Creating a New Branch

To create a new branch, run:

```bash
git branch new-idea
```

> 🖼️ _Image: terminal after running git branch new-idea_

This creates a new version of your project called `new-idea`. Nothing in your files has changed yet. You have simply created a new path that starts from the same point.

Run `git branch` again to confirm it was created.

> 🖼️ _Image: terminal showing git branch output with both main and new-idea listed_

## Switching to the New Branch

Creating a branch does not move you into it. To start working on it, run:

```bash
git switch new-idea
```

> 🖼️ _Image: terminal showing confirmation of switching to new-idea branch_

Git will confirm that you have switched. Now any changes you make will happen only on the `new-idea` branch. Your `main` branch is untouched.

## Making Changes on the Branch

Open `poem.txt` and add a new stanza. This is an idea you want to try without affecting your main version.

> 🖼️ _Image: poem.txt open with a new stanza added_

Save the file, then stage and commit it:

```bash
git add poem.txt
git commit -m "add new stanza on new-idea branch"
```

> 🖼️ _Image: terminal after committing on the new-idea branch_

## Switching Back to Main

Now run:

```bash
git switch main
```

> 🖼️ _Image: terminal showing switch back to main_

Open `poem.txt` again.

> 🖼️ _Image: poem.txt open on main branch without the new stanza_

The new stanza is not there. This is not a mistake. Git is showing you the version of `poem.txt` that belongs to the `main` branch. Your new stanza exists safely on `new-idea`, waiting for you.

## Switching Back to the Branch

Run:

```bash
git switch new-idea
```

Open `poem.txt` again.

> 🖼️ _Image: poem.txt open on new-idea branch with the new stanza visible_

The stanza is back. Git is now showing you the version that belongs to the `new-idea` branch.

This is the most important thing to understand about branches. Git is not deleting your work when you switch. It is showing you a different version of your project. Each branch has its own history and its own state.

## Visualizing Your Branches

To see how your branches connect, run:

```bash
git log --graph --oneline
```

> 🖼️ _Image: terminal showing git log --graph with the branch structure visible_

This shows the shape of your project history. You will see where the `new-idea` branch split off from `main`. This view becomes even more useful as your project grows.

## Naming Your Branches

When you create a branch, choose a name that describes what you are working on. A clear name makes it easy to remember what each branch is for.

Good branch names:

- `new-idea`
- `fix-spelling`
- `add-chorus`

Avoid names like `branch1` or `test`. Those names do not tell you anything useful later.

## Temporarily Saving Unfinished Work

Sometimes you are in the middle of editing `poem.txt` but you are not ready to commit yet. If you need to switch to another branch quickly, Git will not let you switch with unsaved changes that could be lost.

In this situation, you can use stash to temporarily store your work.

Run:

```bash
git stash
```

> 🖼️ _Image: terminal showing git stash output_

This hides your current changes and returns the file to its last committed state. You are now free to switch branches.

When you come back and want your changes again, run:

```bash
git stash pop
```

> 🖼️ _Image: terminal showing git stash pop restoring the changes_

Your changes are restored exactly as you left them.

Stash is useful for those moments when you are not ready to commit but need to move to something else quickly.

## A Visual Tool for Branches

As your project grows and you create more branches, it can become harder to keep track of everything in the terminal alone. A tool called **lazygit** gives you a visual way to see your branches, switch between them, and understand your history at a glance.

You will learn more about lazygit as the course continues.

## Branching Lets You Work Without Fear

With branching, you always have a safe place to try new things. Your `main` branch stays clean and stable while you explore ideas on separate branches.

You can create as many branches as you need, switch between them freely, and always return to your original work exactly as you left it.

## Key Takeaways

- A branch is a separate version of your project where you can work safely
- `git branch name` creates a branch and `git switch name` moves you into it
- Switching branches shows you a different version of your project without deleting anything
- `git stash` temporarily stores unfinished work so you can switch branches freely
