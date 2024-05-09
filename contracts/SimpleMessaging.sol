// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19; 

contract SimpleMessaging {

    mapping(address => string) public messages;

    event MessageSent(address indexed sender, string message);

    function sendMessage(string memory _message) public {

        messages[msg.sender] = _message;

        emit MessageSent(msg.sender, _message);

    }

}