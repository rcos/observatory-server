/*jshint multistr: true */
'use strict';

angular.module('observatory3App')
  .controller('ProfileCtrl', function ($scope, $stateParams, $http, Auth, User, Util, notify) {

      var loggedInUser;
      $scope.canEdit = function(){
        return $scope.isuser || $scope.loggedInUserRole === 'admin';
      };

      Auth.getCurrentUser(function(user){
        loggedInUser = user;
        $scope.isuser = loggedInUser._id === $stateParams.id;
        $scope.loggedInUserRole = loggedInUser.role;

        //If you can access private data
        if ($scope.canEdit()){
            User.privateInfo({id:$stateParams.id},function(user){
                $scope.user = user;
                if (!$scope.user.bio){
                    $scope.user.bio = "An awesome RCOS developer!";
                }
                $scope.originalRole = user.role;
                //Total attendance is current attendance in large and small groups
                parseAttendanceInfo($scope.user);

                $http.get('/api/commits/user/' + user.githubProfile).success(function(commits){
                    $scope.user.commits = commits;
                    });
                // Already have user's projects' information
                $scope.projects = user.projects;
                getCommits();
            },function(){});
        }
        else{
            //Get non-private user information
            User.info({id:$stateParams.id},function(user){
                $scope.user = user;
                if (!$scope.user.bio){
                    $scope.user.bio = "An awesome RCOS developer!";
                }
                $scope.originalRole = user.role;

                $http.get('/api/commits/user/' + user.githubProfile).success(function(commits){
                    $scope.user.commits = commits;
                    });
                // get all users projects information
                $scope.projects = [];

                user.projects.forEach(function(projectId){
                  $http.get("/api/projects/" + projectId).success(function(project){
                    $scope.projects.push(project);
                  });
                });
                getCommits();
            },function(){});
        }
      });

      var parseAttendanceInfo = function(u){
        Util.parseAttendance(u);

        u.full.all = u.totalDates.length;
        u.small.all = u.totalSmallDates.length;

        u.full.greyWidth = 0;
        u.small.greyWidth = 0;

        if (u.full.all === 0){
            u.full.goodWidth = 0;
            u.full.greyWidth = 100;
        }
        else{
            if (u.full.normal + u.full.bonus >= u.full.all){
                u.full.goodWidth = 100;
            }
            else{
                u.full.goodWidth = 100 * (u.full.normal + u.full.bonus) / u.full.all ;
            }
        }

        if (u.small.all === 0){
            u.small.goodWidth = 0;
            u.small.greyWidth = 100;
        }
        else{
            if (u.small.normal + u.small.bonus >= u.small.all){
                u.small.goodWidth = 100;
            }
            else{
                u.small.goodWidth = 100 * (u.small.normal + u.small.bonus) / u.small.all ;
            }
        }
      };
      var getCommits = function(){
         $http.get('/api/commits/user/' + user.githubProfile).success(function(commits){
             $scope.user.commits = commits;
         });
      };

      $scope.edittingBio = false;

      $scope.editBio = function(){
          $scope.edittingBio = !$scope.edittingBio;
      };

      $scope.saveBio = function(){
          $scope.edittingBio = false;
          $http.put('/api/users/' + $stateParams.id + '/bio', {
              'bio': $scope.user.bio
          }).success(function(data){
              $scope.user.bio = data.bio;
              notify({message: "Bio updated!", classes: []});
          }).error(function(){
              notify({message: "Could not update bio!", classes: ["alert-danger"]});
          });
      };

      $scope.edittingGithub = false;

      $scope.editGithub = function(){
        $scope.edittingGithub = !$scope.edittingGithub;
      };

      $scope.saveGithub = function(){
        $scope.edittingGithub = false;
        $http.put('/api/users/' + $stateParams.id + '/github',{
            'github': $scope.user.githubProfile
        }).success(function(data){
            $scope.user.githubProfile = data.githubProfile;
            notify({message: "Github updated!", classes: []});
        }).error(function(){
          notify({message: "Could not update Github!", classes: ["alert-danger"]});
        });
      };

      $scope.addTech = function(){
        if($scope.insertTechContent){
          $http.put('/api/users/' + $stateParams.id + '/addTech', {
              'tech': $scope.insertTechContent
          }).success(function(){
              $scope.user.tech.push($scope.insertTechContent);
              $scope.insertTechContent = '';
          }).error(function(){
              notify({message: "Could not add tech!", classes: ["alert-danger"]});
          });
        }
      };

      $scope.removeTech = function(tech){
          $http.put('/api/users/' + $stateParams.id + '/removeTech', {
              'tech': tech
          }).success(function(){
              $scope.user.tech.splice($scope.user.tech.indexOf(tech),1);
          }).error(function(){
              notify({message: "Could not add tech!", classes: ["alert-danger"]});
          });
      };

      $scope.pastUser = function(user){
          var conf = confirm("Are you sure you want to make your account inactive?");
          if (conf){
            Auth.pastUser(user).then(function(){
                notify({message: "Account made inactive"});
            }) .catch(function(){
                notify({message: "Could not make account inactive!", classes: ["alert-danger"]});
            });
        }
    }
      $scope.currentUser = function(user){
          Auth.currentUser(user).then(function(){
              notify({message: "Account made active"});
          }) .catch(function(){
              notify({message: "Could not make account active!", classes: ["alert-danger"]});
          });
    }

      $scope.setRole = function(){
        // $scope.user.role
        $http.post('/api/users/' + $stateParams.id + '/role', {
            role: $scope.user.role
        }).success(function(){
          $scope.originalRole = $scope.user.role;
        });
      }
  })

  .directive('bio', function(){

      return {
          restrict:'E',
          template: '<div style=\'white-space:pre;\' btf-markdown=\'user.bio\'></div> \
                     <textarea ng-show=\'edittingBio\' ng-model=\'user.bio\' ></textarea>'
      };
  })
  .directive('github', function(){
    return {
      restrict:'E',
      template: '<div style=\'white-space:pre;\'></div> \
                 <textarea ng-show=\'edittingGithub\' ng-model=\'user.githubProfile\' ></textarea>'
    }
  });
