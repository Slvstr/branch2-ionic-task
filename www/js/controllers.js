angular.module('goaltracker.controllers', ['goaltracker.services'])

.controller('LoginCtrl', ['Auth', '$state', '$scope', '$ionicNavBarDelegate', function(Auth, $state, $scope, $ionicNavBarDelegate) {

  // Hide the nav bar on the login screen
  $ionicNavBarDelegate.showBar(false);

  // Log user in via 
  $scope.login = function() {
    console.log('login function called');

    Auth.$authWithPassword({
      email: $scope.email,
      password: $scope.password
    }).then(function(authData) {
      console.dir(authData);
      $state.go('tab.dash');
    });
  };
}])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, Auth, $state) {
  $scope.settings = {
    enableFriends: true
  };

  $scope.logout = function() {
    Auth.$unauth();
    $state.go('login');
  };
});
