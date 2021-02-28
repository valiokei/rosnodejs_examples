#!/usr/bin/env node


'use strict';

// open connection to the udp socket for getting incoming data
const dgram = require('dgram');
const server = dgram.createSocket('udp4');


/////////////// SETTINGS    ///////////////

const serverPort = 5000;
const serverAddress = "127.0.0.1";

/////////////// SETTINGS    ///////////////


// Require rosnodejs itself
const rosnodejs = require('rosnodejs');
// Requires the std_msgs message package
const std_msgs = rosnodejs.require('std_msgs').msg;

function talker() {
  // Register node with ROS master
  rosnodejs.initNode('/talker_node')
    .then((rosNode) => {
      // Create ROS publisher on the 'chatter' topic with String message
      let pub = rosNode.advertise('/chatter', std_msgs.UInt8MultiArray);
      const msg = new std_msgs.UInt8MultiArray();

      console.log("rosnodejs has initialized the /talker_node")

      server.on('message', (socketmsg, rinfo) => {
        // console.log(`server got: ${socketmsg} from ${rinfo.address}:${rinfo.port}`);      
        msg.data = socketmsg;
        pub.publish(msg);
        //rosnodejs.log.info('I said: [' + msg.data + ']');
      });
    });
}

if (require.main === module) {

  server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });



  server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  server.bind({
    address: serverAddress,
    port: serverPort
  });


  // Invoke Main Talker Function
  talker();
}
