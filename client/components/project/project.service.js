'use strict';

angular.module('observatory3App')
  .factory('Project', function ($http) {
    return {
      getProjects: function() {
        return $http.get('/api/projects/');
      },
      getMyProjects: function() {
        return $http.get('/api/projects/mine');
      },
      getMenteesProjects: function() {
        return $http.get('/api/projects/mentees');
      },
      getPastProjects: function() {
        return $http.get('/api/projects/past');
      },
      getProject: function(projectOwner, projectName) {
        return $http.get('api/projects/' + projectOwner + '/' + projectName);
      },
      getProjectId: function(projectId) {
        return $http.get('api/projects/' + projectId);
      },
      getProjectAuthors: function(projectId) {
        return $http.get('api/projects/' + projectId + '/authors');
      },
      getProjectPosts: function(projectId) {
        return $http.get('api/posts/project/' + projectId);
      },
    };
});

