## Setting Up Git

After installing Git, there is one small but important step before you begin using it. Git needs to know who you are.

Every time you save a version of your work, Git records your name and email alongside that save. This helps keep track of who made which changes, which becomes very useful when working on a team.

To set your name, run:

```bash
git config --global user.name "Your Name"
```

To set your email, run:

```bash
git config --global user.email "you@example.com"
```

Replace the example name and email with your own information.

You only need to do this once. Git will remember these details and attach them to every commit you make going forward.

### Choosing Your Default Branch Name

Git starts every new project on a main line of work called a branch. You will learn about branches later in the course. For now, the only thing that matters is its name.

Older versions of Git named this first branch `master`. Newer versions and every major platform, including GitHub, now use `main`. If your Git is older, you will end up with `master` while this course talks about `main`, and that mismatch gets confusing.

To make sure every new project starts on `main`, run:

```bash
git config --global init.defaultBranch main
```

This only affects projects you create from now on. If you ever open an older project and see `master` instead of `main`, nothing is wrong. It is the same thing with a different name.

### Choosing Your Editor

Some Git commands open a text editor so you can type a longer message. If you have never set an editor, Git may open one called Vim, which is difficult to exit when you are new.

To use Visual Studio Code instead, run:

```bash
git config --global core.editor "code --wait"
```

If you prefer something simpler that lives in the terminal, use Nano:

```bash
git config --global core.editor "nano"
```

### Checking Your Settings

To confirm everything saved correctly, run:

```bash
git config --list
```

![git config --list output showing name, email and defaultBranch](/images/git/setup/git-config-list.jpeg)

You will see your name, your email, and the settings you just added. If this list fills the screen and you cannot type, press `q` to exit.

Your setup is now complete.
