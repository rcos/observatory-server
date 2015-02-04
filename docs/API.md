API
============
## Commits
Method | URL | Action
--- | --- | ---
GET | /api/commits | Gets all commits
GET | /api/commits/:id | Gets more detail on commit
GET | /api/commits/project/:projectId | Gets commits from project

## Projects
Method | URL | Action
--- | --- | ---
GET | /api/projects | Gets all projects
GET | /api/projects/:id | Gets more detail on project
POST | /api/projects | Adds new project with data sent (see project.model.js)
PUT | /api/projects/:id | Updates project with data sent (see project.model.js)
DELETE | /api/projects/:id | Deletes project



## Users
Method | URL | Action
--- | --- | ---
GET | /api/users | Gets all users if admin
DELETE | /api/users/:id | Deletes user if admin
GET | /api/users/me | Gets more detail on yourself if authenticated
PUT | /api/users/:id/password | Changes user password if authenticated
GET | /api/users/:id | Gets more detail on user if authenticated
POST | /api/users/ | Adds new user with data sent (see users.model.js)
