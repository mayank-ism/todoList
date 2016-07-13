var myApp = angular.module('toDoApp', ['ngRoute']);

myApp.config(function ($routeProvider) {
  $routeProvider
  .when('/login', {
    templateUrl: 'static/partials/login.html',
    controller: 'loginController',
    access: {restricted: false}
  })
  .when('/logout', {
    controller: 'logoutController',
    access: {restricted: true}
  })
  .when('/register', {
    templateUrl: 'static/partials/register.html',
    controller: 'registerController',
    access: {restricted: false}
  })
  .otherwise({
   controller : function(){
    window.location.replace('/todolist');
    }, 
    template : "<div></div>"
   });
});

myApp.run(function ($rootScope, $location, $route, AuthService) {
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    AuthService.getUserStatus()
    .then(function(){
      if (next.access.restricted && !AuthService.isLoggedIn()){
        $location.path('/login');
        $route.reload();
      }
    });
  });
});
