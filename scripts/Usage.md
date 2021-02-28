***USAGE OF TALKER AND LISTENER***

**ARCHITECTURE**
  This node has duality usage. Can be use as a talker node as a listner node depending on wich script is used.
  This node is used for handling data from e for gstreamer pipeline.
  The listener listening the topic published from the talker.
  
**TALKER**
  The talker has 2 function:
- catch incoming data from a udp socket; 
- publish every incoming udp data in a rostopic
 
  
**LISTNER**
  The listener has 2 function:
- subscribe a topic;
- send every incoming data published in the topic over a udp socket f 
