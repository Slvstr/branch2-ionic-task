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


// Controller for Goals list view
.controller('GoalsCtrl', ['$scope', 'Goals', 'UserID', function($scope, Goals) {
  $scope.goals = Goals;


  $scope.addProgress = function($event, goal) {
    $event.preventDefault();
    return goal.addProgress();
  };


}])


.controller('GoalDetailCtrl', ['$scope', '$stateParams', 'GoalList', function($scope, $stateParams, GoalList) {
  GoalList.then(function(goals) {
    $scope.goal = goals.$getRecord($stateParams.goalID);
  })
}])



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
