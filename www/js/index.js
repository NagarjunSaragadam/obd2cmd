var app = {
        // Application Constructor
        initialize: function () {
            app.bindEvents();
        },
        bindEvents: function () {
            document.addEventListener('deviceready', app.onDeviceReady, false);
        },
        onDeviceReady: function () {
            window.plugins.imeiplugin.getImei(callback);    
        }
    };
    function callback(imei) {
        var element=document.getElementById("demo");
        element.value=imei;

    }
