'use strict';

angular.module('observatory3App')
  .config(function($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      });
  });

function getEmail() {
	var coded = "rTTPmCfUdTPB@PrTB.CT"
    var key = "gZ8fYCPqeJjtpaFI1GBLNyuoxA7XclKd4UWSkzQ63HMThnVirbvm5R2EOD9ws0"
    var shift=coded.length
    var link=""
    for (var i=0; i<coded.length; i++) {
      if (key.indexOf(coded.charAt(i))==-1) {
        var ltr = coded.charAt(i)
        link += (ltr)
      }
      else {     
        ltr = (key.indexOf(coded.charAt(i))-shift+key.length) % key.length
        link += (key.charAt(ltr))
      }
    }
	document.getElementById("contactmail").innerHTML = "<a href='mailto:"+link+"'>"+link+"</a>";
}
