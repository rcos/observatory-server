'use strict';

angular.module('observatory3App')
  .controller('SmallGroupCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
    $scope.smallgroup = {
      name: "<Small Group Name>",
      mentors: [
        {
          name: "<Mentor Name>",
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Mentor Name>",
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        }
      ],
      students: [
        {
          name: "<Student Name>",
          project: "<Project",
          present: true,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: true,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: true,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: false,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: true,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: false,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: true,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: false,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: false,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        },
        {
          name: "<Student Name>",
          project: "<Project",
          present: true,
          avatar: "http://www.gravatar.com/avatar/64e1b8d34f425d19e1ee2ea7236d3028?d=identicon"
        }
      ]
    };
    Auth.getCurrentUser(function(user){
        $scope.user = user;
        $http.get('/api/smallgroup/' + user.smallgroup).success(function(smallgroup){
            $scope.smallgroup = smallgroup;
            console.log(smallgroup);
        });
        $http.get('/api/smallgroup/' + user.smallgroup + '/members').success(function(members){
            $scope.members = members;
            console.log(members);
        });
    });
    $scope.createSmallGroup = function(){
        $http.post("/api/smallgroup/").success(function(err, data){
            console.log("Success!");
        });
    };
    $scope.showAttendance = function(){
      $scope.showAttendanceCode = true;
    };
    $scope.showAttendanceCode = false;
    $scope.isPresent = function(){ return false; };
    $scope.isMentor = Auth.isMentor;
  });
