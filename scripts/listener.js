#!/usr/bin/env node

'use strict';
const { Console } = require('console');

// opening the udp stream to sending data for gstreamer pipeline consumption
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
/////////////// SETTINGS    ///////////////

const serverPort = 5000;
const serverAddress = "127.0.0.1";

/////////////// SETTINGS    ///////////////

// Require rosnodejs itself
const rosnodejs = require('rosnodejs');
// Requires the std_msgs message package
const std_msgs = rosnodejs.require('std_msgs').msg;


function listener() {
  // Register node with ROS master
  rosnodejs.initNode('/listener_node')
    .then((rosNode) => {
      // Create ROS subscriber on the 'chatter' topic expecting String messages
      let sub = rosNode.subscribe('/chatter', std_msgs.UInt8MultiArray,
        (data) => { 
          // rosnodejs.log.info('I heard: [' + data.data + ']');
          // console.log(data.data)
          client.send(data.data, serverPort, serverAddress);
        }
      );
    });
}

if (require.main === module) {

  client.on('close', function () {
    console.log('Client UDP socket closed : BYE!')
  });

  // Invoke Main Listener Function
  listener();
}
