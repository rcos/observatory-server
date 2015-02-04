'use strict';

var https = require('https'); 

var client_id = process.env.GITHUBCLIENTID;
var client_secret = process.env.GITHUBCLIENTSECRET;

exports.getRepository = function(userName, repositoryName){
    var path = "/repos/" + userName + "/" + repositoryName + "?client_id=" +
     client_id + "&client_secret="+ client_secret;

    var options = {
        host: 'api.github.com',
        path: path,
        headers: {'user-agent': 'Observatory'}
    }

    https.get(options , function(res){
        // console.log(res);
        res.on('data', function(d) {
            process.stdout.write(d);
        });
    }).on('error', function(e) {
      console.error(e);
    });
};

exports.getRepositoryCommits = function(userName, repositoryName, lastChecked){

    if (!lastChecked) {
        var path = "/repos/" + userName + "/" + repositoryName + "/commits?client_id=" +
            client_id + "&client_secret="+ client_secret;
    } else{
        var path = "/repos/" + userName + "/" + repositoryName + "/commits?client_id=" +
            client_id + "&client_secret="+ client_secret + "&since=" + lastChecked;
    }

    var options = {
        host: 'api.github.com',
        path: path,
        headers: {'user-agent': 'Observatory'}
    }

    https.get(options , function(res){
        var body = '';
        // console.log(res);
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            var data = JSON.parse(body);
            console.log(data.length);

            // If data has a length element defined return data
            if (data.length){
                return data
            // otherwise return an empty array of commits
            } else{
                return [];
            }
        });
    }).on('error', function(e) {
      console.error(e);
      return [];
    });
};