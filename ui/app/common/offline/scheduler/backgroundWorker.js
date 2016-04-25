Bahmni.Common.Offline.BackgroundWorker = function(WorkerService, offlineService) {

    var app;
    if(offlineService.isChromeApp()){
        app = 'chrome-app';
    }else if(offlineService.isAndroidApp()){
        app = 'android-app';
    }
    var getUrl = function(path) {
        return chrome.runtime.getURL("app/" + path);
    };

    WorkerService.addToLocalStorage("host", localStorage.getItem('host'));
    WorkerService.addToLocalStorage("catchmentNumber", localStorage.getItem('catchmentNumber'));
    WorkerService.addToLocalStorage("LoginInformation", localStorage.getItem('LoginInformation'));
    WorkerService.addToLocalStorage("schedulerInterval", localStorage.getItem('schedulerInterval'));
    WorkerService.setAngularUrl(getUrl("components/angular/angular.js"));
    WorkerService.includeScripts(getUrl('common.offline.min.js'));
    WorkerService.addDependency('scheduledSync', 'bahmni.common.offline', getUrl('common.background.min.js'));

    var workerPromise = WorkerService.createAngularWorker(['input', 'output', '$http', 'offlineService', 'scheduledSync',
        function (input, output, $http, offlineService, scheduledSync) {
        app = input.app;
        offlineService.isAndroidApp = function(){
            return app === 'android-app';
        };
        offlineService.isChromeApp = function(){
            return app === 'chrome-app';
        };
        scheduledSync();
    }]);

    workerPromise.then(function success(angularWorker) {
            return angularWorker.run({'app': app});
        }, function error(reason) {
            console.log('callback error');
            console.log(reason);
        }
    ).then(function success(result) {
            console.log('success');
            console.log(result);
        }, function error(reason) {
            console.log('error');
            console.log(reason);
        }, function notify(update) {
            console.log(update);
        }
    );
};