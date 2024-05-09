import React, { useState } from 'react';

   function App() {

       const [message, setMessage] = useState('');

       

       const sendMessage = async () => {

           await simpleMessagingContract.methods.sendMessage(message).send({ from: YOUR_USER_ADDRESS });

       };

       return (

           <div>

               <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />

               <button onClick={sendMessage}>Send Message</button>

           </div>

       );

   }

   export default App;