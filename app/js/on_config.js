function OnConfig($stateProvider, $locationProvider, $urlRouterProvider, $compileProvider) {
  'ngInject';

  if (process.env.NODE_ENV === 'production') {
    $compileProvider.debugInfoEnabled(false);
  }

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  $stateProvider
  .state('Puzzle', {
    url: '/',
    controller: 'PuzzleCtrl as puzzle',
    templateUrl: 'puzzle.html',
    title: 'Puzzle'
  });

  $urlRouterProvider.otherwise('/');

}

export default OnConfig;
