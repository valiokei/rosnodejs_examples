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
const socketVideoStream1 = dgram.createSocket('udp4');
const soocketVideoStream2 = dgram.createSocket('udp4');
const socketOdometry = dgram.createSocket('udp4');


/////////////// SETTINGS    ///////////////

const serverPort1 = 5000; // video stream 1 
const serverPort2 = 5001; // video stream 2
const serverPort3 = 5002; // odometry stream
const serverAddress = "127.0.0.1";

/////////////// SETTINGS    ///////////////



// Require rosnodejs itself
const rosnodejs = require('rosnodejs');
//rosnodejs.loadAllPackages();
// Requires the std_msgs message package
const std_msgs = rosnodejs.require('std_msgs').msg;
const pointMsg =  rosnodejs.require('geometry_msgs').msg;

function talker() {
  // Register node with ROS master
  rosnodejs.initNode('/talker_node',)
    .then((rosNode) => {
      // Create ROS publisher on the 'chatter' topic with String message
      let pub1 = rosNode.advertise('/stream1', std_msgs.UInt8MultiArray);
      let pub2 = rosNode.advertise('/stream2', std_msgs.UInt8MultiArray);
      let poseTopic = rosNode.advertise('/Position', pointMsg.PoseStamped);
      let velocityTopic = rosNode.advertise('/Velocity', pointMsg.Accel);
      let accellerationTopic = rosNode.advertise('/Accelleration', pointMsg.Accel);
      // there is a IMU message https://docs.ros.org/en/api/sensor_msgs/html/msg/Imu.html


      const msg1 = new std_msgs.UInt8MultiArray();
      const msg2 = new std_msgs.UInt8MultiArray();
      const poseMsg = new pointMsg.PoseStamped();
      const velMsg = new pointMsg.Accel();
      const accMsg = new pointMsg.Accel();

      console.log("rosnodejs has inistialized the /talker_node")

      socketVideoStream1.on('message', (socketmsg, rinfo) => {
        // console.log(`server got: ${socketmsg} from ${rinfo.address}:${rinfo.port}`);      
        msg1.data = socketmsg;
        pub1.publish(msg1);
        //console.log("inside stream 1")
        //rosnodejs.log.info('I said: [' + msg.data + ']');
      });

      soocketVideoStream2.on('message', (socketmsg, rinfo) => {
        // console.log(`server got: ${socketmsg} from ${rinfo.address}:${rinfo.port}`);      
        msg2.data = socketmsg;
        pub2.publish(msg2);
        //rosnodejs.log.info('I said: [' + msg.data + ']');
      });

      socketOdometry.on('message', (socketmsg, rinfo) => {
        // console.log(`server got: ${socketmsg} from ${rinfo.address}:${rinfo.port}`);
        console.log(JSON.parse(socketmsg.toString('utf8')))
        const parsedMsg = JSON.parse(socketmsg.toString('utf8'))
        poseMsg.pose.position = parsedMsg.Position
        velMsg.linear = parsedMsg.Velocity // check if it is linear or angular
        accMsg.linear = parsedMsg.Acceleration
        poseTopic.publish(poseMsg)
        velocityTopic.publish(velMsg)
        accellerationTopic.publish(accMsg)
       /*  msg2.data = socketmsg;
        pub2.publish(msg2); */
        //rosnodejs.log.info('I said: [' + msg.data + ']');
      });

    });
}

if (require.main === module) {

  // ODOMETRY SOCKET
  socketOdometry.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    socketOdometry.close();
  });

  socketOdometry.on('listening', () => {
    const address = socketOdometry.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  socketOdometry.bind({
    address: serverAddress,
    port: serverPort3
  });

  // VIDEO STREAM 1 SOCKET
  socketVideoStream1.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    socketVideoStream1.close();
  });



  socketVideoStream1.on('listening', () => {
    const address = socketVideoStream1.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  socketVideoStream1.bind({
    address: serverAddress,
    port: serverPort1
  });

  soocketVideoStream2.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    socketVideoStream1.close();
  });

  // VIDEO STREAM 2 SOCKET
  soocketVideoStream2.on('listening', () => {
    const address = soocketVideoStream2.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

  soocketVideoStream2.bind({
    address: serverAddress,
    port: serverPort2
  });

  // Invoke Main Talker Function
  talker();
}
