import React, { useEffect, useState } from "react";

import { BigNumber, ethers } from "ethers";

import { useDispatch, useSelector } from "react-redux";
import {
  DataType,
  updatePresaleTokenAllownce,
  setPresaleTokenInfo,
  setPresaleTokenLoading,
  getLaunchPadAddress,
} from "../../store";
import { Loader } from "../../components";
import { BEP20 } from "../../typechain";
const BEP20Token = require("../../abis/BEP20.json");

interface verifyTokenProps {
  handleNextStep?: any;
}

const VerifyToken = ({ handleNextStep }: verifyTokenProps): JSX.Element => {
  
  const { userInfo, presaleTokenInfo, masterContracts } = useSelector( (state: DataType) => state );

  const dispatch = useDispatch();
  const [input, setInput] = useState<string>("");


  let decimalFactor = BigNumber.from(String(10**presaleTokenInfo.decimal)); 


  const approveTokens = async () => {

    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let launchPadAddress = await getLaunchPadAddress(provider)
    const signer = provider.getSigner();
    let myaddress = await signer.getAddress()

    if (presaleTokenInfo === null || presaleTokenInfo.address === null || launchPadAddress === null) {
      return;
    }


    const BEP20Contract = new ethers.Contract(
      presaleTokenInfo.address,
      BEP20Token.abi,
      provider
    ) as BEP20;

    const decimal = await BEP20Contract.decimals();
    const balance = await BEP20Contract.balanceOf(myaddress);
    const approveTx = BEP20Contract.connect(signer);

    try {

      let tx = await approveTx?.approve(
        launchPadAddress,
        balance
      );

      await tx?.wait();
      const newAllownce = await BEP20Contract.allowance( myaddress, launchPadAddress)
      
      console.log("newAllownce ", Number(newAllownce));

      dispatch(updatePresaleTokenAllownce(newAllownce));


    } catch (e) {
      console.log(e);
    }

  };

  const handleInput = async (e: string) => {
    dispatch(setPresaleTokenInfo(null));
    setInput(e);
    
    if (!ethers.utils.isAddress(e)) {
      return;
    }

    dispatch(setPresaleTokenLoading(true));

    
    
    try {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let launchPadAddress = await getLaunchPadAddress(provider)
      const signer = provider.getSigner();
      let myaddress = await signer.getAddress()
      
      const BEP20Contract = new ethers.Contract(
        e,
        BEP20Token.abi,
        provider
        ) as BEP20;
        
        
        const name = await BEP20Contract.name();
        const symbol = await BEP20Contract.symbol();
        // const decimals = String(await BEP20Contract.decimals());
        // const totalSupply = ethers.utils.formatEther(await BEP20Contract.totalSupply());
        // const balanceOf = ethers.utils.formatEther(await BEP20Contract.balanceOf(myaddress));
        // const allownce = ethers.utils.formatEther(await BEP20Contract.allowance(myaddress, launchPadAddress));
        
        const decimals = await BEP20Contract.decimals()
        
        // const totalSupply = (await BEP20Contract.totalSupply()).div(BigNumber.from(String(10**decimals)))
        // const balanceOf = (await BEP20Contract.balanceOf(myaddress)).div(10**decimals)
        // const allownce = (await BEP20Contract.allowance(myaddress, launchPadAddress)).div(BigNumber.from(String(10**decimals)))
        
        const totalSupply = await BEP20Contract.totalSupply()
        const balanceOf = await BEP20Contract.balanceOf(myaddress)
        const allownce = await BEP20Contract.allowance(myaddress, launchPadAddress)        
        
        console.log("Trying ")
        
      const defaultPresaleTokenInfo = {
        loading: presaleTokenInfo.loading,
        address: e,
        name: name,
        symbol: symbol,
        decimal: decimals,
        totalSupply: totalSupply,
        youhold: balanceOf,
        allowance: allownce,
      };

      dispatch(setPresaleTokenInfo(defaultPresaleTokenInfo));
    } catch (e) {
      console.log(e);
    }

    dispatch(setPresaleTokenLoading(false));
  };

  useEffect(() => {
    dispatch(setPresaleTokenInfo(null));
  }, []);



  return (
    <div className="verify-token-section">
      <div className="title font s20 b5 color">Launchpad</div>
      <div className="block flex flex-col">
        <div className="lbl font s14 c000">Token address</div>
        <div className="field flex aic">
          <input
            onChange={(e) => {
              handleInput(e.target.value);
            }}
            value={presaleTokenInfo.address || input}
            type="text"
            placeholder="Enter token address..."
            className="iput cleanbtn  font s14"
          />
        </div>
        {/* <button className="cleanbtn create-pool-btn font s14  blue">
          Create pool fee: X BNB
        </button> */}
        <div className="loading">{presaleTokenInfo.loading && <Loader />}</div>
      </div>
      {!presaleTokenInfo.loading &&
        presaleTokenInfo.name &&
        presaleTokenInfo.totalSupply && (
          <div className="extra-content flex flex-col">
            <div className="item">
              <div className="lbl font">Name:</div>
              <div className="txt font">{presaleTokenInfo.name}</div>
            </div>
            <div className="item">
              <div className="lbl font">Symbol:</div>
              <div className="txt font">{presaleTokenInfo.symbol}</div>
            </div>
            <div className="item">
              <div className="lbl font">Deciaml:</div>
              <div className="txt font">{presaleTokenInfo.decimal}</div>
            </div>
            <div className="item">
              <div className="lbl font">Total Supply:</div>
              {/* <div className="txt font">{presaleTokenInfo.totalSupply.toString()}</div> */}
              <div className="txt font">{(presaleTokenInfo.totalSupply.div(decimalFactor)).toString()}</div>
            </div>
          {
            presaleTokenInfo.youhold && (
              <div className="item">
                <div className="lbl font">Balance:</div>
                <div className="txt font">{(presaleTokenInfo.youhold?.div(decimalFactor)).toString()}</div>
              </div>
            )
          }
            <div className="warning-msg font">
              Make sure the token has 'Exclude transfer fee' function if it has
              transfer fees.
            </div>
          </div>
        )}

      <div className="ftr flex aic">
        {Number(presaleTokenInfo.youhold) === 0 && (
          <button
            className="button next-button font s14 cff"
            disabled={true}
            onClick={handleNextStep}
          >
            Next
          </button>
        )}

        {Number(presaleTokenInfo.youhold) !== 0 &&
          Number(presaleTokenInfo.allowance) <
            Number(presaleTokenInfo.youhold) && (
            <button
              className="button next-button font s14 cff"
              onClick={approveTokens}
            >
              Approve
            </button>
          )}

        {Number(presaleTokenInfo.youhold) !== 0 &&
          Number(presaleTokenInfo.allowance) >=
            Number(presaleTokenInfo.youhold) && (
            <button
              className="button next-button font s14 cff"
              onClick={handleNextStep}
            >
              Next
            </button>
          )}
      </div>
    </div>
  );
};

export default VerifyToken;
