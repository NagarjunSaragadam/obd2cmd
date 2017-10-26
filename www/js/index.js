
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
					var str = document.getElementById('deviceid').innerHTML;
                    str = str.replace(/[^0-9]+/ig,"");					
					var count=((parseInt(result.text)+parseInt(str))*20)/34;
                    alert(result.text+document.getElementById('deviceid').innerHTML);		
					document.getElementById('Keyresult').innerHTML='Your File Key'+count;
                    /*window.location.href = 'http://nagarjun558.5gbfree.com/index2.html?Fileid='+result.text+'$'+document.getElementById('deviceid').innerHTML;*/
                }
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
       );
    }
	
   



    
	
};     

