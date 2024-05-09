// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19; 

contract Counter {
  uint public trasactionCount = 0;
  
  function AddTransaction() public {
    trasactionCount++;
  }
}



