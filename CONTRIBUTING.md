#### Contributing to Observatory

This document will walk you through the steps of setting up your computer for developing `observatory-server` and the process of contributing code to Observatory.


#### First Steps

1. Set up SSH keys on your local computer.[Setting up GitHub with SSH](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/) for instructions on how to setup SSH keys with GitHub

2. Install Docker - *todo - add instructions*

3. Install Node.js - *todo - add instructions*


#### Development Environment Setup 

1. Fork `rcos/observatory-server` Use `Clone with SSH`.

2. Clone your fork of the repository, (i.e. 'yourusername/observatory-server`). Use `Clone with SSH` fron the `Clone or download` dropdown on GitHub with the following terminal command:

`git clone git@github.com:yourusername/observatory-server.git`

3. Navigate into the `observatory-server` directory (i.e. `cd observatory-server`) and add the `upstream` remote to the repository:

`git remote add upstream git@github.com:rcos/observatory-server.git`

You can ensure this worked correclty by running `git remote show`. You should see entries for both `origin` and `upstream`.

4. Create and checkout a `dev` branch:

- `git branch dev`
- `git checkout dev`

5. Reset your dev branch to latest code on `upstream/dev`:

- `git reset --hard upstream/dev`

**WARNING:** The above command is destructive and should only be done once to do a hard-reset of your local dev branch. If you just want to pull down the latest changes, simply run `git pull upstream dev`

**Now you can start developing features!**


#### Developing

1. Run `npm install` to install Node.js dependencies

2. Run `docker-compose up -d` to start the MongoDB docker container

3. Run `npm start` to start the `observatory-server` application.


#### Commiting Changes

To commit your changes, do the following steps:

**Check the status of the changes in your working tree:**
`git status`

**Add the files to be committed:**
`git add .`

**Commit your changes with an inline message:**
`git commit -m "Updated .editorconfig file"`

**Push local commited changes to your local dev branch**
`git push origin dev`

**Open a pull request `rcos/observatory-server` GitHub page:**
1. Click `Compare across forks` and select you fork (i.e. `yourusername/observatory-server`) from the dropdown
2. Make sure that you're opening your PR from your `dev` branch into the `rcos/observatory` `dev` branch
3. Reference the GitHub issue inside the pull request comment with `#787`, with `787` being the GitHub issue number
4. Click `Create Pull Request` and your code will be reviewed by an administrator

#### Helpful Git Commands

**Pull down the latest upstream changes**
`git pull upstream dev`

**Check the status of your working tree**
`git status`

**Check the specific changes in your working tree**
`git diff`

**Add all files to be commited**
`git add .`

**Create a new commit with an inline message**
`git commit -m 'Bug fixes in classyear.controller.js'`

**Push local commited changes to your local dev branch**
`git push origin dev`
