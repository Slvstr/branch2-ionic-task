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




/******************************************************************************
 * FirebaseGoal Service
 * Extends $firebaseObject to add methods for managing progress events

  * TODO: This is probably unnecessary given the $save method on $firebaseArray.
  *       This could just be a Goal class instead.  
 *****************************************************************************/
.factory('FirebaseGoal', ['$filter', '$firebaseObject', function($filter, $firebaseObject) {
  // Helper function to compare two Date timestamps.
  // Converts input dates to mm/dd/yy format to make comparison;
  function isSameDate(date1, date2) {
    var shortDate1 = $filter('date')(date1, 'shortDate');
    var shortDate2 = $filter('date')(date2, 'shortDate');

    return shortDate1 === shortDate2;
  }

  function ProgressObject(timestamp) {
    // Handle being called without 'new' keyword
    if (!(this instanceof ProgressObject)) {
      return new ProgressObject(timestamp);
    }

    this.progressDate = timestamp;
    this.count = 0;
  }

  var progressCheckCounter = 0;

  return $firebaseObject.$extend({

    getActiveProgress: function() {
      progressCheckCounter++;
      // console.log('getActiveProgress has been called ' + progressCheckCounter + ' times');
      var self = this;
      var today = Date.now();
      // If the goal has no progress there is no use in comparing dates.  Just return 
      if (!self.progress || !self.progress.length) {
        return new ProgressObject(today);
      }
      var lastProgress = self.progress[self.progress.length-1];
      var lastProgressDate = lastProgress.progressDate;

      // If the last progress event is from the current day, return that.  Otherwise, return a new
      // progress object.  (NOTE: new progress objects are not persisted until progress happens)
      return isSameDate(lastProgressDate, today) ? lastProgress : new ProgressObject(today);
    },

    addProgress: function() {
      var activeProgress = this.getActiveProgress();

      // If there are already progress events we just need to increment the count
      // because the object is already present in the this.progress array
      if (activeProgress.count) {
        activeProgress.count++;
      }
      // New progress events need to be added to the progress array 
      else {
        activeProgress.count++;
        this.progress = this.progress || []; // Handle goals with no progress
        this.progress.push(activeProgress);
      }

      // Persist changes to this goal
      return this.$save();
    }
  });

}])



/******************************************************************************
 * Extends $firebaseArray to create an instance of FirebaseGoal for each 
 * memeber of the array
 *****************************************************************************/
.factory('FirebaseGoals', ['$firebaseArray', 'FirebaseGoal', function($firebaseArray, FirebaseGoal) {
  return $firebaseArray.$extend({
    $$added: function(snap) {
      var goalRef = snap.ref();
      var fbGoalInstance = new FirebaseGoal(goalRef);
      return fbGoalInstance;
    }
  });
}])




/******************************************************************************
 * GoalsService:
 * Returns promise for use in a resolve block for the router
 * This is because we first need a user id before we can fetch the user's goals
 * An alternative approach would be to return a factory function that the goals 
 * controller could call after getting a user id from Auth.  Since the goals view
 * is worthless without the user's goals, it seemed more appropriate to ensure
 * they are loaded via resolve
 *****************************************************************************/
.factory('GoalList', ['FirebaseRef', 'FirebaseGoals', 'Auth', '$q', function(FirebaseRef, FirebaseGoals, Auth, $q) {
  
  // Returns a promise that is resolved with our extended $firebaseArray when the user is authenticated
  return $q(function(resolve, reject) {
    var goalsRef;
    
    Auth.$onAuth(function(authData) {
      if (authData && authData.uid) {
        goalsRef = FirebaseRef.child('goals').child(authData.uid);
        resolve(new FirebaseGoals(goalsRef));
      }
    });
  });


  // return function() {
  //   return Auth.$waitForAuth().then(function(authData) {
  //     var goalsRef = FirebaseRef.child('goals').child(authData.uid);
  //     return new FirebaseGoals(goalsRef);

  //   });
  // };

}]);


