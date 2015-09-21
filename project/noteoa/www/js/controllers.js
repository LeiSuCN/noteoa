angular.module('mwnoteoa.controllers', ['ionic'])

// 任务管理
.controller('TaskCtrl', function($scope, $ionicHistory, $ionicLoading, Task, User) {

  $scope.todayTasks = [];

  // 获取今天任务
 $scope.getTodayTasks = function(){
    var me = User.me();
    $ionicLoading.show({ template: '正在查询任务...' });
    Task.getTodayTasks({handlerId: me.id},function(resp){
      $scope.todayTasks = resp;
      $ionicLoading.hide();
    });

  }

  $scope.getTodayTasks();

})

// 工作管理 - 新增任务
.controller('TaskAddCtrl', function($scope, $ionicHistory, $ionicLoading, Task, User) {

  var types = {
    'addstore': '0',
    'updstore': '1'
  }

  var taskStore = { type: false, store:false };
  Task.setShareValue('task-store', taskStore);

  function typeChange(){
    var type = $scope.taskStore.type;
    if( type == types.updstore ){
      angular.element('.for-updstore').show();
    } else{
      angular.element('.for-updstore').hide();
    }
  }

  function save(){
    var task = {};
    // 公共部分
    var me = User.me();
    task.handlerId = me.id;
    task.handlerName = me.name;
    task.handlerPhone = me.phone;
    task.type = $scope.taskStore.type;
    if( $scope.taskStore.type == types.addstore ){
      task.mNum = 1;
    } else  if( $scope.taskStore.type == types.updstore ){
      task.leaguerId = taskStore.store.id;
      task.leaguerName = taskStore.store.leaguer_name;
      task.cityId = taskStore.store.city_id;
      task.areaId = taskStore.store.area_id;
      task.address = taskStore.store.address;
      task.bossName = taskStore.store.boss_name;
      task.bossPhone = taskStore.store.boss_phone;
    }

    $ionicLoading.show({ template: '正在创建任务...' });

    Task.createTask( task, function(resp){      
      Task.getTodayTasks( {handlerId: me.id}, function(resp){
        $ionicLoading.hide();
        $ionicHistory.goBack();
      })
    });
  }

  $scope.types = types;
  $scope.taskStore = taskStore;
  $scope.typeChange = typeChange;
  $scope.save = save;

  typeChange();
})


// 工作管理 - 新增任务 - 选择门店
.controller('TaskStoreSearchCtrl', function($scope, $ionicHistory, Store, Task) {

  console.log( 'mwnoteoa.controllers.TaskStoreSearchCtrl is initializing...' );

  // 更新门店列表
  $scope.stores = [];

  $scope.result = {
    store:false
  }

  Store.getAll( {handlerId:3 }, function(resp){
    $scope.stores = resp;
  });

  function confirm(){
    console.log( $scope.result.store )
    var choose = $scope.result.store;

    Task.getShareValue('task-store').store = choose;

    $ionicHistory.goBack();
  }

  $scope.confirm = confirm;

})

// 工作管理 - 任务详情
.controller('TaskDetailCtrl', function($scope, $stateParams,$ionicHistory,  $ionicLoading, Task, User) {
  var task = Task.getTodayTask( $stateParams.taskId );

  Task.setShareValue('current_task_detail', task);

  var me = User.me();

  $scope.task={
    type: task.type,
    handlerId: me.id,
    handlerName: me.name,
    missionId: task.id,
    leaguerName: task.leaguer_name,
    cityId: "440300",
    areaId: task.area_id,
    address: task.address,
    bossName: task.boss_name,
    bossPhone: task.boss_phone
  }

  $scope.submit = function(){

    $ionicLoading.show({ template: '正在提交任务...' });

    Task.updateTask( $scope.task, function(resp){
        Task.getTodayTasks( {handlerId: me.id}, function(resp){
          $ionicLoading.hide();
          $ionicHistory.goBack();
        })
    })

  }

  if( task.mission_status != '0' ){
    angular.element('#task_detail_btn_submit').attr('disabled','disabled');
  }
})

// 工作管理 - 任务详情 - 问题反馈
.controller('TaskQuestionCtrl', function($scope, $stateParams,$ionicHistory,  $ionicLoading, Task, User) {
  console.log( 'mwnoteoa.controllers.TaskQuestionCtrl is initializing...' );

  var task = Task.getShareValue('current_task_detail');
  var me = User.me();

  $scope.question = {
    handlerId: me.id,
    leaguerId: task.leaguer_name,
    areaId: task.area_id ? task.area_id : '0000',
    missionId: task.leaguer_id,
    questionTitle: '',
    questionContent: ''
  }
  console.log(task )
  console.log($scope.question )

  $scope.submit = function(){
    $ionicLoading.show({ template: '正在提交问题...' });
    Task.createQuestion( $scope.question, function(resp){

       $ionicLoading.hide();
       $ionicHistory.goBack();
    })
  }
})

// 门店查询
.controller('StoreCtrl', function($scope, Store, User) {

  $scope.searchStoreName = '';
  $scope.searchStoreArea = '9000000';

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

  var me = User.me();

  $scope.search = function(){
    Store.search( {handlerId:me.id}, function(resp){
      updateStoreListView( resp );
    });
  }

})

// 门店详情
.controller('StoreDetailCtrl', function($scope, $stateParams, $ionicPopup, Store) {

  console.log( 'mwnoteoa.controllers.StoreDetailCtrl is initializing...' );

  var storeId = $stateParams.storeId;
  var oldStore = false;

  // 数据变化时
  function change( $event ){
    console.log( arguments )
  }

  // 保存门店数据
  function save(){


    var hasChangedKeys = angular.element('.ng-dirty');

    if( hasChangedKeys.length <= 0 ){
      $ionicPopup.alert({
        title: '提示',
        template: '数据没有变化～'
      }).then(function(){});
      return;
    }

    var store = $scope.store;
    var newStore = {};
    newStore.storeId = store.id; // *store_id 必备

    angular.forEach(hasChangedKeys, function( ele ){
      var name = ele.name;
      newStore[name] = store[name];
    })

    Store.updateOne( newStore, function( resp ){
      if( resp.status == 200 ){
        $ionicPopup.alert({
          title: '提示',
          template: '修改成功'
        }).then(function(){ formScope.form.$setPristine(); });
      }
    } );
  }


  // 查询门店数据
  function search(){
    Store.getOne(storeId, function(store){
      $scope.store = store;
      oldStore = store;
    });
  }

  var formScope = false;

  $scope.setFormScope = function( scope ){
    formScope = scope;
  }

  $scope.save = save;
  $scope.change = change;

  search();
})
