
var app = {
   
    
 
    initialize: function() {
        this.bindEvents();		
	},

/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);  		
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {  	
		var sdsd=device.uuid;
        alert(device.uuid);	 
		document.getElementById('deviceid').innerHTML=sdsd;
		
		
		$("#scan").click(function () {
            app.scan();
        });
    },
	
	 scan: function() {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (!result.cancelled) {
                    alert(result.text+document.getElementById('deviceid').innerHTML);													
                    window.location.href = 'http://nagarjun558.5gbfree.com/index2.html?Fileid='+result.text+'$'+document.getElementById('deviceid').innerHTML;
                }
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
       );
    }
	
   



    
	
};     

