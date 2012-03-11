
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

var escapeQuotes = /'/g;

// ------------------------------------------------------------------
//  The Repo constructor

function Repo(repoPath) {
	this.repoPath = path.resolve(repoPath);
}

// git ...
Repo.prototype.run = function(cmd, args, callback) {
	if (arguments.length === 2) {
		callback = args;
		args = [ ];
	}
	runGitCommand(exports.parseHolders(cmd, args), this.repoPath, callback);
};

// git add files
Repo.prototype.add = function(files, callback) {
	if (typeof files === 'object') {
		files = files.join(' ');
	}
	this.run('add ?', [files], callback);
};

// git commit -v -m message
Repo.prototype.commit = function(message, callback) {
	this.run("commit -v -m '?'", [message.replace(escapeQuotes, "\\'")], callback);
};

// git commit -av -m message
Repo.prototype.commitAll = function(message, callback) {
	this.run("commit -av -m '?'", [message.replace(escapeQuotes, "\\'")], callback);
};

// git clone --local /repo/path target
Repo.prototype.cloneTo = function(target, callback) {
	this.run('clone --local ? ?' [this.repoPath, target], callback);
};

// git clean (dirs ? -d)
Repo.prototype.clean = function(dirs, callback) {
	this.run('clean' + (dirs ? ' -d' : ''), [ ], callback);
};

// Helper for branch related functions
Repo.prototype._withBranches = function(callback) {
	this.run('branch', function(err, stdout, stderr) {
		if (err) {
			return callback({
				err: err,
				stdout: stdout,
				stderr: stderr
			});
		}
		callback(null, String(stdout).split('\n'));
	});
};

// git branch
Repo.prototype.listBranches = function(giveObjs, callback) {
	if (arguments.length === 1) {
		callback = giveObjs;
		giveObjs = false;
	}
	this._withBranches(function(err, result) {
		if (err) {
			return callback(err);
		}
		var branches = [ ];
		result.forEach(function(branch) {
			branch = branch.trim();
			var isCurrent = false;
			if (branch[0] === '*') {
				branch = branch.slice(2);
				isCurrent = true;
			}
			if (giveObjs) {
				branches.push({
					name: branch,
					isCurrent: isCurrent
				});
			} else {
				branches.push(branch);
			}
		});
		callback(null, branches);
	});
};

// git branch
Repo.prototype.currentBranch = function(callback) {
	this._withBranches(function(err, result) {
		if (err) {
			return callback(err);
		}
		var current;
		for (var i = 0, c = result.length; i < c; i++) {
			branch = branch.trim();
			if (branch[0] === '*') {
				current = branch.slice(2);
				break;
			}
		}
		callback(null, current);
	});
};

// git remote ...
Repo.prototype._withRemotes = function(callback) {
	this.run('remote', function(err, stdout, stderr) {
		if (err) {
			return callback({
				err: err,
				stdout: stdout,
				stderr: stderr
			});
		}
		callback(null, String(stdout).split('\n'));
	});
};

// git remote
Repo.prototype.listRemotes = function(callback) {
	this._withRemotes(callback);
};

// git remote
Repo.prototype.remoteExists = function(remote, callback) {
	this._withRemotes(function(err, remotes) {
		if (err) {
			return callback(err);
		}
		for (var i = 0, c = remotes.length; i < c; i++) {
			if (remotes[i] === remote) {
				return callback(null, true);
			}
		}
		callback(null, false);
	});
};

// git branch name
Repo.prototype.createBranch = function(name, callback) {
	this.run('branch ?', [name], callback);
};

// git branch (force ? -D : -d) name
Repo.prototype.deleteBranch = function(name, force, callback) {
	if (arguments.length === 2) {
		callback = force;
		force = false;
	}
	this.run('branch -? ?', [(force ? 'D' : 'd'), name], callback);
};

// git checkout name
Repo.prototype.checkout = function(name, callback) {
	this.run('checkout ?', [name], callback);
};

// ------------------------------------------------------------------
//  Publics

exports.Repo = Repo;

/**
 * Parse holders in a string
 */
exports.parseHolders = function(str, holders) {
	str = str.split('?');
	var result = str.shift();
	while (str.length) {
		result += (holders.shift() || '?') + str.shift();
	}
	return result;
};

/**
 * Get a Repo object for a given path
 */
exports.open = function(repoPath, autoCreate, callback) {
	if (arguments.length === 2) {
		callback = autoCreate;
		autoCreate = false;
	}
	isRepo(repoPath, function(exists) {
		if (! exists) {
			if (autoCreate) {
				exports.init(repoPath, callback, true);
			} else {
				callback(new Error('repoPath is not a git repository'));
			}
		} else {
			callback(null, new Repo(repoPath));
		}
	});
};

/**
 * Create a repo in the given directory
 */
exports.init = function(repoPath, callback, autoCreate) {
	var repo = new Repo(repoPath);
	repo.run('init', function(err, stdout, stderr) {
		if (err) {
			callback(new Error(String(stderr)), repo, true);
		} else {
			callback(null, repo, true);
		}
	});
};

// ------------------------------------------------------------------
//  Testing functions

exports.test = function() {
	exports.open('./projects/node-crux', function(err, repo) {
		global.repo = repo;
	});
};

exports.results = function(err, stdout, stderr) {
	console.log('err: ', err);
	console.log('stdout: ', stdout);
	console.log('stderr: ', stderr);
};

// ------------------------------------------------------------------
//  Helpers

function isRepo(repoPath, callback) {
	var git = path.join(repoPath, '.git');
	path.exists(git, function(exists) {
		if (! exists) {
			return callback(false);
		}
		fs.stat(git, function(err, stats) {
			callback(! err && stats.isDirectory());
		});
	});
}

function runGitCommand(cmd, cwd, callback) {
	childProcess.exec('git ' + cmd, { cwd: cwd }, callback);
}

