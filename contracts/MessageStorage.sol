// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19; 

contract MessageStorage {
    // Struct to represent the structure of a message
    struct Message {
        address sender;     // Ethereum address of the sender
        address recipient;  // Ethereum address of the recipient
        string content;     // Content of the message
        uint256 timestamp;  // Timestamp when the message was sent
        bool isRead;        // Flag to indicate if the message has been read
    }

    // Mapping to associate each user's Ethereum address with an array of messages
    mapping(address => Message[]) public userMessages;

    // Event to emit when a new message is sent
    event MessageSent(address indexed sender, address indexed recipient, string content);

    // Function to send a new message
    function sendMessage(address _recipient, string memory _content) public {
        Message memory newMessage = Message({
            sender: msg.sender,
            recipient: _recipient,
            content: _content,
            timestamp: block.timestamp,
            isRead: false
        });

        userMessages[msg.sender].push(newMessage);

        emit MessageSent(msg.sender, _recipient, _content);
    }

    // Function to retrieve all messages for the caller
    function getMyMessages() public view returns (Message[] memory) {
        return userMessages[msg.sender];
    }

    // Function to update the status of a message to "read"
    function markAsRead(uint256 _messageIndex) public {
        require(_messageIndex < userMessages[msg.sender].length, "Invalid message index");

        userMessages[msg.sender][_messageIndex].isRead = true;
    }
}