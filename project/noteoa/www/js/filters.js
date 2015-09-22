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
    description += ' ' + task.leaguer_name;
    //if( type.id == '1' || task.mission_state == '1' ){
    //  description += ' ' + task.leaguer_name;
    //}

    // 完成时间
    if( task.mission_state == '1' ){
      description += ' － 已完成' + $filter('date')(parseInt(task.update_date) * 1000, ' @HH:mm');
    } else{
      description += ' － 等待提交';
    }

    return description;
  }
})
// 区域
.filter('areaid2name', function() {

  return function(areaId){
    var areaName = '';

    switch( areaId ){
      case "440300001": areaName = "宝安"; break;
      case "440300002": areaName = "南山"; break;
      case "440300003": areaName = "福田"; break;
      case "440300004": areaName = "龙岗"; break;
      case "440300005": areaName = "罗湖"; break;
      case "440300006": areaName = "龙华"; break;
      default: areaName = '';
    }

    return areaName;
  }
})