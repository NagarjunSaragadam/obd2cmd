/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/


var app = {
    macAddress: "64:89:9A:7B:D2:36",  // get your mac address from bluetoothSerial.list
    chars: "",
    trackGpsDelay: 400,
    carWatchDelay: 300,
/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();
        alert("Starting SimpleSerial app");
    },
    
    carData: {},
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {
        // check to see if Bluetooth is turned on.
        // this function is called only
        //if isEnabled(), below, returns success:
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

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device.");
            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail                
            );
                app.startBluetooth();
                app.startTrackGps();
                app.startTrackHeading();
                app.startTrackCar();
        };       
        


        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
var disconnect = function () {
            alert("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
bluetoothSerial.isConnected(disconnect, connect);
    },
    
    
    
      carRequest: function(command, callback){
        app.sendCommand(command);
        return app.readResponse(callback);
    },

    sendCommand: function(command){
        bluetoothSerial.write(command+'\r');
        app.sleep(150);
    },

    readResponse: function(callback){
        bluetoothSerial.read(function(response){
            if(response.substr(0, 7) == 'NO DATA') return false;
            return callback(response);
        });
    },

    getCarRPM: function(){
        app.carRequest('01 0C', function(response){
            if(response == false){
                app.connections.engine = false;
                app.carData.rpm = 0;
            }
            else{
                data = response.substr(12, 5).split(' ');
                app.carData.rpm = Math.round(((parseInt(data[0], 16)*256) + parseInt(data[1], 16) )/4);
                if(app.carData.rpm > 0){
                    app.connections.engine = true;
                }else{
                    app.connections.engine = false;
                    app.carData.rpm = 0;
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
          

    startTrackCar: function(){
        app.log('Engine Resting');
        app.watchs.carWatchID = setInterval(function(){
            app.getCarRPM();
            app.getCarSpeed();
            app.getCarRadiatorTemp();
            app.getCarEngineLoad();            
        },  app.carWatchDelay);
    },
        
startBluetooth: function(){
        setTimeout(function(){

            bluetoothSerial.isEnabled(function(){
                bluetoothSerial.connect(app.obdMac, function(){
                    alert("Bluetooth Connected");
                    app.state('bluetooth', true);
                    bluetoothSerial.subscribe('\n');                    
                },function(){
                    app.state('bluetooth', false);
                    alert("Unable to Connect to ODB Device");
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
        
        
startTrackGps: function(){
        app.watchs.gpsWatchID = navigator.geolocation.watchPosition(function(position){
            app.carData.latitude = position.coords.latitude;
            app.carData.longitude = position.coords.longitude;
        }, function(){
            app.log('No GPS sat');
        }, { timeout: app.trackGpsDelay, enableHighAccuracy: true });
    },        
        
startTrackHeading: function(){
       app.watchs.headingWatchID = navigator.compass.watchHeading(function(heading){
           app.carData.heading = Math.round(heading.magneticHeading);
           app.carData.heading = Math.round(heading.magneticHeading);
       }, function(){
           alert('Compass Not Started');
       }, {frequency: 500});
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

