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


  return $firebaseObject.$extend({

    getActiveProgress: function() {
      progressCheckCounter++;
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





.factory('GoalList', ['FirebaseRef', 'FirebaseGoals', 'Auth', '$q', function(FirebaseRef, FirebaseGoals, Auth, $q) {
  // Cache for user's goals
  var _goals;


  // Clear the cache when user logs out
  Auth.$onAuth(function(authData) {
    if (!authData) {
      _goals = null;
    }
  });


  // If goals are already cached, resolve the promise with them
  // Otherwise get user id, then fetch user's goals and cache them
  return function() {
    return $q(function(resolve, reject) {
      var goalsRef;

      if (_goals) {
        _goals.$loaded().then(function(goals) {
          resolve(goals);
        });
      }
      else {
        Auth.$waitForAuth().then(function(authData) {
          goalsRef = FirebaseRef.child('goals').child(authData.uid);
          _goals = new FirebaseGoals(goalsRef);
          _goals.$loaded().then(function(goals) {
            resolve(goals);
          });
        });
      }
    });
  };


}]);


