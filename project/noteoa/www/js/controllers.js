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
  return;
  if(window.localStorage.getItem("password") === "undefined" || window.localStorage.getItem("password") === null) {
    $ionicViewService.nextViewOptions({
        disableAnimate: true,
        disableBack: true
    });
    $location.path("#/tab/login");
  }

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
.controller('TaskStoreSearchCtrl', function($scope, $ionicHistory, $ionicPopup, Store, Task) {

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

//
// ======== ======== ======== ========>> 查看&提交管理 <<======== ======== ======== ========
//
.controller('TaskDetailCtrl', function($scope, $stateParams,$ionicHistory, $ionicPopup,  $ionicLoading, Task, Store, User) {
  
  $scope.hideMain = true;
  $scope.hideEnv = true;
  $scope.hideHard = true;
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
      console.log( data )
      data = data[0];
      // 门店地理位置
      //$scope.task.
      // 入口位置
      $scope.task.faceSide = data.face_side;
      // 开业时间
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

// 门店查询
.controller('StoreCtrl', function($scope,$state, Store, User) {

  var me = User.me();

  $scope.queryCondition = { leaguerName: '', areaId:'900000', areaName: '', handlerId: me.id };
  Store.share.leaguerSearchCondition = $scope.queryCondition;

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

  $scope.gotoSelect = function(){
    $state.go( 'tab.store-area')
  }

  $scope.search = function(){
    Store.search( $scope.queryCondition, function(resp){
      updateStoreListView( resp );
    });
  }

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
    { id: '440306008', name: '西丽街道', cate: 'ns' }

  ];


  $scope.result = { selected: $scope.areas[0].id };


  $scope.submit = function(){
    if( Store.share.leaguerSearchCondition ){
      for( var i = 0 ; i < $scope.areas.length; i++ ){
        var strea = $scope.areas[i];
        if( strea.id == $scope.result.selected ){
          Store.share.leaguerSearchCondition.areaId = strea.id;
          Store.share.leaguerSearchCondition.areaName = strea.name;
          break;
        }
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
