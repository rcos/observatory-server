var octo = require('octonode');
/*
  @TODO: IMPORT TOKEN FROM AN UNTRACKED/PRIVATE CONFIG FILE
*/
var token = "INSERT GITHUB API TOKEN HERE";
var octoclient = octo.client(token);

// Concurrency Variables
var maxConcurrentThreads = 10;
var runningThreads = 0;
var queuedThreads = [];

function runThread(func){
    // If we've exceeded the max number of threads, delay the call
    if (queuedThreads.length > 0  || runningThreads >= maxConcurrentThreads){
        queuedThreads.push(func);
    }else{
        func();
    }
}


module.exports.getCommitsForRepository = function(repoOwner, repoName, callback){
        /*
        	ex: github.com/<repoOwner>/<repoName>
        	repoOwner: github username for owner of github repo
        	repoName: github repo name

            example:
            	repoOwner: rcos
            	repoName: Observatory3
        */
        var githubRepo = repoOwner + "/" + repoName;
        var ghrepo = octoclient.repo(githubRepo);
        var commits = ghrepo.commits(function(err, data, headers) {
            //@TODO: add logic to create a commit model & save it to DB
        	return data;
        });
      /*
       not sure if callback is even needed... doesn't make sense with current function naming;
       maybe would be better to refactor function name to specify that it applies callback to list of commits from repo?
       or maybe this is just a javascript convention, and having callbacks everywhere is normal?
       */
      return callback(commits);
};
        // @TODO: remove/cleanup; just using this as a reference for now...
    // 	var pushEvents = ghuser.events(['PushEvent'], function(ignore, pushEvents){
    //         if (!pushEvents){
    //             return callback([]);
    //         }
    //         var strings = [];
    //     	for (var i = 0; i < pushEvents.length;i++){
    //     		var payload = pushEvents[i].payload;
    //     		var commits = payload.commits;
    //     		for (var u = 0; u < commits.length; u++){
    //     			strings.push(commits[u].message);
    //     		}
    //     	}
    //     	callback(strings);
    //     });
    // });
// };
