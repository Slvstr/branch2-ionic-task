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
 *****************************************************************************/
.factory('FirebaseGoal', ['$filter', '$firebaseObject', function($filter, $firebaseObject) {
  // Helper function to compare two Date timestamps.
  // Converts input dates to mm/dd/yy format to make comparison;
  function isSameDate(date1, date2) {
    var shortDate1 = $filter('date')(date1, 'shortDate');
    var shortDate2 = $filter('date')(date2, 'shortDate');

    return shortDate1 === shortDate2;
  }


  return $firebaseObject.$extend({

    getActiveProgress: function() {
      var lastProgress = this.progress[this.progress.length-1];
      var lastProgressDate = lastProgress.progressDate;
      var today = Date.now();

      // If the last progress event is from the current day, return that.  Otherwise, return a new
      // progress object.  (NOTE: new progress objects are not persisted until progress happens)
      return isSameDate(lastProgressDate, today) ? lastProgress : {progressDate: today, count: 0};
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
  console.log(typeof $firebaseArray.$extend);
  return $firebaseArray.$extend({
    $$added: function(snap) {
      var goalRef = snap.ref();
      var fbGoalInstance = new FirebaseGoal(goalRef);
      console.dir(fbGoalInstance);
      return fbGoalInstance;
    },
    customMethod: function() {
      console.log('custom method to test that goals list is using extended FirebaseGoals');
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
.factory('GoalsService', ['FirebaseRef', 'FirebaseGoals', 'Auth', function(FirebaseRef, FirebaseGoals, Auth) {
  
  return function() {
    return Auth.$waitForAuth().then(function(authData) {
      var goalsRef = FirebaseRef.child('goals').child(authData.uid);
      return new FirebaseGoals(goalsRef);

    });
  };

}]);


