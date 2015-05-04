angular.module('goaltracker', ['ionic', 'goaltracker.controllers', 'goaltracker.services', 'goaltracker.directives'])


/******************************************************************************
 * Run 
 *****************************************************************************/
.run(function($ionicPlatform, Auth, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });


  // When user is logged out send them to the login state
  Auth.$onAuth(function(authData) {
    if (!authData) {
      $state.go('welcome');
    }
  });


})



/******************************************************************************
 * Router
 *****************************************************************************/
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // First screen the user sees.  Child views for login or signup
  .state('welcome', {
    url: '/welcome',
    templateUrl: 'templates/welcome.html',
    controller: 'WelcomeCtrl'
  })

  .state('login', {
    url: '/login',
    cache: false, // Don't cache login view so the controller can hide the navbar each time it is shown
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'        
  })

  .state('signup', {
    url: '/signup',
    cache: false,
    templateUrl: 'templates/sign-up.html',
    controller: 'SignUpCtrl'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.goals', {
    url: '/goals',
    cache: false,
    views: {
      'tab-goals': {
        templateUrl: 'templates/tab-goals.html',
        controller: 'GoalsCtrl'
      }
    },
    resolve: {
      Goals: ['GoalList', function(GoalList) {
        return GoalList();
      }]
    }
  })


  .state('tab.goal-detail', {
    url: '/goals/:goalID',
    views: {
      'tab-goals': {
        templateUrl: 'templates/goal-detail.html',
        controller: 'GoalDetailCtrl'
      }
    }
  })


  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.change-password', {
    url: '/account/change-password',
    cache: false,
    views: {
      'tab-account': {
        templateUrl: 'templates/change-password.html',
        controller: 'ChangePasswordCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome');

});
