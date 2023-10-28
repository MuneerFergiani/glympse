import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from './circuit/target/circuit.json';

document.addEventListener('DOMContentLoaded', async () => {
    // here's where the magic happens
    const backend = new BarretenbergBackend(circuit);
    const noir = new Noir(circuit, backend);

    const input = { x: 1, y: 2 };
    display('logs', 'Generating proof... ⌛');

    try{
        const proof = await noir.generateFinalProof(input);

        display('logs', 'Generating proof... ✅');
        display('results', proof.proof);
    }
    catch (e)
    {
        display('logs', 'Generating proof...  Error');
        console.error(e);
    }
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
      
        // Request permission to access the accounts
        window.ethereum.request({ method: 'eth_requestAccounts' })
          .then((accounts) => {
            const account = accounts[0]; // Assuming you want the first account
      
            // Use the web3 library to get the public key for the account
            web3.eth.getPublicKey(account, 'hex')
              .then((publicKey) => {
                console.log('Public Key:', publicKey);
              })
              .catch((error) => {
                console.error('Error getting public key:', error);
              });
          })
          .catch((error) => {
            console.error('Error requesting accounts:', error);
          });
      } else {
        console.error('MetaMask is not installed');
      }

  });
  
  function display(container, msg) {
    const c = document.getElementById(container);
    const p = document.createElement('p');
    p.textContent = msg;
    c.appendChild(p);
  }