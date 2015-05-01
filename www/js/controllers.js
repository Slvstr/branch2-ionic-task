angular.module('goaltracker.controllers', ['goaltracker.services'])

.controller('LoginCtrl', ['Auth', '$state', '$scope', '$ionicNavBarDelegate', function(Auth, $state, $scope, $ionicNavBarDelegate) {

  // Hide the nav bar on the login screen
  $ionicNavBarDelegate.showBar(false);

  // Log user in via Firebase's email/password auth option
  $scope.login = function() {
    Auth.$authWithPassword({
      email: $scope.email,
      password: $scope.password
    }).then(function(authData) {
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


.controller('GoalDetailCtrl', ['$scope', '$stateParams', 'GoalList', '$ionicNavBarDelegate', '$ionicHistory', '$ionicPopup',
  function($scope, $stateParams, GoalList, $ionicNavBarDelegate, $ionicHistory, $ionicPopup) {

  // Get user goals.  The promise should be resolved by the time anyone gets to this part of the app.
  GoalList.then(function(goals) {
    $scope.goals = goals;
    $scope.goal = $scope.goals.$getRecord($stateParams.goalID);
    $scope.rangeMax = $scope.goal.target * 2;
  });

  // Handlers for arrow buttons to left and right of target range/slider
  $scope.incrementTarget = function() {
    $scope.goal.target++;
  };

  $scope.decrementTarget = function() {
    $scope.goal.target--;
  };

  // Deletes goal from the server and returns user to previous view
  // If firebase returns an error, show a popup alert and return user to
  // previous view when they confirm the popup
  $scope.deleteGoal = function() {
    $scope.goals.$remove($scope.goal)
      .then(function() {
        $ionicHistory.goBack();
      })
      .catch(function(error) {
        console.error(error);
        $ionicPopup.alert({
          title: '<i class="icon ion-sad-outline"></i>',
          template: 'Error Deleting Goal'
        })
        .then(function() {
          $ionicHistory.goBack();
        });
      });
  };

  // Persist any changes when we leave this state
  $scope.$on('$stateChangeStart', function(event) {
    // Make sure we have a Firebase object to save
    if ($scope.goal.$save) {
      $scope.goal.$save()
      .catch(function(error) {
        console.error('Error saving edited goal', error);
      });
    }
  });


}])



.controller('AccountCtrl', function($scope, Auth, $state) {
  $scope.settings = {
    enableFriends: true
  };

  $scope.logout = function() {
    Auth.$unauth();
    $state.go('login');
  };
});
