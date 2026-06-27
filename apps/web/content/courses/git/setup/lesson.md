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

> 🖼️ *Image: I will add an image showing the set up*

You only need to do this once. Git will remember these details and attach them to every commit you make going forward.
