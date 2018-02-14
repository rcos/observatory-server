// This file is to help migrate the old database which had projects with a single
// "repositoryUrl" property to a new database in which projects have a "repositories" array
// holding the old repositoryUrl as the first repository and having the ability to add more

var projectsWithRepoUrl = db.projects.find({ "repositoryUrl": { $exists: true } });

while(projectsWithRepoUrl.hasNext()) {
    db.projects.update(
        { "repositoryUrl": { $exists: true } }, 
        { 
            $set: { repositories: [ projectsWithRepoUrl.next().repositoryUrl ] }, 
            $unset: { repositoryUrl: 1 } 
        }
    );
}

