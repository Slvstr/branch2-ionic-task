angular.module('goaltracker.controllers', ['goaltracker.services'])


.controller('WelcomeCtrl', ['$ionicNavBarDelegate', function($ionicNavBarDelegate) {
  // Hide navbar
  $ionicNavBarDelegate.showBar(false);
}])




.controller('LoginCtrl', ['Auth', '$state', '$scope', '$ionicNavBarDelegate', '$ionicLoading',
  function(Auth, $state, $scope, $ionicNavBarDelegate, $ionicLoading) {

  // Hide the navbar
  $ionicNavBarDelegate.showBar(false);


  // Allow user to swipe back to welcome screen
  $scope.goBack = function() {
    return $state.go('welcome');
  };


  // Log user in via Firebase's email/password auth option
  $scope.login = function() {

    //immediately start the loading spinner
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>',
      hideOnStateChange: true   // auto-hide when login is successful
    });


    Auth.$authWithPassword({
      email: $scope.email,
      password: $scope.password
    })
    .then(function() {
      return $state.go('tab.goals');
    })
    .catch(function(error) {
      console.error(error);
      $ionicLoading.hide();


      // Display helpful error messages and styling to alert user to the error
      if (error.code === 'INVALID_USER') {
        $scope.loginError = "We don't know anyone with that email...";
        $scope.emailError = true;

        // Reset both fields
        $scope.email = undefined;
        $scope.password = undefined;
      }
      if (error.code === 'INVALID_PASSWORD') {
        $scope.loginError = "Incorrect password...";
        $scope.passwordError = true;

        // Reset only password field
        $scope.password = undefined;
      }
    });
  };
}])


.controller('SignUpCtrl', ['$scope', 'Auth', '$state', '$ionicNavBarDelegate', function($scope, Auth, $state, $ionicNavBarDelegate) {
  
  // Hide navbar
  $ionicNavBarDelegate.showBar(false);


  // Allow user to swipe back to welcome screen
  $scope.goBack = function() {
    return $state.go('welcome');
  };


  $scope.createUser = function() {
    
    // Make sure passwords match before continuing
    if ($scope.newUser.password1 !== $scope.newUser.password2) {
      $scope.signUpError = 'Passwords did not match';
      $scope.newUser.password1 = undefined;
      $scope.newUser.password2 = undefined;
      return;
    }
    
    /******************************************************************************
     * Create a new user
     * Then log them in and send them to the goals view
     * Or show a message if there was an error
     *****************************************************************************/
    Auth.$createUser({
      email: $scope.newUser.email,
      password: $scope.newUser.password1
    })
    .then(function(authData) {
      Auth.$authWithPassword({
        email: $scope.newUser.email,
        password: $scope.newUser.password1,
      })
      .then(function() {
        $state.go('tab.goals');
      })
      .catch(function() {
        console.error('User was created but could not be logged in');
        $state.go('login');
      });
      
    })
    .catch(function(error) {
      console.dir(error);
      $scope.signUpError = error.message;

      // reset all fields.  Could possibly improve by keeping email when password is invalid but email is recognized;
      $scope.newUser = null;
    });
  };
}])



// Controller for Goals list view
// Gets Goals from router's resolve block, so they are guaranteed to be present when view loads
.controller('GoalsCtrl', ['$scope', 'Goals', '$ionicModal', function($scope, Goals, $ionicModal) {
  $scope.goals = Goals;

  $ionicModal.fromTemplateUrl('templates/add-goal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  })
  .then(function(modal) {
    $scope.modal = modal;
  });

  $scope.addProgress = function($event, goal) {
    $event.preventDefault();
    return goal.addProgress();
  };

  $scope.showNewGoalForm = function() {
    $scope.newGoal = {name: '', target: 0, progress: []};
    $scope.modal.show();
    console.dir($scope.newGoal);
  };

  // Close new goal modal and clean up newGoal object without saving
  $scope.closeNewGoalForm = function() {
    $scope.modal.hide().then(function() {
      $scope.newGoal = null;
    });
  };

  $scope.saveNewGoal = function() {
    if ($scope.newGoal && $scope.newGoal.name && $scope.newGoal.target) {
      Goals.$add($scope.newGoal).then(function() {
        $scope.closeNewGoalForm();
      });
    }
    else {
      // HTML validation should prevent this from happening
      throw new Error('Goals must have a name and a target');
    }
  };


  $scope.deleteGoal = function(goal) {
    return $scope.goals.$remove(goal);
  };


  // Handlers for arrow buttons to left and right of target range/slider
  $scope.incrementTarget = function() {
    $scope.newGoal.target++;
  };

  $scope.decrementTarget = function() {
    $scope.newGoal.target--;
  };

}])


.controller('GoalDetailCtrl', ['$scope', '$stateParams', 'GoalList', '$ionicNavBarDelegate', '$ionicHistory', '$ionicPopup',
  function($scope, $stateParams, GoalList, $ionicNavBarDelegate, $ionicHistory, $ionicPopup) {

  // Get user goals.  The promise should be resolved by the time anyone gets to this part of the app.
  GoalList().then(function(goals) {
    $scope.goals = goals;
    $scope.goal = $scope.goals.$getRecord($stateParams.goalID);
    $scope.rangeMax = $scope.goal.target * 2;
  });


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
  // This is inconsistent with the rest of the interaction model
  // User may not expect that the back button saves their changes
  // Maybe it would be better to save each change immediately and show a transient visual confirmation
  // Or copy goal into a new object that we either save with a save button
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
  
  $scope.logout = function() {
    Auth.$unauth();
    $state.go('login');
  };
})

.controller('ChangePasswordCtrl', ['$scope', 'Auth', function($scope, Auth) {

  // Object to send to angularFire's $changePassword method
  $scope.credentials = {};
  $scope.credentials.email = Auth.$getAuth().password.email;


  // Make sure new passwords match, call the $changePassword api, and show success or error messages
  $scope.changePassword = function() {
    if ($scope.credentials.newPassword === $scope.comparePassword) {
      Auth.$changePassword($scope.credentials)
      .then(function() {
        $scope.successMessage = "Password change successful";

        $timeout(function() {
          $scope.successMessage = '';
        })
        .catch(function(error) {
          $scope.changePasswordError = error.message;
        });
      });
    }
    else {
      $scope.changePasswordError = 'New passwords do not match';
    }
  };
}]);
