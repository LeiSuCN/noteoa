angular.module('mwnoteoa.controllers', ['ionic'])

// 任务管理
.controller('TaskCtrl', function($scope, $ionicHistory, $ionicLoading, $location,$ionicViewService, Task, User) {

  $scope.sumary0 = { done:0 };
  $scope.tasks0 = [];
  $scope.sumary1 = { done:0 };
  $scope.tasks1 = [];

  $scope.today = new Date();

  // 更新今日任务列表
  function updateTodayTasksView( todayTasks ){

    // 初始化统计数据
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

    // 传递任务统计
    Task.setShareValue('TaskCtrl.sumary0', $scope.sumary0);
    Task.setShareValue('TaskCtrl.tasks0', $scope.tasks0);
    Task.setShareValue('TaskCtrl.tasks1', $scope.tasks1)
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
.controller('TaskAddCtrl', function($scope, $ionicHistory, $ionicLoading, $state, Task, User) {

  console.log( 'mwnoteoa.controllers.TaskAddCtrl is initializing...' );

  var types = {
    'addstore': '0',
    'updstore': '1'
  }

  // 任务提交计数
  var taskCount = 0;
  // 要删除的任务
  var _delUpdTasks = {} 

  // 当前用户
  var me = User.me();
  // TaskCtrl传递的共享变量
  var taskCtrlSumary0 = Task.getShareValue('TaskCtrl.sumary0');
  var taskCtrlTasks0 = Task.getShareValue('TaskCtrl.tasks0');
  var taskCtrlTasks1 = Task.getShareValue('TaskCtrl.tasks1');

  // 拓展任务数量
  $scope.addStore = taskCtrlTasks0 ? taskCtrlTasks0.length : 0;
  // 拓展任务数最小数字：已完成的最小数字
  var minAddStoreNum = taskCtrlSumary0.done;
  var maxAddStoreNum = 99;
  // 维护任务列表
  $scope.updStore = [];
  angular.forEach(taskCtrlTasks1, function(task){
    $scope.updStore.push({
      id: task.leaguer_id,
      leaguer_name: task.leaguer_name,
      boss_phone: task.boss_phone,
      address: task.address
    });
  });
  // 减少开拓任务
  $scope.decreaseAddStore = function( ){
    if( $scope.addStore <= minAddStoreNum ){
      return;
    }
    $scope.addStore = $scope.addStore - 1;
  }
  // 增加开拓任务
  $scope.increaseAddStore = function( ){
    if( $scope.addStore >= maxAddStoreNum ){
      return;
    }
    $scope.addStore = $scope.addStore + 1;
  }
  // 减少维护任务
  $scope.delUpdStore = function(store){
    var exist = store._exist;

    for( var i = 0 ; i < $scope.updStore.length ; i++ ){
      var current = $scope.updStore[i];
      if( current.id == store.id ){
        $scope.updStore.splice(i,1);
        break;
      }
    }

    // 将要删除的已经存在的任务
    angular.forEach( taskCtrlTasks1, function(task){
      if( task.leaguer_id == store.id ){
        _delUpdTasks[store.id] = task;
      }
    });
  }

  $scope.toSelectStore = function(){

    Task.setShareValue('TaskStoreSearchCtrl.exclude', $scope.updStore);

    $state.go( 'tab.task-ssearch');
  }
  Task.setShareValue('TaskStoreSearchCtrl.selecteStore', function(store){
    $scope.updStore.push( store );
    // 如果已经删除 需要恢复
    for( var taskId in _delUpdTasks ){
      if( _delUpdTasks[taskId] 
        && _delUpdTasks[taskId].leaguer_id == store.id ){
        _delUpdTasks[taskId] = false;
      }
    }
  });

  $scope.taskStore = { type: false, store:false };

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

    var tasks = [];
    var delTasks = [];

    $ionicLoading.show({ template: '正在创建任务...' });

    if( $scope.addStore > minAddStoreNum ){ // 提交维护任务
      // 增加维护任务
      if( $scope.addStore > taskCtrlTasks0.length ){
        var task = {};
        task.handlerId = me.id;
        task.handlerName = me.name;
        task.handlerPhone = me.phone;
        task.type = 0;
        task.mNum = $scope.addStore - taskCtrlTasks0.length;
        tasks.push( task );        
      }
      // 删除维护任务
      else if( $scope.addStore < taskCtrlTasks0.length ){
        var count = taskCtrlTasks0.length - $scope.addStore;
        for( var i = taskCtrlTasks0.length -1 ; i >=0  ; i-- ){
          var task = taskCtrlTasks0[i];
          if( task.mission_state == '0' ){
            delTasks.push( task.id );
          }

          if( delTasks.length == count )break;
        }
      }
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

      // 已经维护的任务不在提交
      var exist = false;
      angular.forEach( taskCtrlTasks1, function(task){
        if( task.leaguer_id == store.id ){
          exist = true;
        }
      });

      if( !exist ){
        tasks.push( task );
      }
    });

    for( var tid in _delUpdTasks ){
      if( _delUpdTasks[tid] ){
        delTasks.push( _delUpdTasks[tid].id )
      }
    }

    console.log( delTasks );
    console.log( tasks ); 

    // 删除任务
    if( delTasks.length > 0 ){
      var task = {};
      task.handlerId = me.id;
      task.type = 9;
      task.ids = delTasks;
      tasks.push( task );         
    }

    taskCount = tasks.length;
    if( taskCount <= 0 )return;
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
.controller('TaskStoreSearchCtrl', function($scope, $state, $ionicHistory, $ionicPopup, $ionicLoading, Store, Task, User) {

  console.log( 'mwnoteoa.controllers.TaskStoreSearchCtrl is initializing...' );

  var excludeStores = Task.getShareValue('TaskStoreSearchCtrl.exclude');
  excludeStores = excludeStores ? excludeStores : [];
  var selecteStore = Task.getShareValue('TaskStoreSearchCtrl.selecteStore');

  // 门店区域搜素
  $scope.searchAreaID = '440300';
  $scope.searchAreaName = '全市';
  $scope.searchPage = 0;
  // 每页大小
  var limit = 20;
  $scope.hasMore = true;
  // 更新门店列表
  $scope.stores = [];

  var me = User.me();

  /*
   * 向列表中加入门店数据
   */
  function addStore( store ){
    var cStore = {};
    cStore.id = store.id;
    cStore.leaguer_name = store.leaguer_name;
    cStore.boss_phone = store.boss_phone;
    cStore.area_id = store.area_id;
    cStore.address = store.address;
    cStore.checked = false;
    
    var exclude = false;    
    // 排除选取的门店
    for( var i = 0 ; i < excludeStores.length ; i++ ){
      if( excludeStores[i].id == cStore.id ){
        exclude = true;
        break;
      }
    }  
    if( !exclude ){
      $scope.stores.push( cStore );
    }
  }

  /**
   * 按照查询条件分页查询
   */
  function getStoresByPage(){

    var query = {handlerId:me.id, areaId: $scope.searchAreaID};
    query.page = $scope.searchPage;
    query.limit = 20;
    $ionicLoading.show({ template: '正在查询门店...' });
    Store.get( query, function(status, statusText, data){
      console.log( data.length )
      $scope.hasMore = data && data.length == limit
      $scope.searchPage = $scope.searchPage + 1;

      angular.forEach( data, function( store ){
        addStore( store );
      });
      $ionicLoading.hide();
    });
  }

  $scope.gotoSelect = function(){
    Store.share.leaguerSearchCallback = function(areaId, areaName){
      $scope.searchAreaID = areaId;
      $scope.searchAreaName = areaName;
      angular.element('#taskStoreSearch_SearchBtnArea_AreaBtn').html( areaName );
      Store.share.leaguerSearchCallback = false;
      $scope.stores.length = 0;
      $scope.searchPage = 0;
      getStoresByPage();
    };
    $state.go( 'tab.store-area-select')
    
  }

  $scope.getMore = function(){
    getStoresByPage();
  }

  $scope.confirm = function(){

    angular.forEach( $scope.stores, function( store){
      if( store.checked ){
        if( selecteStore ){
          selecteStore( store );
        }
      }
    });
    $ionicHistory.goBack();
  }

  getStoresByPage();
})

//
// ======== ======== ======== ========>> 查看&提交管理 <<======== ======== ======== ========
//
.controller('TaskDetailCtrl', function($scope, $stateParams, $ionicHistory
    , $ionicPopup,  $ionicLoading, Task, Store, User) {
  
  $scope.hideMain = true;
  $scope.hideEnv = true;
  $scope.hideHard = true;
  $scope.hideSoft = true;
  $scope.hideBose = true;

  $scope.hideQuestions = true;

  var _task = Task.getTodayTask( $stateParams.taskId );

  if( _task.type == '0' && _task.mission_state == '0' )_task.leaguer_name = '';

  Task.setShareValue('current_task_detail', _task);

  var me = User.me();

  function popAlert(msg,title){

    $ionicPopup.alert({ template: msg, title: title? title : '' }).then( function(resp){});
  }

  $scope.task={
    type: _task.type,
    handlerId: me.id,
    handlerName: me.name,
    missionId: _task.id,
    leaguerName: _task.leaguer_name,
    leaguerId: _task.leaguer_id,
    cityId: "440300",
    areaId: _task.area_id,
    address: _task.address,
    bossName: _task.boss_name,
    bossPhone: _task.boss_phone,
    mission_state: _task.mission_state,
    record: _task.record ? _task.record.content : ''
  }

  $scope.task.questions = [ {question_title:''} ];

  $scope.addQuestion = function(){
    var question = { question_title: '' };
    $scope.task.questions.push( question );
  }

  /**
   * 提交任务
   */
  $scope.submit = function(){

    var task = $scope.task;

    // 更新流程
    if( task.mission_state == '1' ){

      var updateCount = 0;
      var updateRecord = false;

      // 更新工作日志
      if( _task.type == '1' && task.record != _task.record.content ){
        updateRecord = { recordId:_task.record.recordId, content:task.record}
        updateCount = updateCount + 1;
      }

      // 新增问题记录
      var questions = [] ;
      angular.forEach($scope.task.questions, function( question ){
        if( question.question_title && question.question_title.length > 0 
            && !question.create_date ){
          //{'handlerId*','leaguerId*','areaId*','missionId*','questionTitle*','questionContent*'}
          questions.push({ 
            handlerId: me.id,
            leaguerId: _task.leaguer_id,
            areaId: _task.area_id,
            missionId: _task.id,
            questionTitle: question.question_title
          });
          updateCount = updateCount + 1;
        }
      })

      if( updateCount > 0 ){

        $ionicLoading.show({ template: '正在提交任务...' });

        if( updateRecord ){
          Task.updateRecord( updateRecord, function(record, msg, data){
            updateCount = updateCount - 1;
            if( updateCount <= 0 ){
              $ionicLoading.hide();
              $ionicHistory.goBack();
            }
          });
        }

        if( questions.length > 0 ){
          angular.forEach(questions, function( question ){
            Task.createQuestion( question, function(record, msg, data){
              updateCount = updateCount - 1;
              if( updateCount <= 0 ){
                $ionicLoading.hide();
                $ionicHistory.goBack();
              }
            });
          })
        }
      }

      return;
    }

    if( !task.leaguerName ){
      popAlert('门店名称不能为空！');return;
    }
    if( !task.bossName ){
      popAlert('老板姓名不能为空！');return;
    }
    if( !task.bossPhone ){
      popAlert('老板电话不能为空！');return;
    }
    if( !task.areaId ){
      popAlert('门店区域不能为空！');return;
    }
    if( !task.address ){
      popAlert('门店地址不能为空！');return;
    }

    var questions = [] ;
    angular.forEach($scope.task.questions, function( question ){
      if( question.question_title.length > 0 )
        questions.push( { questionTitle: question.question_title} );
    })

    $scope.task.questions = questions;

    if( !task.record && task.type == '1'){
      popAlert('维护记录不能为空！');return;
    }

    $ionicLoading.show({ template: '正在提交任务...' });

    Task.updateTask( $scope.task, function(resp){
        Task.getTodayTasks( {handlerId: me.id}, function(resp){
          console.log( resp );
          $ionicLoading.hide();
          $ionicHistory.goBack();
        })
    })
  }

  // 展开问题列表
  $scope.toggleQuestionList = function(){
    var eleList = angular.element( '#question_list' );
    eleList.fadeToggle('fast');
    var eleArror = angular.element('#qustionListArrow');
    if( eleArror.hasClass('ion-ios-arrow-down') ){
      eleArror.removeClass('ion-ios-arrow-down')
      eleArror.addClass('ion-ios-arrow-right')
    } else{
      eleArror.removeClass('ion-ios-arrow-right')
      eleArror.addClass('ion-ios-arrow-down')
    }    
  }

  if( _task.mission_state == '0' ){
    //setTimeout("angular.element('#task_detail_btn_submit').show()", 500)
  }

  // 获取问题列表
  Task.getQuestions({handlerId: me.id, missionId: _task.id }, function(code, msg, data){
    if( data && data.length > 0 ){
      $scope.task.questions.length = 0;
      angular.forEach( data, function(question){
        $scope.task.questions.push( question );
      });      
    }
  });

  // 如果任务为拓展任务且任务状态为提交状态
  // 则需要获取任务信息
  if( _task.type == '0' || _task.status == '1' ){

    Store.getOne( _task.leaguer_id,function(data){

      data = data[0];
      // 门店地理位置
      //$scope.task.
      // 入口位置
      $scope.task.faceSide = data.face_side;
      // 开业时间
      $scope.task.openingTime = data.opening_time;
      // 营业时长
      $scope.task.openDate = data.open_date;
      // 门店主营业务
      $scope.task.majorBusiness = data.major_business;
      // 门店周边环境
      $scope.task.aroundType = data.around_type;
      // 辐射人群消费水平
      $scope.task.avgSpending = data.avg_spending;
      // 辐射人流量（人／天）
      $scope.task.avgPersonAround = data.avg_person_around;
      // 门店面积
      $scope.task.storeAcreage = data.store_acreage;
      // 店内设施
      $scope.task.storeEquipment = data.store_equipment;
      // 存放面积
      $scope.task.houseAcreage = data.house_acreage;
      // 门店经营人数
      $scope.task.storeMemberNum = data.store_member_num;
      // 年龄段
      $scope.task.storeMemberAge = data.store_member_age;
      // 老板是否参与
      $scope.task.bossIn = data.boss_in;

      // 进店人流量
      $scope.task.avgPersonAround = data.avg_person_around;
      // 营业额
      $scope.task.avgSellDay = data.avg_sell_day;

      // 年龄
      $scope.task.bossAge = data.boss_age;
      // 家庭成员
      $scope.task.bossHomeMember = data.boss_home_member;
      // 手机型号
      $scope.task.boss_phone = data.bossPhone;
      // 微信号
      $scope.task.bossWechat = data.boss_wechat;
    }, true);

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

//
// ======== ======== ======== ========>> 门店查询 <<======== ======== ======== ========
//
.controller('StoreCtrl', function($scope,$state, Store, User) {

  var me = User.me();
  var isHasMore = true;
  var limit = 20;
  var page = -1;

  // 查询条件
  $scope.queryCondition = { leaguerName: '', areaId:'', areaName: '', handlerId: me.id };
  Store.share.leaguerSearchCondition = $scope.queryCondition;

  // 门店列表
  $scope.stores = [];

  // 更新门店列表
  function updateStoreListView(stores){
    var i = 0;
    angular.forEach(stores, function(store){
      $scope.stores.push( store );
      i++;
    });
    return i;
  }

  /*
   * 获取当前查询条件
   */
  function getCurrentQueryCondition(){
    var query = {};
    if( $scope.queryCondition.leaguerName ) query.leaguerName = $scope.queryCondition.leaguerName;
    if( $scope.queryCondition.handlerId ) query.handlerId = $scope.queryCondition.handlerId;
    if( $scope.queryCondition.areaName ) query.areaName = $scope.queryCondition.areaName;
    if( $scope.queryCondition.areaId ) query.areaId = $scope.queryCondition.areaId;
    query.page = page;
    query.limit = limit;

    return query;
  }

  $scope.gotoSelect = function(){
    Store.share.leaguerSearchCondition = $scope.queryCondition;
    Store.share.leaguerSearchCallback = function(areaId, areaName){
      Store.share.leaguerSearchCallback = false;
      $scope.search();
    }
    $state.go( 'tab.store-area');
  }

  $scope.gotoStore = function(store,$event){
    var srcEle = $event.originalEvent.srcElement;
    if( srcEle && (srcEle.nodeName == 'A' || srcEle.nodeName == 'a') ){

    } else{
      $state.go( 'tab.store-detail', {storeId:store.id});
    }
  }

  $scope.search = function( query ){

    // 如果不带query，则复位查询条件
    if( !query ){
      $scope.stores.length = 0;
      page = 0;
      query = getCurrentQueryCondition();
    }

    Store.search( query, function(resp){
      var count = updateStoreListView( resp );
      isHasMore = ( count >= limit );
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }

  /*
   * 加载更多数据
   */
  $scope.loadMore = function(){

    page = page + 1;
    var query = getCurrentQueryCondition();

    $scope.search(query);
  }


  /*
   * 是否有跟多数据
   */
  $scope.hasMore = function(){
    return isHasMore;
  }

  /*
   * 事件监听：状态加载成功
   */
  $scope.$on('$stateChangeSuccess', function(){
    $scope.loadMore();
  });
})

//
// 门店查询 - 区域选择
// 
.controller('StoreAreaCtrl', function($scope, $ionicHistory, Store) {
  $scope.area = 'ba';

  $scope.areas = [
    { id: '440301001', name: '大浪街道', cate: 'ba' },
    { id: '440301002', name: '福永街道', cate: 'ba' },     
    { id: '440301003', name: '龙华街道', cate: 'ba' },     
    { id: '440301004', name: '明治街道', cate: 'ba' },     
    { id: '440301005', name: '沙井街道', cate: 'ba' },     
    { id: '440301006', name: '石岩街道', cate: 'ba' },     
    { id: '440301007', name: '西乡街道', cate: 'ba' },     
    { id: '440301008', name: '新安街道', cate: 'ba' }, 

    { id: '440302001', name: '福保街道', cate: 'ft' },   
    { id: '440302002', name: '福田保税区', cate: 'ft' },    
    { id: '440302003', name: '福田街道', cate: 'ft' },      
    { id: '440302004', name: '华富街道', cate: 'ft' },      
    { id: '440302005', name: '梅林街道', cate: 'ft' },      
    { id: '440302006', name: '南园街道', cate: 'ft' },      
    { id: '440302007', name: '沙头街道', cate: 'ft' },      
    { id: '440302009', name: '香蜜湖街道', cate: 'ft' },    
    { id: '440302010', name: '园岭街道', cate: 'ft' }, 

    { id: '440303001', name: '坂田街道', cate: 'lg' },      
    { id: '440303002', name: '布吉街道', cate: 'lg' },      
    { id: '440303003', name: '坑梓街道', cate: 'lg' },      
    { id: '440303004', name: '南湾街道', cate: 'lg' },      
    { id: '440303005', name: '平湖街道', cate: 'lg' },      
    { id: '440303006', name: '横岗街道', cate: 'lg' },      
    { id: '440303007', name: '龙城街道', cate: 'lg' },      
    { id: '440303008', name: '龙岗街道', cate: 'lg' }, 

    { id: '440304001', name: '龙华新区', cate: 'lhx' },           
    { id: '440304002', name: '民治街道', cate: 'lhx' }, 

    { id: '440305001', name: '翠竹街道', cate: 'lh' },     
    { id: '440305002', name: '东湖街道', cate: 'lh' },     
    { id: '440305003', name: '黄贝街道', cate: 'lh' },     
    { id: '440305004', name: '东晓街道', cate: 'lh' },     
    { id: '440305005', name: '清水河街道', cate: 'lh' },   
    { id: '440305006', name: '桂园街道', cate: 'lh' },     
    { id: '440305007', name: '东门街道', cate: 'lh' },     
    { id: '440305008', name: '莲塘街道', cate: 'lh' },     
    { id: '440305009', name: '南湖街道', cate: 'lh' },     
    { id: '440305010', name: '笋岗街道', cate: 'lh' },  

    { id: '440306001', name: '南山街道', cate: 'ns' },      
    { id: '440306002', name: '南头街道', cate: 'ns' },      
    { id: '440306003', name: '蛇口街道', cate: 'ns' },      
    { id: '440306004', name: '粤海街道', cate: 'ns' },      
    { id: '440306005', name: '招商街道', cate: 'ns' },      
    { id: '440306006', name: '沙河街道', cate: 'ns' },      
    { id: '440306007', name: '桃源街道', cate: 'ns' },      
    { id: '440306008', name: '西丽街道', cate: 'ns' },

    { id: '440300', name: '全市', cate: 'sz' }

  ];


  $scope.result = { selected: $scope.areas[0].id };


  $scope.submit = function(){
    var areaId = false;
    var areaName = false;
    for( var i = 0 ; i < $scope.areas.length; i++ ){
      var strea = $scope.areas[i];
      if( strea.id == $scope.result.selected ){
        areaId = strea.id;
        areaName = strea.name;
        break;
      }
    }

    if( areaId ){
      if( Store.share.leaguerSearchCondition ){
        Store.share.leaguerSearchCondition.areaId = areaId;
        Store.share.leaguerSearchCondition.areaName = areaName;
      }

      if( Store.share.leaguerSearchCallback ){
        Store.share.leaguerSearchCallback(areaId, areaName);
      }
    }

    $ionicHistory.goBack();
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
      $scope.store = store[0];
      oldStore = store;
    }, true);
  }

  var formScope = false;

  $scope.setFormScope = function( scope ){
    formScope = scope;
  }

  $scope.save = save;
  $scope.change = change;

  search();
})

// 我的隐私
.controller('PersonCtrl', function($scope,$state, User) {
  console.log( 'mwnoteoa.controllers.PersonCtrl is initializing...' );
  $scope.me = User.me();

  console.log( $scope.me )

  $scope.logout = function(){
    User.save({});
    $state.go( 'tab.login')
  }
})

// 登陆
.controller('LoginCtrl', function($scope, $state, $ionicPopup, $ionicLoading, User) {
  console.log( 'mwnoteoa.controllers.LoginCtrl is initializing...' );
  var me = User.me();
  $scope.user = {
    uname: me.phone,
    pwd: ''
  };

  function popAlert(msg,title){
    $ionicPopup.alert({ template: msg, title: title? title : '' }).then( function(resp){});
  }

  $scope.login = function(){

    $ionicLoading.show({ template: '正在登录...' });

    User.login($scope.user, function(resp){

      console.log( resp )
      $ionicLoading.hide();

      if( resp.data ){
        var code = resp.data.code;
        var msg = resp.data.text;
        if( code == '10000' ){
          User.save( resp.data.user )
          $state.go( 'tab.task')
        } else{
          popAlert(msg, '登录失败 ')
        }
      }
    });
  }

})

.controller('TabsCtrl', function($scope, $rootScope, $state, $ionicHistory,$ionicViewService, User) {
  console.log( 'mwnoteoa.controllers.TabsCtrl is initializing...' );

  $rootScope.$on('$ionicView.afterEnter', function() {
      $rootScope.hideTabs = false;
      if($state.current.name === 'tab.login') {
        $rootScope.hideTabs = true;
      } else{
        // 要先登录哦
        var me = User.me();
        if( !me || !me.phone ){

        $ionicViewService.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });

        $state.go( 'tab.login')

        }
      }
  });
});
