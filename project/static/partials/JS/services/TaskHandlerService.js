todoApp.service('TaskHandlerService', ['$http', '$q', function($http, $q) {
  var list_of_tasks = [];
  var todo_list = [];
  var done_list = [];

  return {
    all_tasks: list_of_tasks,
    addNewTask: addNewTask,
    logout: logout,
    getAllTasks: getAllTasks,
    todo_list: todo_list,
    done_list: done_list,
    update_task: update_task
  }

  function getAllTasks() {
    var deferred = $q.defer();

    $http.get('/api/list', {})
    .success(function (data, status) {
      deferred.resolve(data, status);
    })
    .error(function (data, status) {
      deferred.reject(data, status);
    });

    return deferred.promise;
  }

  function addNewTask(task, deadlineDate) {
    var deferred = $q.defer();

    var date = getDateFormat(deadlineDate);
    var data = {
      task: task,
      deadline_date: date.day,
      deadline_month: date.month,
      deadline_year: date.year
    };

    $http.post('/api/list', data, {})
    .success(function (data, status) {
      if(data.status) {
        deferred.resolve();
      }
      else {
        deferred.reject();
      }
      console.log(data.status + ", " + data.message + ", " + status);
    })
    .error(function (data, status) {
      deferred.reject();
      console.log(data + ", " + status);
    });

    return deferred.promise;
  }

  function update_task(id, task, deadline, completed) {
  	var deferred = $q.defer();

  	var data = {
  		task: task,
  		deadline: deadline,
  		completed: completed
  	};
  	$http.patch('/api/list/update/'+id, data, {})
  	.success(function (data, status) {
  		if(data.status) {
  			deferred.resolve();
  		}
  		else {
  			deferred.reject();
  			console.log(status);
  		}
  	})
  	.error(function (data, status) {
  		deferred.reject();
  		console.log(status);
  	});

  	return deferred.promise;
  }

  function logout() {

    var deferred = $q.defer();

    $http.get('/api/logout')
    .success(function (data) {
      user = false;
      deferred.resolve();
    })
    .error(function (data) {
      user = false;
      deferred.reject();
    });

    return deferred.promise;

  }

  function getDateFormat(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var resultDate = {};
    var parts = date.toString().split(" ");
    resultDate.day=parts[2];
    for(var i=0;i<12;i++) {
      if(parts[1] === months[i]) {
        break;
      }
    }
    resultDate.month=i+1;
    resultDate.year=parts[3];
    console.log(resultDate);
    return resultDate;
  }
}])
