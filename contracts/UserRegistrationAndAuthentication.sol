// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19; 

contract UserRegistrationAndAuthentication {
    // Struct to store user information
    struct User {
        string name;         // User's name
        string email;        // User's email address
        bytes32 passwordHash; // Hashed password
        bool isRegistered;   // Flag to indicate if the user is registered
    }

    // Mapping to link each user's Ethereum address with their user information
    mapping(address => User) public users;

    // Event to emit when a new user is registered
    event UserRegistered(address indexed userAddress, string name, string email);

    // Function to register a new user
    function registerUser(string memory _name, string memory _email, bytes32 _passwordHash) public {
        require(!users[msg.sender].isRegistered, "User already registered");

        User memory newUser = User({
            name: _name,
            email: _email,
            passwordHash: _passwordHash,
            isRegistered: true
        });

        users[msg.sender] = newUser;

        emit UserRegistered(msg.sender, _name, _email);
    }

    // Function to retrieve user information for the caller
    function getMyUserInfo() public view returns (string memory, string memory) {
        require(users[msg.sender].isRegistered, "User not registered");

        return (users[msg.sender].name, users[msg.sender].email);
    }

    // Function to authenticate user based on password hash
    function authenticate(bytes32 _passwordHash) public view returns (bool) {
        require(users[msg.sender].isRegistered, "User not registered");

        return users[msg.sender].passwordHash == _passwordHash;
    }
}