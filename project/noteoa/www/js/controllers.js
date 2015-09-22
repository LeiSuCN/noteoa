angular.module('mwnoteoa.controllers', ['ionic'])

// 任务管理
.controller('TaskCtrl', function($scope, $ionicHistory, $ionicLoading, Task, User) {

  $scope.sumary0 = { done:0 };
  $scope.tasks0 = [];
  $scope.sumary1 = { done:0 };
  $scope.tasks1 = [];

  // 更新今日任务列表
  function updateTodayTasksView( todayTasks ){

    $scope.sumary0.done = 0;
    $scope.tasks0.length = 0;
    $scope.sumary1.done = 0;
    $scope.tasks1.length = 0;

    angular.forEach( todayTasks, function( task ){

      var sumary, tasks;
      if( task.type == '0' ){
        sumary = $scope.sumary0;
        tasks = $scope.tasks0;
      } else if( task.type == '1' ){
        sumary = $scope.sumary1;
        tasks = $scope.tasks1;
      }

      if( task.mission_state == '0' ){
        if( task.type == 0)
          task.leaguer_name = '任务' + ( tasks.length - sumary.done + 1);
        tasks.push( task );
      } else{
        sumary.done = sumary.done + 1;
        tasks.splice(0,0, task );
      }
    });
  }

  //
  $scope.toggle = function( code ){
    var eleList = angular.element( '#task_list_' + code );
    eleList.fadeToggle('fast');
    var eleArror = angular.element('#arrow' + code);
    if( eleArror.hasClass('ion-ios-arrow-down') ){
      eleArror.removeClass('ion-ios-arrow-down')
      eleArror.addClass('ion-ios-arrow-right')
    } else{
      eleArror.removeClass('ion-ios-arrow-right')
      eleArror.addClass('ion-ios-arrow-down')
    }
  }

  // 获取今天任务
 $scope.getTodayTasks = function(){
    $scope.sumary0.done = 0;
    $scope.sumary1.done = 0;
    var me = User.me();
    $ionicLoading.show({ template: '正在查询任务...' });
    Task.getTodayTasks({handlerId: me.id},function(resp){
      
      updateTodayTasksView( resp );

      $ionicLoading.hide();
      Task.setTodayTasksView( updateTodayTasksView );
    });
  }

  Task.setShareValue('TaskCtrl.scope.tasks1', $scope.tasks1);

  $scope.getTodayTasks();

})

// 工作管理 - 新增任务
.controller('TaskAddCtrl', function($scope, $ionicHistory, $ionicLoading, Task, User) {

  var types = {
    'addstore': '0',
    'updstore': '1'
  }

  var taskCount = 0;

  var me = User.me();

  // 拓展任务数量
  $scope.addStore = 2;
  // 维护任务列表
  $scope.updStore = [];


  $scope.decreaseAddStore = function( ){
    if( $scope.addStore <= 0 ){
      return;
    }
    $scope.addStore = $scope.addStore - 1;
  }

  $scope.increaseAddStore = function( ){
    if( $scope.addStore >= 99 ){
      return;
    }
    $scope.addStore = $scope.addStore + 1;
  }

  $scope.increaseUpdStore = function(){

    var oldUpdStore = $scope.updStore;
    var newUpdStore = [];

    angular.forEach( oldUpdStore, function(delStore){

      if( !delStore.delete ){
        newUpdStore.push( delStore );
      }
    });

    $scope.updStore.length = 0;
    angular.forEach( newUpdStore, function(store){
      $scope.updStore.push( store );
    });
  }

  $scope.taskStore = { type: false, store:false };
  Task.setShareValue('task-stores', $scope.updStore);

  function typeChange(){
    var type = $scope.taskStore.type;
    if( type == types.updstore ){
      angular.element('.for-updstore').show();
    } else{
      angular.element('.for-updstore').hide();
    }
  }

  function saveOne(task){
    Task.createTask( task, function(resp){ 
      taskCount = taskCount - 1;
      if( taskCount <= 0 ){
        Task.getTodayTasks( {handlerId: me.id}, function(resp){
          $ionicLoading.hide();
          $ionicHistory.goBack();
        })
      }   
    });
  }

  function save(){

    taskCount = $scope.updStore.length;
    if( $scope.addStore > 0 )taskCount = taskCount + 1;

    if( taskCount <= 0 ) return;

    var tasks = [];

    $ionicLoading.show({ template: '正在创建任务...' });

    if( $scope.addStore > 0 ){ // 提交维护任务
      var task = {};
      task.handlerId = me.id;
      task.handlerName = me.name;
      task.handlerPhone = me.phone;
      task.type = 0;
      task.mNum = $scope.addStore;
      tasks.push( task );
    }

    angular.forEach( $scope.updStore, function(store){
      var task = {};
      task.handlerId = me.id;
      task.handlerName = me.name;
      task.handlerPhone = me.phone;
      task.type = '1';
      task.leaguerId = store.id;
      task.leaguerName = store.leaguer_name;
      task.address = $scope.taskStore.store.address;
      task.bossPhone = store.boss_phone;
      tasks.push( task );
    });

    angular.forEach( tasks, function(task){
      saveOne(task)
    });
  }

  $scope.types = types;
  $scope.typeChange = typeChange;
  $scope.save = save;

  typeChange();
})


// 工作管理 - 新增任务 - 选择门店
.controller('TaskStoreSearchCtrl', function($scope, $ionicHistory, Store, Task) {

  console.log( 'mwnoteoa.controllers.TaskStoreSearchCtrl is initializing...' );

  // 已经添加过的门店
  var addedStores = Task.getShareValue('task-stores');
  var choosedStores = Task.getShareValue('TaskCtrl.scope.tasks1');

  // 更新门店列表
  $scope.stores = [];

  Store.getAll( {handlerId:3 }, function(resp){
    angular.forEach( resp, function( store ){
      var cStore = {};
      cStore.id = store.id;
      cStore.leaguer_name = store.leaguer_name;
      cStore.boss_phone = store.boss_phone;
      cStore.area_id = store.area_id;
      cStore.address = store.address;
      cStore.checked = false;
      // 已经添加的门店不再选取
      for( var i = 0 ; i < addedStores.length ; i++ ){
        if( addedStores[i].id == cStore.id ){
          cStore.checked = true;
          break;
        }
      }
      // 已经生成任务的门店不在选取
      for( var i = 0 ; i < choosedStores.length ; i++ ){
        if( choosedStores[i].leaguer_id == cStore.id ){
          cStore.checked = true;
          break;
        }
      }

      if( !cStore.checked ){
        $scope.stores.push( cStore );
      }
    });
  });

  $scope.confirm = function(){

    angular.forEach( $scope.stores, function( store){
      if( store.checked ){
        addedStores.push(store);
      }
    });
    $ionicHistory.goBack();
  }
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

  if( task.mission_state != '0' ){
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
    missionId: task.id,
    questionTitle: '',
    questionContent: ''
  }

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
