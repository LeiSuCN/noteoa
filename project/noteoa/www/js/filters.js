angular.module('mwnoteoa.filters', ['mwnoteoa.services'])

// 任务状态
.filter('taskstatus', function() {

  return function(task){

    if( task.mission_state == '0' ){
      return 'doing';
    } else{
      return 'done';
    }
  }
})
// 任务状态
.filter('taskstatusicon', function() {

  return function(task){
    if( task.mission_state == '0' ){
      return 'ion-ios-circle-outline';
    } else{
      return 'ion-ios-checkmark-outline';
    }
  }
})
// 任务描述
.filter('task_description', function($filter,Task) {

  return function(task){
     var description = '';
    // 类型
    var type = Task.taskTypes[task.type];
    description += type ? type.name : '';

    // 门店名称
    if( type.id == '1' || task.mission_state == '1' ){
      description += ' ' + task.leaguer_name;
    }

    // 完成时间
    if( task.mission_state == '1' ){
      description += $filter('date')(parseInt(task.update_date) * 1000, ' @yyyy-MM-dd HH:mm');
    }

    return description;
  }
})