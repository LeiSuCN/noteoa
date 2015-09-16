angular.module('mwnoteoa.filters', ['mwnoteoa.services'])

// 任务ID转化任务
.filter('taskid2taskname', function(Task) {
  return function(taskId){
    var task = Task.getTaskByType(taskId);

    return task ? task.name : '';
  }
})
// 任务状态
.filter('taskstatus', function() {

  return function(task){
    var total = task.total;
    var done = task.done;

    if( total > done ){
      return 'doing';
    } else{
      return 'done';
    }
  }
})// 任务状态
.filter('taskstatusicon', function() {

  return function(task){
    var total = task.total;
    var done = task.done;

    if( total > done ){
      return 'ion-ios-circle-outline';
    } else{
      return 'ion-ios-checkmark-outline';
    }
  }
})
;