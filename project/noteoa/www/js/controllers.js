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

// 门店查询
.controller('StoreCtrl', function($scope, Store) {

  var templateStoreListItem = angular.element('#template_store_list_item').html();

  // 更新门店列表
  function updateStoreListView(stores){
    
    var storeEles = '';
    angular.forEach(stores, function(store,key){
      storeEles += Mustache.render(templateStoreListItem, store);
    });

    var eleStoreList = angular.element('#store_list');
    eleStoreList.empty();
    eleStoreList.append( storeEles );
  }

  $scope.search = function(){
    Store.search( {handlerId:3,area:'南山' }, function(resp){
      var status = resp.status;

      if( status == 200 ){
        updateStoreListView( resp.data );
      }
    });
  }

})

// 门店详情
.controller('StoreDetailCtrl', function($scope, $stateParams, Store) {

  console.log( 'mwnoteoa.controllers.StoreDetailCtrl is initializing...' );

  var storeId = $stateParams.storeId;
  var oldStore = false;

  // 数据变化时
  function change( $event ){
    console.log( arguments )
  }

  // 保存门店数据
  function save(){

    var store = $scope.store;

    console.log( store )

    var newStore = {};
    newStore.storeId = store.id;
    newStore.boss_phone = store.boss_phone;
    newStore.boss_age = store.boss_age;

    Store.updateOne( newStore );
  }


  // 查询门店数据
  function search(){
    Store.getOne(storeId, function(store){
      $scope.store = store;
      oldStore = store;
    });
  }


  $scope.save = save;
  $scope.change = change;

  search();

  $scope.$watch( 'store', function(){
    angular.forEach( oldStore, function( oldValue, key){}, true)
})

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
