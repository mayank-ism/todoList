var todoApp = angular.module('todoListApp', ['ngRoute', 'ngMaterial']);

todoApp.config(function ($routeProvider) {
  $routeProvider
    .when('/', {templateUrl: '../todolist.html'});
});
