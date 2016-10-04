// This file is to help migrate the old database which had images identified by only their
// names to a new database in which images have a larger path which includes the projects
//name and github user name

var projects = db.projects.find({});

while(projects.hasNext()) {
  projects.forEach(function(project) {
    var updatedPhotos = project.photos;
    if(updatedPhotos.length > 0) {
      for(var i = 0; i < updatedPhotos.length; i++) {
        updatedPhotos[i] = project.githubUsername + "/" + project.githubProjectName + "/" + updatedPhotos[i];
      }
      db.projects.update(
          { "_id": project._id },
          {
              $set: {
                photos: updatedPhotos
              }
          }
      );
    }
  });
}
