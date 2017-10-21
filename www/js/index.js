var app = {
        // Application Constructor
        initialize: function () {
            app.bindEvents();
        },
        bindEvents: function () {
            document.addEventListener('deviceready', app.onDeviceReady, false);
        },
        onDeviceReady: function () {
                var element=document.getElementById("demo");
                element.value=cordova.plugins.uid.IMEI;
            console.log(cordova.plugins.uid.IMEI);
                alert(cordova.plugins.uid.IMEI);
        }
    };
    function callback(imei) {
        var element=document.getElementById("demo");
        element.value=imei;

    }
