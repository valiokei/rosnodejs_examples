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
const { Console } = require('console');
/**
 * This example demonstrates simple receiving of messages over the ROS system.
 */





const dgram = require('dgram');
const client1 = dgram.createSocket('udp4');
const client2 = dgram.createSocket('udp4');


/////////////// SETTINGS    ///////////////

const serverPort1 = 5000;
const serverPort2 = 5001;
const serverAddress = "127.0.0.1";

/////////////// SETTINGS    ///////////////

// Require rosnodejs itself
const rosnodejs = require('rosnodejs');
// Requires the std_msgs message package
const std_msgs = rosnodejs.require('std_msgs').msg;
const pointMsg =  rosnodejs.require('geometry_msgs').msg;
const fs = require('fs');

let a = 0
let b = 0

function listener() {
  // Register node with ROS master
  rosnodejs.initNode('/listener_node')
    .then((rosNode) => {
      // Create ROS subscriber on the 'chatter' topic expecting String messages
      let sub1 = rosNode.subscribe('/stream1', std_msgs.UInt8MultiArray,
        (data) => { // define callback execution
          // rosnodejs.log.info('I heard: [' + data.data + ']');

          
          client1.send(data.data, serverPort1, serverAddress);
          a+=1;
          console.log("data received " + a)
        }
      );
      let sub2 = rosNode.subscribe('/stream2', std_msgs.UInt8MultiArray,
      (data) => { // define callback execution
        // rosnodejs.log.info('I heard: [' + data.data + ']');
        
        client2.send(data.data, serverPort2, serverAddress);
        b+=1;
        console.log("data received " + b)
      }
    );
    let Position = rosNode.subscribe('/Position', pointMsg.PoseStamped,
      (data) => { // define callback execution
        // rosnodejs.log.info('I heard: [' + data.data + ']');
        

        console.log("Position data received " + JSON.stringify(data.pose.position,null,4))
      }
    );
    let Velocity = rosNode.subscribe('/Velocity', pointMsg.Accel,
      (data) => { // define callback execution
        // rosnodejs.log.info('I heard: [' + data.data + ']');
        console.log("Velocity data received " + JSON.stringify(data.linear,null,4))
      }
    );
    let Accelleration = rosNode.subscribe('/Accelleration', pointMsg.Accel,
      (data) => { // define callback execution
        // rosnodejs.log.info('I heard: [' + data.data + ']');

        console.log("Accelleration data received " + JSON.stringify(data.linear,null,4))
      }
    );
    });
}

if (require.main === module) {

  client1.on('close', function () {
    console.log('Client UDP socket closed : BYE!')
  });

  client2.on('close', function () {
    console.log('Client UDP socket closed : BYE!')
  });

  // Invoke Main Listener Function
  listener();
}
