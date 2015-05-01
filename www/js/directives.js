angular.module('goaltracker.directives', [])


/******************************************************************************
 * Directive applied to each goal in the Goals list view
 *****************************************************************************/
// .directive('goalItem', function() {
//   return function(scope, element) {
//     // scope.activeProgressCount = scope.goal.getActiveProgress().count;

//     // Using the $loaded() promise to fetch activeProgress after the FirebaseGoal object arrives
//     // Initially tried calling the getActiveProgress in a template binding, but it was called
//     // many times by the digest cycle, sometimes with 'this' undefined, causing errors.
//     // scope.$watch(function(scope) {return scope.goal.getActiveProgress()},
//     //   function(newValue) {
//     //     scope.activeProgressCount = newValue.count;
//     //   });

//     // scope.goal.$loaded().then(function(goal) {
//     //   scope.activeProgressCount = goal.getActiveProgress().count;
//     // });

//   };
// });