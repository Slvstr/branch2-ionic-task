angular.module('goaltracker.services', ['firebase'])

// Just create the base firebase ref once
.factory('FirebaseRef', function() {
  var FIREBASE_URL = 'https://branch2-goal-tracker.firebaseio.com/';

  return new Firebase(FIREBASE_URL);
})

/******************************************************************************
 * Wrap $firebaseAuth service in our own Auth factory
 *****************************************************************************/
.factory('Auth', ['$firebaseAuth', 'FirebaseRef', function($firebaseAuth, FirebaseRef) {

  return $firebaseAuth(FirebaseRef);

}])


.factory('GoalsService', ['FirebaseRef', '$firebaseArray', 'Auth', function(FirebaseRef, $firebaseArray, Auth) {
  
  // Returns promise for use in a resolve block for the router
  return function() {
    return Auth.$waitForAuth().then(function(authData) {
      var goalsRef = FirebaseRef.child('goals').child(authData.uid);
      return $firebaseArray(goalsRef);

    });    
  };


  // return function GoalList(uid) {
  //   var goalsRef = FirebaseRef.child('goals').child(uid);
  //   var GoalList = {}
  // };
}])


.factory('Goal', function() {
  function Goal(name, description, target) {
    this.name = name;
    this.description = description;
    this.target = target;

    // progress is a hash of timestamps to # of completed events
    // timestamps will be in UTC, and when adding new progress events we will 
    // compare the last timestamp to the current time and if they are within 
    // from the same day according to local time we will increment the existing object
    // Otherwise we create a new progress entry.  
    this.progress = {};
  }

  return Goal;
})



.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
