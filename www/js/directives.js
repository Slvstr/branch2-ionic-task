angular.module('goaltracker.directives', [])

// TODO (Erik Hellenbrand) : Put directive for progress graph here

.directive('goalGraph', function($filter) {
  return {
    link: function(scope, element, attrs) {
      // create horizontal scale
      var GRAPH_WIDTH = 400;
      var GRAPH_HEIGHT = 400;


      var data = scope.goal.progress;

      var x = d3.scale.linear()
          .domain([0, scope.goal.target])
          .range([0, GRAPH_WIDTH]);

      d3.select(element[0])
        .selectAll('div')
        .data(data)
        .enter()
        .append('div')
          .style("width", function(d) {return x(d.count) + 'px';})
          .text(function(d) {return new $filter('date')(d.progressDate, 'shortDate');});
    }
  };
});