// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19; 

contract Chat {

    struct Message {
        uint id;
        address from;
        string text;
    }

    
 // the list of old messages in the chat
  mapping(uint => Message) public messagesList;

    // tells the frontend that a new message has been sent.
    event sendMessageEvent(uint indexed _id, address indexed _from, string _message);

// We can use an autoincremental id for each new message.
  uint lastMessageId;
  
  // function listMessages() public constant returns (uint[]){
    
  //   // if the chat is empty
  //   if(lastMessageId == 0) {
  //     return new uint[](0);
  //   }
    
  //   // give me the ids.
  //   uint[] memory ids = new uint[](lastMessageId);
    
  //   // loads all the message ids on 'ids' list.
  //   for (uint i = 1; i <= lastMessageId; i++) {
      
  //     // if the sender is different than me.
  //     if(messages[i].sender != msg.sender) {
  //       ids[numOfMessages] = messagesList[i].id;
  //     }
  //   }
  //   return ids;
  // }
  
  // function listMessages() public constant returns (uint[]){
    
  //   // if the chat is empty
  //   if(lastMessageId == 0) {
  //     return new uint[](0);
  //   }
    
  //   // give me the ids.
  //   uint[] memory ids = new uint[](lastMessageId);
    
  //   // loads all the message ids on 'ids' list.
  //   for (uint i = 1; i <= lastMessageId; i++) {
      
  //     // if the sender is different than me.
  //     if(messages[i].sender != msg.sender) {
  //       ids[numOfMessages] = messagesList[i].id;
  //     }
  //   }
  //   return ids;
  // }





}