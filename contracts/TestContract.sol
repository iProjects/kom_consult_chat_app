// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19; 

contract TestContract 
{
  uint public counter = 0;
 
  constructor() public {
    IncrementCounter();
  }
 
  function IncrementCounter() public
  {
    counter ++;
  }
}
