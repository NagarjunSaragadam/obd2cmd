/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/


var app = {
    macAddress: "00:00:00:00:00:01",  // get your mac address from bluetoothSerial.list
    chars: "",
    trackGpsDelay: 400,
    carWatchDelay: 300,
    deepMode: false,
    trackServerDeepDelay: 60000 * 10,
    trackServerDelay: 500,
    connections: {
        engine: false,
        server: false
    },
    watchs: {
        gpsWatchID: false,
        headingWatchID: false,
        carWatchID: false,
        serverWatchID: false
    },
    
    
/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();
        alert("Starting OBD APP");        
    },
    
    carData: {},
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
        rpmButton.addEventListener('touchend', app.getCarRPM, false);
        spdButton.addEventListener('touchend', app.getCarSpeed, false);
        rtButton.addEventListener('touchend', app.getCarRadiatorTemp, false);
        eloadButton.addEventListener('touchend', app.getCarEngineLoad, false);
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
        alert("Getting list of bluetooth connected");
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    app.display(JSON.stringify(results));
                },
                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            app.display("Bluetooth is not enabled.")
        }

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {            
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device. ");            
                app.startBluetooth();                                                
        },  
    
    startBluetooth: function(){
        setTimeout(function(){
            bluetoothSerial.isEnabled(function(){
                app.display("Connecting...Process starting");
                app.clear();
                app.macAddress=txtdata.value;
                app.display("Connecting...Process starting "+app.macAddress);                
                bluetoothSerial.connect(app.macAddress, function(){                    
                    app.display("Bluetooth Connected to "+app.macAddress);
                    app.state('bluetooth', true);
                    bluetoothSerial.subscribe('\n');                       
                },function(){
                    app.state('bluetooth', false);
                    app.display("Unable to Connect to ODB Device");
                    app.disconnectServer();
                    app.startBluetooth();
                });
            },function(){
                app.state('bluetooth', false);
                app.log('Bluetooth Off', true);
                app.disconnectServer();
            });
        }, 2000);
    },       
    getCarRPM: function(){        
        app.carRequest('01 0C', function(response){
            if(response == false){
                app.connections.engine = false;
                app.carData.rpm = 0;
                app.display("Engine is in off state");
            }
            else{
                data = response.substr(12, 5).split(' ');
                app.carData.rpm = Math.round(((parseInt(data[0], 16)*256) + parseInt(data[1], 16) )/4);                
                if(app.carData.rpm > 0){
                    app.connections.engine = true;
                    app.display("Engine is in on");
                }else{
                    app.connections.engine = false;
                    app.carData.rpm = 0;
                    app.display("Engine is in off state");
                }
            }
        });
    },        
    getCarSpeed: function(){
        app.carRequest('01 0D', function(response){
            app.carData.speed = parseInt(response.substr(12, 2),16);            
        });
    },
    getCarRadiatorTemp: function(){
        app.carRequest('01 05', function(response){
            app.carData.rad = parseInt(response.substr(12, 2),16)-40;            
        });
    },
    getCarEngineLoad: function(){
        app.carRequest('01 04', function(response){
            app.carData.load = Math.round((parseInt(response.substr(12, 2),16)*100)/255);            
        });
    },
    
    carRequest: function(command, callback){
        app.sendCommand(command);
        return app.readResponse(callback);
    },
    sendCommand: function(command){
        bluetoothSerial.write(command+'\r');        
    },
    readResponse: function(callback){
        bluetoothSerial.read(function(response){
            if(response.substr(0, 7) == 'NO DATA') return false;
            return callback(response);
        });
    },    
    
/*
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });
    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
    },
/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display(error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }
};      // end of app

