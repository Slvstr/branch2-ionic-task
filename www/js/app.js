angular.module('goaltracker', ['ionic', 'goaltracker.controllers', 'goaltracker.services'])


/******************************************************************************
 * Run 
 *****************************************************************************/
.run(function($ionicPlatform, Auth, $state, GoalsService) {
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
      $state.go('login');
    }
  });


  // Testing Data: stick a goal in the firebase db
  // GoalsService().then(function(fbArray) {
  //   var timestamp = Date.now();
  //   fbArray.$add({
  //     name: 'Test Goal #2',
  //     description: 'Second goal talky talk',
  //     target: 3,
  //     progress: [{progress_date: timestamp, numCompleted: 2}]
  //   });
  // });

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

  // Login state

  .state('login', {
    url: '/login',
    cache: false, // Don't cache login view so the controller can hide the navbar each time it is shown
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.goals', {
    url: '/goals',
    views: {
      'tab-goals': {
        templateUrl: 'templates/tab-goals.html',
        controller: 'GoalsCtrl'
      }
    },
    resolve: {
      UserID: ['Auth', function(Auth) {
        return Auth.$requireAuth().then(function(authData) {
          // console.dir(authData);
          return authData.uid;
        });
      }],
      Goals: ['GoalsService', function(GoalsService) {
        return GoalsService();
      }]
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
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
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
