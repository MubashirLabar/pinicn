import React, { useState } from "react";

const LockRecord = () => {
  const [lockInfo, setLockInfo] = useState([
    { label: "Total Amount Locked", value: "2 000.00 $PIC" },
    { label: "Total Values Locked", value: "0$" },
    {
      label: "Token Address",
      value: "0xECB972692dceFc51e9B45e096C7A0b1411019e9b",
      type: "link",
    },
    { label: "Token Name", value: "ABC" },
    { label: "Token Symbol", value: "$ABC" },
    { label: "Token Decimals", value: "9" },
  ]);

  return (
    <div className="locked-token-record">
      <div className="wrapper wrapWidth flex flex-col">
        <div className="stamp-blk">
          <div className="title">Unlock in</div>
          <div className="stamp font s15 b5 c000">Time left: 00:11:13:05</div>
        </div>
        {/* Token Info Block */}
        <div className="info-block">
          <div className="hdr flex aic">
            <div className="label font s20 b5 c000">
              <span className="color">Token</span>&nbsp;Info
            </div>
          </div>
          {lockInfo.map((item, index) => (
            <div className="info-item flex aic">
              <div className="lbl font">{item.label}</div>
              <div className={`val font wordwrap ${item.type}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Token Info Block */}
        <div className="info-block">
          <div className="hdr flex aic">
            <div className="label font s20 b5 c000">
              <span className="color">Lock</span>&nbsp;Info
            </div>
          </div>
          {lockInfo.map((item, index) => (
            <div className="info-item flex aic">
              <div className="lbl font">{item.label}</div>
              <div className={`val font wordwrap ${item.type}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="ftr-description">
          <div className="txt font">
            Disclaimer: The information provided shall not in any way constitute
            a recommendation as to whether you should invest in any product
            discussed. We accept no liability for any loss occasioned to any
            person acting or refraining from action as a result of any material
            provided or published.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockRecord;
