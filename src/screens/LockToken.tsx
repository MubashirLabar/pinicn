import React, { useState } from "react";
import ComingSoon from "../components/ComingSoon";

const LockToken = () => {
  const [feeType, setFeeType] = useState("Pay in LP (0.5% of locked LP token)");

  return <ComingSoon />;

  return (
    <div className="lock-token-page">
      <div className="wrapper wrapWidth flex flex-col">
        <div className="section flex flex-col">
          <div className="title font s20 b6 c000">
            <span className="color">Lock</span> a Token
          </div>
          <div className="field flex aic">
            <input
              type="text"
              placeholder="Enter $PIC LP token address"
              className="cleanbtn iput font s14 c000"
            />
          </div>
          <div className="field flex aic">
            <input
              type="text"
              placeholder="Enter LP token amount to lock"
              className="cleanbtn iput padding-right font s14 c000"
            />
            <button className="button font s14 cfff">Max</button>
          </div>
          <div className="field flex aic">
            <input
              type="text"
              placeholder="2021/12/30 05:02"
              className="cleanbtn iput padding-right font s14 c000"
            />
            <button className="button font s14 cfff">Tomorrow</button>
            <button className="button font s14 cfff">+1 Year</button>
          </div>
          <div className="fee-type flex flex-col">
            <div className="lbl font s14 c000">Select fee type:</div>
            <div className="options flex aic">
              <button
                className={`opt-btn font s14 ${
                  feeType === "Pay in LP (0.5% of locked LP token)"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFeeType("Pay in LP (0.5% of locked LP token)")
                }
              >
                Pay in LP (0.5% of locked LP token)
              </button>
              <button
                className={`opt-btn font s14 ${
                  feeType === "Pay in BNB (0.1% BNB fiat)" ? "active" : ""
                }`}
                onClick={() => setFeeType("Pay in BNB (0.1% BNB fiat)")}
              >
                Pay in BNB (0.1% BNB fiat)
              </button>
            </div>
          </div>
          <div className="ftr flex aic">
            <button className="button font cfff">Approve Token</button>
            <button className="button font cfff">Lock Tokens</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockToken;
