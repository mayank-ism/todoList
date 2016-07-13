todoApp.controller('logoutController', ['$scope', '$location', 'TaskHandlerService', '$window',
	function ($scope, $location, TaskHandlerService, $window) {
		$scope.logout = function () {
			TaskHandlerService.logout()
			.then(function () {
				$window.location.href = "/#/login";
			});
		};
	}]);
