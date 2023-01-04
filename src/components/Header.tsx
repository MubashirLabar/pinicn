import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import { MenuIcon } from "../assets/icons";

import {
  getChainName,
  shortenAddress,
} from "@usedapp/core";

import { useDispatch, useSelector } from "react-redux";
import { DataType, setActiveUser, setNetworkID } from "../store";

import { ethers } from "ethers";
import MetaMaskOnboarding from "@metamask/onboarding";
import {isMobile} from 'react-device-detect';


interface Props {
  page?: string;
  openSidebar: boolean;
  setOpenSidebar: Dispatch<SetStateAction<boolean>>;
}

// const abi = require("./onPlanet.json")
// const contract = "0x80f3C51A3fBDC38194852Ee239e729CcD2c0c40c";

const Header = (props: Props): JSX.Element => {
  const { page, openSidebar, setOpenSidebar } = props;

  const dispatch = useDispatch();
  const { userInfo, networkDetail } = useSelector( (state: DataType) => state );

  window.ethereum &&
    window.ethereum.on("accountsChanged", (accounts: any) => {
      dispatch(setActiveUser(accounts[0]));
    });

  window.ethereum &&
    window.ethereum.on("chainChanged", (chainId: any) => {
      // console.log("chainId ", Number(chainId));
      dispatch( setNetworkID( Number(chainId) ) )
      window.location.reload();
    });

  useEffect(() => {
    connectMetamask();
  }, [userInfo.userAddress]);

  const connectMetamask = async () => {
    
    
    if (isMobile) {
      const isMetaMaskAvaialble = MetaMaskOnboarding.isMetaMaskInstalled();
      if (!isMetaMaskAvaialble) {
        // console.log("CLICKING")
        alert("Please open this DApp in metamask browser");
      }
      else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const myAddress = await signer.getAddress();
        dispatch(setActiveUser(myAddress));  
        const network = await provider.getNetwork();
        // console.log("Chain id ", Number(network.chainId));
        dispatch( setNetworkID(Number(network.chainId)) );
      }
    }
    else {
      const isMetaMaskAvaialble = MetaMaskOnboarding.isMetaMaskInstalled();
      if (!isMetaMaskAvaialble) {
        // console.log("Onbording start")
        const askToInstall = window.confirm(
          "No metamask Found. please install it"
        );
        // console.log("askToInstall ", askToInstall)
        if (askToInstall) {
          const onboarding = new MetaMaskOnboarding();
          onboarding.startOnboarding();
        }
      }
  
      if (isMetaMaskAvaialble) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const myAddress = await signer.getAddress();
        // console.log("sss", myAddress);
        dispatch(setActiveUser(myAddress));
  
        const network = await provider.getNetwork();
        // console.log("Chain id ", Number(network.chainId));
        dispatch( setNetworkID(Number(network.chainId)) );
  
      }
    }

    
  };

  return (
    <>
      <div className={`header-cmp flex aic`}>

        <div className="left flex aic">
          <Link to="/" className="logo">
            <img className="img" src={require("../assets/logo3.png").default} />
          </Link>
          <button
            className="cleanbtn menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setOpenSidebar(!openSidebar);
            }}
          >
            <MenuIcon />
          </button>
        </div>
        
        <div className="right flex aic">
          
          {
            !isMobile && (
              <>
                <button className="button font s14 cfff">
                  <a href="http://meme.tech/" target="_blank" className="font s14 cfff">
                    <span className="ico">
                      meme.tech
                    </span>
                  </a>
                </button>

                <button className="button font s14 cfff">
                  <a href="https://cpadclaim.app/" target="_blank" className="font s14 cfff">
                    <span className="ico">
                      Claim CPAD
                    </span>
                  </a>
                </button>
              </>
            ) 
          }


          {networkDetail.id && (
            <button className="button blue-bg font s14 cfff">
              {networkDetail.id === 56 ?
                (isMobile ? `Mainnet`:`BSC Mainnet`) :
                networkDetail.id === 97 ?
                (isMobile ? `Testnet`:`BSC Testnet`) :
                null
            }
            </button>
          )}

          
          {!userInfo.userAddress && (
            <button
              className="button blue-bg font s14 cfff"
              onClick={connectMetamask}
            >
              {
                isMobile ? "Connect" : "Connect Wallet"
              }
            </button>
          )}

          
          {userInfo.userAddress && (
              <button className="button blue-bg font s14 cfff">
                {shortenAddress(userInfo.userAddress)}
              </button>
          )}

        </div>
      </div>
    </>
  );
};

export default Header;
