## The Problem

Everything you have done so far has lived only on your computer.

That means if your laptop breaks, gets stolen, or stops working, every commit, every version, every stanza of `poem.txt` is gone. You also have no way to share your project with someone else or continue working on a different device.

Working only locally is fine for practice. But for real work, you need your project to exist somewhere else too.

## The Idea

A remote is another copy of your project stored somewhere outside your computer.

Think of it like Google Drive or iCloud, but built specifically for Git. Your local project stays on your machine. The remote copy lives on a server. You push your work up to the remote and pull updates down from it.

A remote is not a different project. It is the same project, just stored in another place.

GitHub is one of the most popular places to host a remote. You will set that up in the next section. For now, focus on understanding what a remote is and how Git connects to it.

## The Action

### Connecting to a Remote

Once you have a remote repository ready, you connect to it with:

```bash
git remote add origin <url>
```

Replace `<url>` with the actual address of your remote repository. You will get this from GitHub in the next section.

The word `origin` is just a name for the remote. It is the standard name that most people use, and Git expects it by default.

To confirm the connection worked, run:

```bash
git remote -v
```

> 🖼️ _Image: terminal showing git remote -v output with the remote URL listed_

This shows the address Git will use when you push or pull.

### Pushing Your Work

To send your commits to the remote for the first time, run:

```bash
git push -u origin main
```

> 🖼️ _Image: terminal showing git push -u origin main output_

This uploads everything on your `main` branch to the remote. The `-u` flag links your local `main` branch to the remote one so that future pushes and pulls are shorter.

After the first push, you can simply run:

```bash
git push
```

### Pulling Updates

If something changes on the remote, you can bring those changes down to your local project with:

```bash
git pull
```

> 🖼️ _Image: terminal showing git pull output_

This is useful when you work from multiple computers or when someone else has made changes.

### Fetching Without Merging

There is also a more careful version:

```bash
git fetch
```

This downloads the changes from the remote but does not apply them to your files yet. It lets you review what has changed before deciding to merge. For now, `git pull` is the one you will use most often.

## 🖥️ Alternative: LazyGit

In LazyGit, pushing and pulling are available through simple key shortcuts.

To push, press `P` (uppercase).

To pull, press `p` (lowercase).

> 🖼️ _Image: pushing and pulling using LazyGit_

LazyGit shows you the remote name and branch you are syncing with, so you can always confirm before sending or receiving.

## What Just Happened

When you ran `git remote add origin <url>`, you told Git where the remote copy of your project lives. Git saved that address so you do not have to type it every time.

When you ran `git push`, Git took all the commits on your `main` branch and sent them to the remote server. The remote now has the same history as your local project.

When you run `git pull`, Git checks the remote for any new commits and brings them into your local project.

Your local project and the remote are always separate copies. They only sync when you push or pull.

## File State

**Before pushing:**

`poem.txt` exists only on your computer. No one else can see it. If your machine fails, the file is lost.

```
The wind moves slowly through the trees,
A quiet sound that puts me at ease.
Each branch that sways, each leaf that falls,
Reminds me nature softly calls.
```

**After pushing:**

The same file now exists on the remote. It is safe, accessible from anywhere, and ready to share.

```
The wind moves slowly through the trees,
A quiet sound that puts me at ease.
Each branch that sways, each leaf that falls,
Reminds me nature softly calls.
```

The content has not changed. The difference is where it lives.

## Key Takeaways

- A remote is a copy of your project stored outside your computer
- `git remote add origin <url>` connects your local project to a remote
- `git push` sends your commits to the remote
- `git pull` brings remote changes into your local project
