'use strict';

angular.module('observatory3App')
  .controller('MainController', function ($scope, $http, User) {
    $scope.projectStats = {};
    $scope.userStats = User.stats();

    $http.get('/api/projects/stats').success(function(stats) {
      $scope.projectStats = stats;
    });

    $http.get('/api/static').success(function(stats) {
      $scope.statics = stats;
    });

    $scope.sponsors = [
      { name: 'RedHat', logo: 'http://logo-load.com/uploads/posts/2016-02/1456126060_logo-red-hat.png', alt: 'Red Hat Linux', url: 'https://www.redhat.com/', description: 'RedHat has funded student projects and learning workshops, including Introduction to Open Source Software.' },
      { name: 'Mozilla', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Mozilla_logo.svg/2000px-Mozilla_logo.svg.png', alt: 'Mozilla', url: 'https://www.mozilla.org/en-US/foundation/', description: 'Helped with leadership program for mentors.' },
      { name: 'Open Source Initiative', logo: 'https://opensource.org/files/osi_standard_logo.png', alt: 'Open Source Initiative', url: 'https://opensource.org/', description: 'Educational Institution Member that has provided opportunities for students.' },
      { name: 'NSF HFOSS', logo: 'http://www.hfoss.org/uploads/images/allgray_notrinity.gif', alt: 'HFOSS', url: 'http://www.hfoss.org/index.php/contact-us', description: 'Affliated member with Trinity, Connecticut College and Wesleyan University' },
      { name: 'Microsoft', logo: 'https://mtaiit.com/imgs/microsoft.png', alt: 'Microsoft', url: 'https://www.microsoft.com/en-us/', description: 'Partially Funded Student projects (through Microsoft employee program).' },
      { name: 'Google', logo: 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/6466217/fixed-google-logo-font.png', alt: 'Google', url: 'https://www.google.com/', description: 'Donated MAGPis and Cardboard VR.' }
    ]
});
