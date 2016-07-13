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
        var imageElements = target.getElementsByClassName("tick-img");
        for(var i=0; i<imageElements.length; i++) {
          imageElements[i].style.visibility="visible";
        }
      }
      else {
        console.log("not found");
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
        var imageElements = target.getElementsByClassName("tick-img");
        for(var i=0; i<imageElements.length; i++) {
          imageElements[i].style.visibility="hidden";
        }
      }
      else {
        console.log("not found");
      }
    }

    $scope.changeTaskStatus = function(ev) {
      var target = ev.target || ev.srcElement;
      var flag = false;
      var todo_elements = document.getElementsByClassName('tick-img');
      var done_elements = document.getElementsByClassName('untick-img');
      var completed = false, id, task_name, task_deadline, done;
      var i;
      for(i=0; i<todo_elements.length; i++) {
        var element = todo_elements[i];
        if(element == target) {
          completed = true;
          done = "done";
          flag = true;
          id = $scope.todo_list[i].id;
          task_name = $scope.todo_list[i].task;
          task_deadline = $scope.todo_list[i].deadline;
          break;
        }
      }
      if(!completed) {
        for(i=0; i<done_elements.length; i++) {
          var element = todo_elements[i];
          if(element == target) {
            completed = false;
            done = "undone";
            flag = true;
            id = $scope.done_list[i].id;
            task_name = $scope.todo_list[i].task;
            task_deadline = $scope.todo_list[i].deadline;
            break;
          }
        }
      }
      console.log(completed + ", " + id);
      if(id>=0 && id) {
        var confirm = $mdDialog.confirm()
        .title('Would you like to mark the following task as ' + done + '?')
        .textContent(task_name)
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
          
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
      TaskHandlerService.addNewTask($scope.newTask.name, $scope.newTask.deadlineDate).then(function () {
        var newTask = {
          task: $scope.newTask.name,
          deadline: $scope.newTask.deadlineDate
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
      console.log("Task name : " + $scope.newTask.name);
      console.log("Task deadline : " + $scope.newTask.deadlineDate);
    }
  };
}
