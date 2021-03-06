// 显示警告框服务
angular.module('myApp')
    .factory('Alert', ['$alert', function($alert) {
        var showAlert = function(option) {
            if (option == undefined) {
                option = {};
            } 
            title = option.title || '';
            content = option.content || '执行成功';
            container = option.container || '#alertContainer';
            type = option.type || 'success';
            duration　 = 　option.duration || 3;
            // 配置项
            var alertOption = {
                // placement: placement,
                title: title,
                content: content,
                container: container,
                type: type,
                duration: duration　,
                show: false
            };

            // 初始化配置项
            var myAlert = $alert(alertOption);

            // 显示模态框
            myAlert.$promise.then(myAlert.show);
        };

        return {
            show: showAlert
        };
    }]);
