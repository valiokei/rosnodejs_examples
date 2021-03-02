#!/usr/bin/env node

/************************************************************************
 Copyright (c) 2017, Rethink Robotics
 Copyright (c) 2017, Ian McMahon

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
************************************************************************/

'use strict';
/**
 * This example demonstrates simple sending of messages over the ROS system.
 */

const dgram = require('dgram');
const server1 = dgram.createSocket('udp4');
const server2 = dgram.createSocket('udp4');


/////////////// SETTINGS    ///////////////

const serverPort1 = 5000;
const serverPort2 = 5001;
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
      let pub1 = rosNode.advertise('/stream1', std_msgs.UInt8MultiArray);
      let pub2 = rosNode.advertise('/stream2', std_msgs.UInt8MultiArray);
      const msg1 = new std_msgs.UInt8MultiArray();
      const msg2 = new std_msgs.UInt8MultiArray();

      console.log("rosnodejs has inistialized the /talker_node")

      server1.on('message', (socketmsg, rinfo) => {
        // console.log(`server got: ${socketmsg} from ${rinfo.address}:${rinfo.port}`);      
        msg1.data = socketmsg;
        pub1.publish(msg1);
        //rosnodejs.log.info('I said: [' + msg.data + ']');
      });

      server2.on('message', (socketmsg, rinfo) => {
        // console.log(`server got: ${socketmsg} from ${rinfo.address}:${rinfo.port}`);      
        msg2.data = socketmsg;
        pub2.publish(msg2);
        //rosnodejs.log.info('I said: [' + msg.data + ']');
      });
    });
}

if (require.main === module) {

  server1.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server1.close();
  });



  server1.on('listening', () => {
    const address = server1.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  server1.bind({
    address: serverAddress,
    port: serverPort1
  });

  server2.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server1.close();
  });



  server2.on('listening', () => {
    const address = server2.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  server2.bind({
    address: serverAddress,
    port: serverPort2
  });

  // Invoke Main Talker Function
  talker();
}
