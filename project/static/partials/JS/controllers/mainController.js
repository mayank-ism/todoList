todoApp.controller('mainController',['$scope', '$mdDialog', '$mdMedia', '$http', 'TaskHandlerService', '$templateRequest', '$compile', '$timeout', 
  function($scope, $mdDialog, $mdMedia, $http, TaskHandlerService, $templateRequest, $compile, $timeout) {

    $scope.todo_text="";

    $scope.init = function() {
      TaskHandlerService.getAllTasks().then(function(data, status) {
        var index;
        var task_list = data.task_list;
        var todo_list = [];
        var done_list = [];
        for(index in task_list) {
          var task = task_list[index];
          task.dateObject = getDateObject(task.deadline);
          if(task.completed) {
            done_list.push(task);
          }
          else {
            todo_list.push(task);
          }
        }
        TaskHandlerService.todo_list = todo_list;
        TaskHandlerService.done_list = done_list;
        $scope.todo_list = todo_list;
        $scope.done_list = done_list;
        document.getElementById('main-body').style.display="block";
      });
    };

    $scope.listHoverHandler = function(event) {
      var target = event.target || event.srcElement;
      var flag = false;
      while(target != null && target.nodeName != 'UL') {
        if(target.nodeName == 'LI') {
          flag = true;
          break;
        }
        target = target.parentNode;
      }
      if(flag) {
        var imageElements = target.getElementsByTagName("img");
        for(var i=0; i<imageElements.length; i++) {
          imageElements[i].style.visibility="visible";
        }
      }
    };

    $scope.listLeaveHandler = function(event) {
      var target = event.target || event.srcElement;
      var flag = false;
      while(target != null && target.nodeName != 'UL') {
        if(target.nodeName == 'LI') {
          flag = true;
          break;
        }
        target = target.parentNode;
      }
      if(flag) {
        var imageElements = target.getElementsByTagName("img");
        for(var i=0; i<imageElements.length; i++) {
          imageElements[i].style.visibility="hidden";
        }
      }
    }

    $scope.editTask = function(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      var target = ev.target || ev.srcElement;
      var flag = false;
      var elements = document.getElementsByClassName(target.className);
      var list = $scope.done_list;
      if(target.className === 'edit-todo-img') {
        list = $scope.todo_list;
      }
      var i;
      for(i=0; i<elements.length; i++) {
        var element = elements[i];
        if(element == target) {
          flag = true;
          TaskHandlerService.current_edit_task = list[i];
          TaskHandlerService.current_edit_task_name = list[i].task;
          TaskHandlerService.current_edit_task_deadline = list[i].deadline;
          TaskHandlerService.current_edit_task_list = list;
          break;
        }
      }
      if(flag) {
        $mdDialog.show({
          controller: editTaskController,
          templateUrl: 'static/partials/JS/partials/editTask.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: useFullScreen
        })
        .then(function(answer) {
        }, function() {
        });
        $scope.$watch(function() {
          return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
          $scope.customFullscreen = (wantsFullScreen === true);
        });    	
      }
    }

    $scope.deleteTask = function(ev) {
      var target = ev.target || ev.srcElement;
      var flag = false;
      var elements = document.getElementsByClassName(target.className);
      var id, task_name, list = $scope.done_list;
      if(target.className === 'del-todo-img') {
        list = $scope.todo_list;
      }
      var i;
      for(i=0; i<elements.length; i++) {
        var element = elements[i];
        if(element == target) {
          flag = true;
          id = list[i].id;
          task_name = list[i].task;
          break;
        }
      }
      if(flag) {
        var confirm = $mdDialog.confirm()
        .title('Would you like to delete the following task?')
        .textContent(task_name)
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
          TaskHandlerService.delete_task(id).then(function() {
            // delete task from list
            list.splice(i, 1);
          }, function() {
          	// show error message
          })
        });
      }
    }

    $scope.changeTaskStatus = function(ev) {
      var target = ev.target || ev.srcElement;
      var flag = false;
      var elements = document.getElementsByClassName(target.className);
      var id, task_name, task_deadline, done = "undone", completed = false, list = $scope.done_list;
      if(target.className === 'tick-img') {
        completed = true;
        done = "done";
        list = $scope.todo_list;
      }
      var i;
      for(i=0; i<elements.length; i++) {
        var element = elements[i];
        if(element == target) {
          flag = true;
          id = list[i].id;
          task_name = list[i].task;
          task_deadline = list[i].deadline;
          break;
        }
      }
      if(flag) {
        var confirm = $mdDialog.confirm()
        .title('Would you like to mark the following task as ' + done + '?')
        .textContent(task_name)
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
          TaskHandlerService.update_task(id, completed).then(function() {
          	if(completed) {
          	  // move task to done list
          	  $scope.done_list.push(list[i]);
          	  list.splice(i, 1);
          	}
          	else {
          	  // move task to todo list
          	  $scope.todo_list.push(list[i]);
          	  list.splice(i, 1);
          	}
          }, function() {
          	// show error message
          })
        }, function() {
        });
      }
    }

    $scope.addTaskHandler = function(ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
        controller: addTaskController,
        templateUrl: 'static/partials/JS/partials/addTask.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: useFullScreen
      })
      .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });
      $scope.$watch(function() {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function(wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });
    }
  }]);

function getDateObject(date) {
  var dateObject = {};
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var parts = date.split("-");
  dateObject.day = parts[0];
  dateObject.month = months[parseInt(parts[1])-1];
  dateObject.year = parts[2];
  return dateObject;
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
  i++;
  resultDate.month = i+"";
  if(i<=9)
    resultDate.month="0"+resultDate.month;
  resultDate.year=parts[3];
  return resultDate;
}

function addTaskController($scope, $mdDialog, $http, TaskHandlerService) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
    if(answer === "save") {
      var name = $scope.newTask.name;
      var dateObject = getDateFormat($scope.newTask.deadlineDate);
      var deadlineDate = dateObject.day+"-"+dateObject.month+"-"+dateObject.year;
      TaskHandlerService.addNewTask(name, deadlineDate).then(function (task_id) {
        var newTask = {
          id: task_id,
          task: name,
          deadline: deadlineDate,
          dateObject: getDateObject(deadlineDate)
        };
        TaskHandlerService.todo_list.push(newTask);
      }, function() {
        $mdDialog.show(
          $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Error')
          .textContent('Some unknown error occured')
          .ariaLabel('Alert Dialog Demo')
          .ok('Okay')
          );
      });
    }
  };
}

function getDateObjectFromServerDate(dateString) {
  var dateObject = {};
  var parts = dateString.split("-");
  dateObject.day = parseInt(parts[0]);
  dateObject.month = parseInt(parts[1])-1;
  dateObject.year = parseInt(parts[2]);
  return new Date(dateObject.year, dateObject.month, dateObject.day);
}

function editTaskController($scope, $mdDialog, $http, TaskHandlerService) {
  var dateInstance = getDateObjectFromServerDate(TaskHandlerService.current_edit_task_deadline);
  $scope.editTask = {
    name: TaskHandlerService.current_edit_task_name,
    deadlineDate: dateInstance
  };
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
    if(answer === "save") {
      var name = $scope.editTask.name;
      var dateObject = getDateFormat($scope.editTask.deadlineDate);
      var deadlineDate = dateObject.day+"-"+dateObject.month+"-"+dateObject.year;
      TaskHandlerService.edit_Task(TaskHandlerService.current_edit_task.id, name, deadlineDate).then(function (task_id) {
        var newTask = {
          id: task_id,
          task: name,
          deadline: deadlineDate,
          dateObject: getDateObject(deadlineDate)
        };
        for(var i=0;i<TaskHandlerService.current_edit_task_list.length;i++) {
        	if(TaskHandlerService.current_edit_task_list[i].id === task_id) {
        		TaskHandlerService.current_edit_task_list[i] = newTask;
        		break;
        	}
        }

        // TaskHandlerService.todo_list.push(newTask);
      }, function() {
        $mdDialog.show(
          $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('Error')
          .textContent('Some unknown error occured')
          .ariaLabel('Alert Dialog Demo')
          .ok('Okay')
          );
      });
    }
  };
}

function hyphenToSlashDate(inputDate) {
  var outputDate = "";
  var i, c;
  for(i=0;i<inputDate.length;i++) {
    c = inputDate.charAt(i);
    if(c=='-') {
      c = '/';
    }
    outputDate += c;
  }
  return outputDate;
}
