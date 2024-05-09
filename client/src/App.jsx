import React from "react";
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { NavBar, ChatCard, Message, UserCard, AddNewChat } from './components/Components.js';
import { ethers } from "ethers";
// import { abi } from "./Database.json"; 

let abi = require('./abi.js');
let messages_list = [];
 
// Add the contract address inside the quotes 
const CONTRACT_ADDRESS = "0xF07F956456129ff413D5833130336c2Ab9027e9B"; 

export function App( props ) {  
    
    const [friends, setFriends] = useState(null);
    const [users, setUsers] = useState(null);
    const [myName, setMyName] = useState(null);
    const [myPublicKey, setMyPublicKey] = useState(null);
    const [activeChat, setActiveChat] = useState({ friendname: null, publicKey: null });
    const [activeChatMessages, setActiveChatMessages] = useState(null);
    const [showConnectButton, setShowConnectButton] = useState("block");
    const [myContract, setMyContract] = useState(null);
    const [myAccount, setMyAccount] = useState("");
    const [has_wallet_permissions, setHasWalletPermissions] = useState(false);
    const [reload_data_from_blockchain, setReloadData] = useState(false);
    const [showLogoutButton, setShowLogoutButton] = useState("none");
    const [is_app_connected, set_App_Connection] = useState(false);
  
    // Save the contents of abi in a variable
    const contractABI = abi[0].abi; 
    let provider;
    let signer;

    // Login to MetaMask and check if the user exists else creates one
    async function login() {
        
        try {
            //check if browser supports metamask
            let res = await connectToMetamask();
            if( res === true ) {
                //get the provider
                provider = new ethers.providers.Web3Provider( window.ethereum );
                provider.on("disconnect", disconnect_user); 
                window.ethereum.on("accountsChanged", async()=>{localStorage.removeItem("account")})
                //force metamask to allow user to choose account
                const permissions = await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [
                        {
                            eth_accounts: {},
                        },
                    ],
                });
                setHasWalletPermissions(permissions);
                console.log("has_wallet_permissions", has_wallet_permissions);
                //set the signer used when creating the contract
                signer = provider.getSigner();
                //get the metamask accounts
                let accounts = await provider.send("eth_requestAccounts", []);
                console.log(accounts.length);
                //if there is atleast one account the user has selected the first one
                if(accounts.length){
                    console.log("You are connected to account : ", accounts[0]);
                    setMyAccount(accounts[0]);
                    localStorage.setItem("account", myAccount);
                } else {
                    console.log("Metamask is not connected.");
                }                
                console.log("CONTRACT_ADDRESS ", CONTRACT_ADDRESS);
                console.log("contractABI ", contractABI);
                console.log("signer ", signer);
                //construct the contract given an address, application binary interface and the signer
                const contract = new ethers.Contract( CONTRACT_ADDRESS, contractABI, signer );

                if(contract === null) return;

                console.log("contract created successfully. ", contract); 
                console.log("contract ", contract);

                setMyContract( contract );

                const address = await signer.getAddress();   
                
                console.log("address ", address);

                const bal = await provider.getBalance(address) //balance in wei
                const balance = ethers.utils.formatEther(bal) // wei balance convert to eth balance

                console.log("balance ", balance);

                const gasPrice = await provider.getGasPrice();

                console.log("gasPrice ", gasPrice);

                const functionGasFees =  await contract.estimateGas["checkUserExists"](address);

                const gas_fee = ethers.utils.formatUnits(functionGasFees, "gwei");

                console.log("gas_fee ", gas_fee);
                
                const chain_id = await provider.getNetwork();

                console.log("chain_id ", chain_id);
                //check if user is registered
                let present = await contract.check_user_exists_given_account(address);

                console.log("present ", present);

                let username;
                if( present )
                    //if user is registered get the user name and login in
                    username = await contract.get_user_name_given_account( address );
                else {
                    //else prompt for a user name and create a new account.
                    username = prompt('Enter a username', 'Guest'); 
                    if( username === '' ) username = 'Guest';

                    console.log("calling contract...");
                    //create a new account.
                    await contract.create_new_account(username);

                    console.log("account created in block chain.");

                    //listen for create account event
                    await contract.on("user_created_event", (message, user_address, timestamp, username) => {
                        console.log("create account event raised.");
                        console.log(message, user_address, timestamp, username);
                    });

                    const bal = await provider.getBalance(address) //balance in wei
                    const balance = ethers.utils.formatEther(bal) // wei balance convert to eth balance

                    console.log("balance ", balance);

                }
                //set the global variables upon login.
                setMyName( username );
                setMyPublicKey( address );
                setShowConnectButton( "none" );
                setShowLogoutButton("block");
                set_App_Connection(true);
                setReloadData(true);

                get_all_messages();
                get_all_users();

        } else {
            alert("Couldn't connect to MetaMask. kindly ensure you have installed metamask <br />. or visit https://metamask.io/download/");
        }    
        
        } catch(err) {
            //alert("CONTRACT_ADDRESS not set properly!");
            console.log(err);
        }
    }

    // Check if the MetaMask connects 
    async function connectToMetamask() {
        try {
            await window.ethereum.enable();
            return true;
        } catch(err) {
            console.log(err);
            return false;
        }
    }

    function disconnect_user() {
        
    }

    // logout from MetaMask
    async function logout() {
        try {
            console.log("logging out the user.");

            const permissions = await window.ethereum.request({
                method: "wallet_revokePermissions",
                params: [
                    {
                        eth_accounts: {},
                    },
                ],
            });
            window.location.reload();
        } catch(err) {
            console.log(err);
        }
    }

    // Sends message to users
    async function sendMessage(message) { 
        try{        
            //check if user is logged in
            if(!is_app_connected) return;
            //validate the message is not blank
            if(message.length < 1) 
            {

            }else{

                console.log("calling contract...");
                //save the message in blockchain
                await myContract.create_new_message(message);

                console.log("message created in block chain.");

                //listen for new message created event
                await myContract.on("message_created_event",  (message, user_address, timestamp, message_sent) => {
                    console.log("create message event raised.");
                    console.log(message, user_address, timestamp, message_sent);
                });
                
                //reload the newly created record to all users.
                setReloadData(true);
            }
        }catch(error)
        {
            console.log(error);
        }
    } 

    async function get_all_messages() {

        if(!is_app_connected) return;

        console.log("calling contract...");

        // Get messages
        const data = await myContract.get_messages_List();
        
        console.log("loading data...");

        setActiveChatMessages([]);

        messages_list = [];

        let counter = 0;
        let ids_arr; 
        let sender_addresses_arr;
        let sender_names_arr;
        let messages_arr;
        let time_stamps_arr;

        data.forEach((item) => {

            console.log(item);
            
            if(counter === 0){
                ids_arr = item; 
            }            
            if(counter === 1){
                sender_addresses_arr = item;
            }            
            if(counter === 2){
                sender_names_arr = item;
            }            
            if(counter === 3){
                messages_arr = item;
            }            
            if(counter === 4){
                time_stamps_arr = item;                
            }
                     
            counter++;

        });

        console.log(ids_arr);        
        console.log(sender_addresses_arr);        
        console.log(sender_names_arr);        
        console.log(messages_arr);        
        console.log(time_stamps_arr);
        
        const arr_length = ids_arr.length;

        console.log("total records = ", arr_length);

        for (let i = 0; i < arr_length; i++)
        {
            // const id = ids_arr[1]; 
            const id = i; 
            const sender_address = sender_addresses_arr[i];
            const sender_name = sender_names_arr[i];
            const msg = messages_arr[i];
            const time_stamp = time_stamps_arr[i];

            if(sender_name.length < 1) continue;

            const local_date = new Date( 1000 * time_stamp.toNumber()).toLocaleDateString();
            const local_time = new Date( 1000 * time_stamp.toNumber()).toLocaleTimeString();

            const timestamp =  local_date + " " + local_time; 

            messages_list.push({ "id": id, "sender_address": sender_address, "sender_name": sender_name, "msg": msg, "timestamp": timestamp });

            console.log("messages_list ", messages_list);
        }

        console.log("finished loading data.");

        setActiveChatMessages(messages_list);

    }

    
    // This executes every time page renders and when myPublicKey or myContract changes
    useEffect( () => {
        async function fetch_messages_from_block_chain() {

            if(!is_app_connected) return;

            let msg_List = [];

            // Get messages
            try {
                        
                console.log("calling contract...");

                // Get messages
                const data = await myContract.get_messages_List();
  
                console.log("loading data...");

                setActiveChatMessages([]);

                msg_List = [];
        
                let counter = 0;
                let ids_arr; 
                let sender_addresses_arr;
                let sender_names_arr;
                let messages_arr;
                let time_stamps_arr;
        
                data.forEach((item) => {

                    console.log(item);
                    
                    if(counter === 0){
                        ids_arr = item; 
                    }            
                    if(counter === 1){
                        sender_addresses_arr = item;
                    }            
                    if(counter === 2){
                        sender_names_arr = item;
                    }            
                    if(counter === 3){
                        messages_arr = item;
                    }            
                    if(counter === 4){
                        time_stamps_arr = item;                
                    }
                             
                    counter++;
        
                });
 
                console.log(ids_arr);        
                console.log(sender_addresses_arr);        
                console.log(sender_names_arr);        
                console.log(messages_arr);        
                console.log(time_stamps_arr);
                
                const arr_length = ids_arr.length;

                console.log("total records = ", arr_length);
        
                for (let i = 0; i < arr_length; i++)
                {
                    // const id = ids_arr[1]; 
                    const id = i; 
                    const sender_address = sender_addresses_arr[i];
                    const sender_name = sender_names_arr[i];
                    const msg = messages_arr[i];
                    const time_stamp = time_stamps_arr[i];
        
                    if(sender_name.length < 1) continue;

                    const local_date = new Date( 1000 * time_stamp.toNumber()).toLocaleDateString();
                    const local_time = new Date( 1000 * time_stamp.toNumber()).toLocaleTimeString();
        
                    const timestamp =  local_date + " " + local_time; 
        
                    msg_List.push({ "id": id, "sender_address": sender_address, "sender_name": sender_name, "msg": msg, "timestamp": timestamp });

                    console.log("messages_list ", msg_List);
                }
        
                console.log("finished loading data.");
         
            } catch(error) {                
                console.log(error);
                msg_List = null;  
            }

            setActiveChatMessages(msg_List);
        }

        fetch_messages_from_block_chain();

    }, [myPublicKey, myContract, reload_data_from_blockchain]);
    
    // Makes Cards for each Message
    const Messages = activeChatMessages ? activeChatMessages.map( (message) => {
        let margin = "5%";
        let sender_name = message.sender_name;

        if( message.sender_address === myPublicKey ) {
            margin = "15%";
            sender_name = "You";
        }

        return (
            <Message key={ message.id } marginLeft={ margin } sender_name={ sender_name } msg={ message.msg } timestamp={ message.timestamp } />
        );

    }) : null;
    
    //fetch records every second
    useEffect(() => {
        let timer = setInterval(() => {
            if(!is_app_connected) return;
            console.log("executing fetch in an interval.");
            get_all_messages();
        
        }, 60000000); 
    });


    // This executes every time page renders and when myPublicKey or myContract changes
    useEffect( () => {
        async function load_users() {
            
            if(!is_app_connected) return;

            let users_list = [];

            // Get users
            try {
                    
                console.log("calling contract...");

                const data = await myContract.get_users_List();

                console.log("loading data...");

                setUsers([]);
        
                users_list = [];
                
                let counter = 0;
                let ids_arr; 
                let user_addresses_arr;
                let user_names_arr; 
                let time_stamps_arr;
        
                data.forEach((item) => {

                    console.log(item);
                    
                    if(counter === 0){
                        ids_arr = item; 
                    }            
                    if(counter === 1){
                        user_addresses_arr = item;
                    }            
                    if(counter === 2){
                        user_names_arr = item;
                    }            
                    if(counter === 3){
                        time_stamps_arr = item;                
                    }
                             
                    counter++;
        
                });
  
                console.log(ids_arr);        
                console.log(user_addresses_arr);        
                console.log(user_names_arr);         
                console.log(time_stamps_arr);
                
                const arr_length = ids_arr.length;

                console.log("total records = ", arr_length);
        
                for (let i = 0; i < arr_length; i++)
                {
                    // const id = ids_arr[1]; 
                    const id = i; 
                    const user_address = user_addresses_arr[i];
                    const user_name = user_names_arr[i]; 
                    const time_stamp = time_stamps_arr[i];
                    
                    if(user_name.length < 1) continue;

                    const local_date = new Date( 1000 * time_stamp.toNumber()).toLocaleDateString();
                    const local_time = new Date( 1000 * time_stamp.toNumber()).toLocaleTimeString();
        
                    const timestamp =  local_date + " " + local_time; 
        
                    users_list.push({ "id": id, "user_address": user_address, "user_name": user_name, "timestamp": timestamp });

                    console.log("users_list ", users_list);
                }
        
                console.log("finished loading data.");
          
            } catch(error) {
                console.log(error);
                users_list = null;  
            }

            setUsers( users_list );
        }

        load_users();

    }, [myPublicKey, myContract, reload_data_from_blockchain]);

 
    async function get_all_users() {
            
            if(!is_app_connected) return;

            let users_list = [];

            // Get users
            try {
                    
                console.log("calling contract...");

                const data = await myContract.get_users_List();

                console.log("loading data...");

                setUsers([]);
        
                users_list = [];
                
                let counter = 0;
                let ids_arr; 
                let user_addresses_arr;
                let user_names_arr; 
                let time_stamps_arr;
        
                data.forEach((item) => {

                    console.log(item);
                    
                    if(counter === 0){
                        ids_arr = item; 
                    }            
                    if(counter === 1){
                        user_addresses_arr = item;
                    }            
                    if(counter === 2){
                        user_names_arr = item;
                    }            
                    if(counter === 3){
                        time_stamps_arr = item;                
                    }
                             
                    counter++;
        
                });
  
                console.log(ids_arr);        
                console.log(user_addresses_arr);        
                console.log(user_names_arr);         
                console.log(time_stamps_arr);
                
                const arr_length = ids_arr.length;

                console.log("total records = ", arr_length);
        
                for (let i = 0; i < arr_length; i++)
                {
                    // const id = ids_arr[1]; 
                    const id = i; 
                    const user_address = user_addresses_arr[i];
                    const user_name = user_names_arr[i]; 
                    const time_stamp = time_stamps_arr[i];
        
                    if(user_name.length < 1) continue;

                    const local_date = new Date( 1000 * time_stamp.toNumber()).toLocaleDateString();
                    const local_time = new Date( 1000 * time_stamp.toNumber()).toLocaleTimeString();
        
                    const timestamp =  local_date + " " + local_time; 
        
                    users_list.push({ "id": id, "user_address": user_address, "user_name": user_name, "timestamp": timestamp });

                    console.log("users_list ", users_list);
                }
        
                console.log("finished loading data.");
          
            } catch(error) {
                console.log(error);
                users_list = null;  
            }

            setUsers( users_list );
        }
 

    // Displays each card
    const users_list = users ? users.map( ( user ) => {
        return (
            <UserCard key={ user.id } user_address={ user.user_address } user_name={ user.user_name }  />
        );
       }) : null;

       












    function requestPermissions() {
        window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
        })
        .then((permissions) => {
            const accountsPermission = permissions.find(
                (permission) => permission.parentCapability === "eth_accounts"
            );
            if (accountsPermission) {
                console.log("eth_accounts permission successfully requested!");
            }
        })
        .catch((error) => {
            if (error.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.log("Permissions needed to continue.");
            } else {
                console.error(error);
            }
        });
    }

    // Add a friend to the users' Friends List
    async function addChat( name, publicKey ) {
        try {
			let present = await myContract.checkUserExists( publicKey );
			if( !present ) {
				alert("Given address not found: Ask him to join the app :)");
				return;
			}
			try {
				await myContract.addFriend( publicKey, name );
				const frnd = { "name": name, "publicKey": publicKey };
				setFriends( friends.concat(frnd) );
			} catch(err) {
				alert("Friend already Added! You can't be friend with the same person twice ;P");
			}
		} catch(err) {
			alert("Invalid address!")
		}
    }

    // Sends messsage to an user 
    // async function sendMessage( data ) {
    //     if( !( activeChat && activeChat.publicKey ) ) return;
    //     const recieverAddress = activeChat.publicKey;
    //     await myContract.sendMessage( recieverAddress, data );
    // } 

    // Fetch chat messages with a friend 
    async function getMessage( friendsPublicKey ) {
        let nickname;
        let messages = [];
        friends.forEach( ( item ) => {
            if( item.publicKey === friendsPublicKey )
                nickname = item.name;
        });
        // Get messages
        const data = await myContract.readMessage( friendsPublicKey );
        data.forEach( ( item ) => {
            const timestamp = new Date( 1000*item[1].toNumber() ).toUTCString();
            messages.push({ "publicKey": item[0], "timeStamp": timestamp, "data": item[2] });
        });
        setActiveChat({ friendname: nickname, publicKey: friendsPublicKey });
        setActiveChatMessages( messages );
    }

    // This executes every time page renders and when myPublicKey or myContract changes
    useEffect( () => {
        async function loadFriends() {
            let friendList = [];
            // Get Friends
            try {
                const data = await myContract.getMyFriendList();
                data.forEach( ( item ) => {
                    friendList.push({ "publicKey": item[0], "name": item[1] });
                })
            } catch(err) {
                friendList = null;  
            }
            setFriends( friendList );
        }
        loadFriends();
    }, [myPublicKey, myContract]);

    // // Makes Cards for each Message
    // const Messages = activeChatMessages ? activeChatMessages.map( ( message ) => {
    //     let margin = "5%";
    //     let sender = activeChat.friendname;
    //     if( message.publicKey === myPublicKey ) {
    //         margin = "15%";
    //         sender = "You";
    //     }
    //     return (
    //         <Message marginLeft={ margin } sender={ sender } data={ message.data } timeStamp={ message.timeStamp } />
    //     );
    // }) : null;
  
    // Displays each card
    const chats = friends ? friends.map( ( friend ) => {
     return (
         <ChatCard publicKey={ friend.publicKey } name={ friend.name } getMessages={ ( key ) => getMessage( key ) } />
     );
    }) : null;

    return (
        <Container style={{ padding:"0px", border:"1px solid grey" }}>
            {/* This shows the navbar with connect button */}
            <NavBar username={ myName } login={ async () => login() } logout={ async () => logout() } showButton={ showConnectButton }  showlogoutButton={ showLogoutButton } />
            <Row>
                {/* Here the friends list is shown */}
                <Col style={{ "paddingRight":"0px", "borderRight":"2px solid #000000" }}>
                    <div style={{ "backgroundColor":"#DCDCDC", "height":"100%", overflowY:"auto" }}>
                          <Row style={{ marginRight:"0px" }}  >
                              <Card style={{ width:'100%', alignSelf:'center', marginLeft:"15px" }}>
                                <Card.Header>
                                    {/* Chats */}
                                    Users
                                </Card.Header>
                              </Card>
                          </Row>
                          { chats }
                          { users_list }
                          {/* <AddNewChat myContract={ myContract } addHandler={ ( name, publicKey ) => addChat( name, publicKey )} /> */}
                    </div>
                </Col>
                <Col xs={ 8 } style={{ "paddingLeft":"0px" }}>
                    <div style={{ "backgroundColor":"#DCDCDC", "height":"100%" }}>
                        {/* Chat header with refresh button, username and public key are rendered here */}
                        <Row style={{ marginRight:"0px" }}>
                              <Card style={{ width:'100%', alignSelf:'center', margin:"0 0 5px 15px" }}>
                                <Card.Header>
                                    { activeChat.friendname } : { activeChat.publicKey }
                                    <Button style={{ float:"right" }} variant="warning" onClick={ () => {

                                        if( activeChat && activeChat.publicKey )
                                            getMessage( activeChat.publicKey );
                                            
                                            get_all_messages();
                                            get_all_users();

                                         } }>
                                        Refresh
                                    </Button>
                                </Card.Header>
                            </Card>
                        </Row>
                        {/* The messages will be shown here */}
                        <div className="MessageBox" style={{ height:"400px", overflowY:"auto" }}>
                           { Messages }
                        </div>
                        {/* The form with send button and message input fields */}
                        <div className="SendMessage"  style={{ borderTop:"2px solid black", position:"relative", bottom:"0px", padding:"10px 45px 0 45px", margin:"0 95px 0 0", width:"97%" }}>
                            <Form onSubmit={ (e) => {
			                	e.preventDefault();

			                	sendMessage( document.getElementById( 'messageData' ).value );

			                	document.getElementById( 'messageData' ).value = "";

                                get_all_messages();
                                get_all_users();

			                }}>
                                <Form.Row className="align-items-center">
                                    <Col xs={9}>
                                        <Form.Control id="messageData" className="mb-2"  placeholder="Send Message" />
                                    </Col>
                                    <Col >
                                      <Button className="mb-2" style={{ float:"right" }} onClick={ () => {

                                          sendMessage( document.getElementById( 'messageData' ).value );

                                          document.getElementById( 'messageData' ).value = "";

                                          get_all_messages();
                                          get_all_users();

                                      }}>
                                        Send
                                      </Button>
                                    </Col>
                                </Form.Row>
                            </Form>
                        </div> 
                    </div>
                </Col>
            </Row>
        </Container>
    );
}