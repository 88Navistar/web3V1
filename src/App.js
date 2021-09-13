import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import ReactFlagsSelect from 'react-flags-select';
import { Ca } from 'react-flags-select';



export default function App() {

  const [currentAccount, setCurrentAccount] = React.useState("")
  const [allWaves, setAllWaves] = React.useState([])
  const [message, setMessage] = React.useState("")
  const contractAddress = "0x0d9A6Dc127E95497AbA438C6c796cC9B504d5E58"
  const contractABI = abi.abi;

  async function getAllWaves() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await waveportalContract.getAllWaves();

    let wavesCleaned = []
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    setAllWaves(wavesCleaned)

    waveportalContract.on("NewWave", (from, timestamp, message) => {
      setAllWaves(oldArray => [...oldArray, {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message
      }])
    })
  }

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have Metamask")
      return
    } else {
       console.log("Ethereum Object")
    }
  
  ethereum.request({ method: 'eth_accounts'})
  .then(accounts => {
    if(accounts.length !==0) {
      const account = accounts[0];
      console.log("found and authorized account: ", account)
      setCurrentAccount(account);
      getAllWaves();
    } else {
      console.log('No authorized account found')
    }
  })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get Metamask")
    }

    ethereum.request( {method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => console.log(err))
  }

  const wave = async () => {
    console.log("Wave Object", wave)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves()
    console.log("Retrieved total wave count...", count.toNumber())

    const waveTxn = await waveportalContract.wave(message, { gasLimit: 300000 })
    console.log("Mining...", waveTxn.hash)
    await waveTxn.wait()
    console.log("Mined -- ", waveTxn.hash)

    count = await waveportalContract.getTotalWaves()
    console.log("Retreived total wave count...", count.toNumber())
    
  }
  React.useEffect(() => {
    checkIfWalletIsConnected()
  }, [])
  const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0) + s.charAt(1).toLowerCase()
}
  return (
    
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="Wave">👋</span> 88 Create Crypto Project
        </div>
        <Ca />
        
        <div className="bio">
        Select Your Country Flag and then the Wave Button
        </div>
        <div className="bio">
        You have a 50% chance of winning ether
        </div>
        <ReactFlagsSelect
        selectedSize={14}
        selected={message}
        onSelect={code => setMessage(code)}
        fullWidth={false}
      />
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        
        {currentAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div className="card">
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Country: {wave.message} </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
