# gitjs

A Node.js module for interacting with git repositories.

## Install

```bash
$ npm install gitjs
```

## Usage

```javascript
var git = require('gitjs');
```

#### git.open ( <String> repoPath[, <Boolean> autoCreate = false], <Function> callback )

Opens a git repository so git commands can be run. If the `autoCreate` parameter is given and is truthy, then the open function will init a new repository if one is not already in the given directory.

```javascript
git.open('/path/to/repo', function(err, repo) {
	
	// ...
	
});
```

#### git.init ( <String> repoPath, <Function> callback )

Intializes a new git repo in the given directory.

```javascript
git.init('/path/to/project', function(err, repo) {
	
	// ...
	
});
```

#### Repo::run ( <String> cmd[, <Array> args], <Function> callback )

Runs a git command in the repository. If an `args` array is given, it will be used to populate `?` placeholders in the command. As an example, on the command line you would create a new branch like so:

```bash
$ git branch foo
```

The same could be done with gitjs like this:

```javascript
repo.run('branch foo', function(err, stdout, stderr) {
	
	// ...
	
});
```

Also, you could make the branch name variable using the `args` parameter like this:

```javascript
function createBranch(repo, branchName) {
	repo.run('branch ?', [branchName], function(err, stdout, stderr) {
		
		// ...
		
	});
}
```

#### Repo::add ( <String|Array> files, <Function> callback )

Stages files to be committed.

```javascript
// All of the following are acceptable formats for files

repo.add('*', function(err, stdout, stderr) {
	
	// ...
	
});

repo.add('.', ...);

repo.add('foo.txt bar.txt', ...);

repo.add([ 'baz.txt', 'foo.html', 'bar.css' ], ...);
```

#### Repo::commit ( <String> message, <Function> callback )

Commits the repository changes.

```javascript
repo.commit('Changed foo.txt', function(err, stdout, stderr) {
	
	// ...
	
});
```

#### Repo::commitAll ( <String> message, <Function> callback )

Commits the repository changes with a `git commit -a`.

#### Repo::cloneTo ( <String> target, <Function> callback )

Does a local clone of the repository to the given target path.

```javascript
repo.cloneTo('/path/to/clone', function(err, stdout, stderr) {
	
	// ...
	
});
```

#### Repo::clean ( <Boolean> dirs, <Function> callback )

Runs a `git clean`. If the `dirs` parameter is truthy, a `-d` flag will be used.

#### Repo::listBranches ([ <Boolean> giveObjs = false,] <Function> callback )

Gets an array of branch names for the repository. If the `giveObjs` parameter is given and is truthy, objects about the branches will be given instead of just names.

```javascript
repo.listBranches(function(err, branches) {
	
	console.log(branches[0]);  // "master"
	
});

repo.listBranches(true, function(err, branches) {
	
	console.log(branches[0]);  // { name: "master", isCurrent: true }
	
});
```

#### Repo::currentBranch ( <Function> callback )

Gets the name of the current branch.

```javascript
repo.currentBranch(function(err, branch) {
	
	console.log(branch);  // "master"
	
});
```

#### Repo::listRemotes ( <Function> callback )

Gets the names of all remotes for the repository.

```javascript
repo.listRemotes(function(err, remotes) {
	
	console.log(remotes[0]);  // "origin"
	
});
```

#### Repo::remoteExists ( <String> remote, <Function> callback)

Determines if a given remote exists.

```javascript
repo.remoteExists('origin', function(err, exists) {
	
	console.log(exists);  // true
	
});
```

#### Repo::createBranch ( <String> name, <Function> callback )

Creates a new branch.

```javascript
repo.createBranch('dev', function(err, stdout, stderr) {
	
	// ...
	
});
```

#### Repo::deleteBranch ( <String> name[, <Boolean> force = false], <Function> callback )

Deletes a branch from the repository. If the `force` parameter is given and is truthy, the `-f` flag will be given, forcing the branch to be deleted, even if it has unmerged changes.

#### Repo::checkout ( <String> name, <Function> callback )

Checks out the given branch.

```javascript
repo.checkout('master', function(err, stdout, stderr) {
	
	// ...
	
});
```

#### Repo::status ( <Function> callback )

Runs a `git status --porcelain -z` command and parses the results into an array of files and the changes. Each value in the array is an object with the file name and the `x` and `y` change flags as defined in the git man pages.

```javascript
{
	x: 'M', y: ' ',
	file: 'foo.txt'
}
```

#### Repo::push (<Function> callback )

Pushing commits to git

```javascript
repo.push(function(err, stdout, stderr) {
	
	// ...
	
});
```
