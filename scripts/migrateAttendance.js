// This file is to help migrate the old database which had users with an 'attendance' field
// to a new attendance collection

// var users = db.users.find({});
//
// while(users.hasNext()) {
//     for
//     db.attendance.create({})
//     db.projects.update(
//         { "repositoryUrl": { $exists: true } },
//         {
//             $set: { repositories: [ projectsWithRepoUrl.next().repositoryUrl ] },
//             $unset: { repositoryUrl: 1 }
//         }
//     );
// }

var smallgroups = db.smallgroups.find({});

while(smallgroups.hasNext()) {
    smallgroups.forEach(function(group){
        var classyear = db.classyears.findOne({semester:group.semester})
        db.smallgroups.update(
            { "_id": group._id },
            {
                $set: { "classYear": classyear._id },
                $unset: { semester: 1 }
            }
        );
    })

}
