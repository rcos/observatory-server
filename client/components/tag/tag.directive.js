'use strict';

angular.module('observatory3App')
 .directive('tag', function () {
 	return{
		templateUrl: 'components/tag/tag.html',
		scope: {
		  endpoint: '@',
		  canEdit: '&',
		  id: '=',
		  tags: '='
	}, 
 	restrict: 'E',
 	controller: function ($scope,$http,notify) {

		$scope.addTechBubble = function(){
			if($scope.insertTechContent){
				if($scope.endpoint==='posts'){
					$scope.tags.push($scope.insertTechContent);
			    	$scope.insertTechContent = '';
				}
			 else{
			  	$http.put('/api/'+$scope.endpoint+'/addTechBubble/' +  $scope.id  + '/' + $scope.insertTechContent).success(function(){
			    	$scope.tags.push($scope.insertTechContent);
			    	$scope.insertTechContent = '';
			  	}).error(function(){
			    notify({message: 'Could not add tech!', classes: ['alert-danger']});
			  });
			}
		}
		};

		$scope.removeTech = function(tag){
			if($scope.endpoint==='posts'){
			  $scope.tags.splice($scope.tags.indexOf(tag),1);
			}else{
				$http.put('/api/'+$scope.endpoint + '/' + $scope.id + '/' + tag + '/removeTech').success(function(){
				  $scope.tags.splice($scope.tags.indexOf(tag),1);
				}).error(function(){
				  notify({message: 'Could not remove tech!', classes: ['alert-danger']});
				});
			}
		};
 	}
  };
});
