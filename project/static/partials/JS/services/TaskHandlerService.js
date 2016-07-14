todoApp.service('TaskHandlerService', ['$http', '$q', function($http, $q) {
  var list_of_tasks = [];
  var todo_list = [];
  var done_list = [];
  var current_edit_task_name = "";
  var current_edit_task_deadline = "";
  var current_edit_task = {};
  var current_edit_task_list = [];

  return {
    all_tasks: list_of_tasks,
    addNewTask: addNewTask,
    logout: logout,
    getAllTasks: getAllTasks,
    todo_list: todo_list,
    done_list: done_list,
    update_task: update_task,
    edit_Task: edit_Task,
    delete_task: delete_task,
    current_edit_task_deadline: current_edit_task_deadline,
    current_edit_task_name: current_edit_task_name,
    current_edit_task: current_edit_task,
    current_edit_task_list: current_edit_task_list
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

    var data = {
      task: task,
      deadline: deadlineDate
    };

    $http.post('/api/list', data, {})
    .success(function (data, status) {
      if(data.status) {
        deferred.resolve(data.task_id);
      }
      else {
        deferred.reject();
      }
    })
    .error(function (data, status) {
      deferred.reject();
    });

    return deferred.promise;
  }

  function update_task(id, completed) {
  	var deferred = $q.defer();

  	var data = {
  		completed: completed
  	};
  	$http.patch('/api/list/update/'+id, data, {})
  	.success(function (data, status) {
  		if(data.status) {
  			deferred.resolve();
  		}
  		else {
  			deferred.reject();
  		}
  	})
  	.error(function (data, status) {
  		deferred.reject();
  	});

  	return deferred.promise;
  }

  function edit_Task(id, name, deadline) {
  	var deferred = $q.defer();

  	var data = {
  		task: name,
  		deadline: deadline
  	};
  	$http.patch('/api/list/update/'+id, data, {})
  	.success(function (data, status) {
  		if(data.status) {
  			deferred.resolve(id);
  		}
  		else {
  			deferred.reject();
  		}
  	})
  	.error(function (data, status) {
  		deferred.reject();
  	});

  	return deferred.promise;
  }

  function delete_task(id) {
  	var deferred = $q.defer();

  	$http.delete('/api/list/delete/'+id, {}, {})
  	.success(function (data, status) {
  		if(data.status) {
  			deferred.resolve();
  		}
  		else {
  			deferred.reject();
  		}
  	})
  	.error(function (data, status) {
  		deferred.reject();
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
    return resultDate;
  }
}])
