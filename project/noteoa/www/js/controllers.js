angular.module('mwnoteoa.controllers', [])

// 任务管理
.controller('TaskCtrl', function($scope, Task) {

  $scope.test = function(msg){
    alert( msg );
  }

  $scope.todayTasks = Task.getTasks();

  // 查看任务内容
  $scope.viewTodayTaskContent = function(){
    var task = this.task;
    console.log( task );
  }

})
// 任务详情
.controller('TaskDetailCtrl', function($scope, $stateParams, Task) {
  $scope.taskId = $stateParams.taskId;

  function showTaskDetail(){

  }

})
.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
