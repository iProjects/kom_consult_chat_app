// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19; 
 
contract Database {
    
    constructor() public
    {

    }   


    // Stores the default name of an user and her friends info
    struct user {
        string name;
        friend[] friendList;
    }

    // Each friend is identified by its address and name assigned by the second party
    struct friend {
        address pubkey;
        string name;
    }

    // message construct stores the single chat message and its metadata
    struct message {
        address sender;
        uint256 timestamp;
        string msg;
    }

    // Collection of users registered on the application
    mapping(address => user) userList;
    // Collection of messages communicated in a channel between two users
    mapping(bytes32 => message[]) allMessages; // key : Hash(user1,user2)





    // Stores the default name of an user
    struct user_struct {
        uint32 id;
        address user_address;
        string user_name;        
        uint256 timestamp;
    }
    
    // message construct stores the single chat message and its metadata
    struct message_struct {
        uint32 id;
        address sender_address;
        string sender_name;
        string message_data;
        uint256 timestamp;
    }

    //autoincrement id for each new user
    uint32 last_user_id = 0;

    //autoincrement id for each new message
    uint32 last_message_id = 0;

    //total users count
    uint32 public total_users_count = 0;

    //total messages count
    uint32 public total_messages_count = 0;

    // Collection of users registered on the application 
    mapping(address => user_struct) user_List;
    mapping(uint32 => address) user_addresses_list;

    // Collection of messages communicated in the group
    mapping(uint32 => message_struct) messageList;

    // Collection of messsages on the application
    message_struct[] public msg_arr;

    // Collection of users on the application
    user_struct[] public users_arr;

    uint32[] public messages_ids;

    uint32[] public users_ids;


    //create user event
    event user_created_event(string msg, address sender, uint256 timestamp, string user_name);

    //create message event
    event message_created_event(string msg, address sender, uint256 timestamp, string message_data);

    //error message event
    event error_message_event(string msg, address sender, uint256 timestamp);

    // It checks whether a user(identified by its public key)
    // has created an account on this application or not
    function check_user_exists_given_account(address pubkey) public view returns(bool) {
        return bytes(user_List[pubkey].user_name).length > 0;
    }
    
    // Registers the caller(msg.sender) to our app with a non-empty username
    function create_new_account(string calldata user_name) external {
        
        emit  user_created_event("validating..", msg.sender, block.timestamp, user_name); 

        require(check_user_exists_given_account(msg.sender) == false, "User already exists!");
        require(bytes(user_name).length > 0, "Username cannot be empty!"); 

        //user_struct memory new_user = user_struct(last_user_id, msg.sender, block.timestamp);

        last_user_id++;

        emit  user_created_event("new account index created.", msg.sender, block.timestamp, user_name); 

        user_List[msg.sender].id = last_user_id;
        user_List[msg.sender].user_address = msg.sender;
        user_List[msg.sender].user_name = user_name;
        user_List[msg.sender].timestamp = block.timestamp;
        
        user_addresses_list[last_user_id] = msg.sender;

        total_users_count++;

        emit  user_created_event("new account created..", msg.sender, block.timestamp, user_name); 
    }
    
    // Returns the default name provided by a user
    function get_user_name_given_account(address pubkey) public view returns(string memory) {       
        return user_List[pubkey].user_name;
    }
    
    // Returns the count of users
    function get_Users_count() external view returns(uint32) { 
        return total_users_count;
    }
     
    // create a new message
    function create_new_message(string calldata message_data) external {
    
            emit  message_created_event("validating data...", msg.sender, block.timestamp, message_data);

            require(check_user_exists_given_account(msg.sender), "Create an account first!");
            require(bytes(message_data).length > 0, "Message cannot be empty.");

            emit  message_created_event("creating new message...", msg.sender, block.timestamp, message_data);

            string memory sender_name = get_user_name_given_account(msg.sender);
    
            last_message_id++;
 
            emit  message_created_event("new message index created.", msg.sender, block.timestamp, message_data);

            messageList[last_message_id].id = last_message_id;
            messageList[last_message_id].sender_address = msg.sender;
            messageList[last_message_id].sender_name = sender_name;
            messageList[last_message_id].message_data = message_data;
            messageList[last_message_id].timestamp = block.timestamp;
            
            total_messages_count++;
 
            emit  message_created_event("new message created.", msg.sender, block.timestamp, message_data);
 
    }

    function get_block_number() external view returns(uint256 block_number){
        return block.number;
    }

    function get_chainid() external view returns(uint256 chainid){
        return block.chainid;
    }

    // Returns a message given id
    function get_message_given_id(uint32 id) external view returns(
        uint32,
        address,
        string memory,
        string memory,
        uint256) {
    
        require(check_user_exists_given_account(msg.sender), "Create an account first!"); 

        message_struct memory _message = messageList[id];
 
        return (_message.id, _message.sender_address, _message.sender_name, _message.message_data, _message.timestamp);
    }

    //Returns list of users
    function get_users_List() external view returns(
        uint32[] memory, 
        address[] memory, 
        string[] memory, 
        uint256[] memory) {
        
        require(check_user_exists_given_account(msg.sender), "Create an account first!"); 

        uint32 total_records_count = total_users_count;

        uint32[] memory ids = new uint32[](total_records_count);
        address[] memory user_addresses = new address[](total_records_count);
        string[] memory user_names = new string[](total_records_count); 
        uint256[] memory timestamps = new uint256[](total_records_count);
        
        for(uint32 i = 0; i < total_records_count; i++)
        {
            user_struct storage _user = user_List[user_addresses_list[i]];

            ids[i] = _user.id;
            // ids[i] = i;
            user_addresses[i] = _user.user_address;
            user_names[i] = _user.user_name;
            timestamps[i] = _user.timestamp;
        }
        return (ids, user_addresses, user_names, timestamps);
    }
    
    //Returns list of messages
    function get_messages_List() external view returns(
        uint32[] memory, 
        address[] memory, 
        string[] memory, 
        string[] memory, 
        uint256[] memory) {
        
        require(check_user_exists_given_account(msg.sender), "Create an account first!"); 

        uint32 total_records_count = total_messages_count;

        uint32[] memory ids = new uint32[](total_records_count);
        address[] memory sender_addresses = new address[](total_records_count);
        string[] memory sender_names = new string[](total_records_count);
        string[] memory messages = new string[](total_records_count);
        uint256[] memory timestamps = new uint256[](total_records_count);
        
        for(uint32 i = 0; i < total_records_count; i++)
        {
            message_struct storage _message = messageList[i];

            ids[i] = _message.id;
            // ids[i] = i;
            sender_addresses[i] = _message.sender_address;
            sender_names[i] = _message.sender_name;
            messages[i] = _message.message_data;
            timestamps[i] = _message.timestamp;
        }
        return (ids, sender_addresses, sender_names, messages, timestamps);
    }
    
     //create a blank transaction
        function create_blank_message() public {
    
            last_message_id++;
 
            messageList[last_message_id].id = last_message_id;
            messageList[last_message_id].sender_address = msg.sender;
            messageList[last_message_id].sender_name = "";
            messageList[last_message_id].message_data = "";
            messageList[last_message_id].timestamp = block.timestamp;
            
            total_messages_count++;
 
    }











    // It checks whether a user(identified by its public key)
    // has created an account on this application or not
    function checkUserExists(address pubkey) public view returns(bool) {
        return bytes(userList[pubkey].name).length > 0;
    }
    
    // Registers the caller(msg.sender) to our app with a non-empty username
    function createAccount(string calldata name) external {
        require(checkUserExists(msg.sender)==false, "User already exists!");
        require(bytes(name).length>0, "Username cannot be empty!"); 
        userList[msg.sender].name = name;
    }
    
    // Returns the default name provided by an user
    function getUsername(address pubkey) external view returns(string memory) {
        require(checkUserExists(pubkey), "User is not registered!");
        return userList[pubkey].name;
    }
    
    // Adds new user as your friend with an associated nickname
    function addFriend(address friend_key, string calldata name) external {
        require(checkUserExists(msg.sender), "Create an account first!");
        require(checkUserExists(friend_key), "User is not registered!");
        require(msg.sender!=friend_key, "Users cannot add themselves as friends!");
        require(checkAlreadyFriends(msg.sender,friend_key)==false, "These users are already friends!");
        
        _addFriend(msg.sender, friend_key, name);
        _addFriend(friend_key, msg.sender, userList[msg.sender].name);
    }
    
    // Checks if two users are already friends or not
    function checkAlreadyFriends(address pubkey1, address pubkey2) internal view returns(bool) {
        
        if(userList[pubkey1].friendList.length > userList[pubkey2].friendList.length)
        {
            address tmp = pubkey1;
            pubkey1 = pubkey2;
            pubkey2 = tmp;
        }
    
        for(uint i=0; i<userList[pubkey1].friendList.length; ++i)
        {
            if(userList[pubkey1].friendList[i].pubkey == pubkey2)
                return true;
        }
        return false;
    }
    
    // A helper function to update the friendList
    function _addFriend(address me, address friend_key, string memory name) internal {
        friend memory newFriend = friend(friend_key,name);
        userList[me].friendList.push(newFriend);
    }
    
    // Returns list of friends of the sender
    function getMyFriendList() external view returns(friend[] memory) {
        return userList[msg.sender].friendList;
    }
    
    // Returns a unique code for the channel created between the two users
    // Hash(key1,key2) where key1 is lexicographically smaller than key2
    function _getChatCode(address pubkey1, address pubkey2) internal pure returns(bytes32) {
        if(pubkey1 < pubkey2)
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        else
            return keccak256(abi.encodePacked(pubkey2, pubkey1));
    }
    
    // Sends a new message to a given friend
    function sendMessage(address friend_key, string calldata _msg) external {
        require(checkUserExists(msg.sender), "Create an account first!");
        require(checkUserExists(friend_key), "User is not registered!");
        require(checkAlreadyFriends(msg.sender,friend_key), "You are not friends with the given user");
        
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message memory newMsg = message(msg.sender, block.timestamp, _msg);
        allMessages[chatCode].push(newMsg);
    }
    
    // Returns all the chat messages communicated in a channel
    function readMessage(address friend_key) external view returns(message[] memory) {
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        return allMessages[chatCode];
    }
}