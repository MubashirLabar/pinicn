import React, { useState } from "react";
import { Link } from "react-router-dom";

const LockedTokenDetails = () => {
  const [view, setView] = useState("visit");

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

  const [lockedRecord, setLockedRecord] = useState([
    {
      wallet_address: "0x4d4e...553e",
      amount: "10.98",
      unlocked: "2021/12/28 23:40 UTC",
    },
  ]);

  return (
    <div className="locked-token-visiting">
      <div className="wrapper wrapWidth flex flex-col">
        {/* Lock Info Block */}
        <div className="info-block">
          <div className="hdr flex aic">
            <div className="label font s20 b5 c000">
              <span className="color">Locked</span>&nbsp;LP Tokens
            </div>
            <div className="actions flex aic">
              <button
                onClick={() => setView("visit")}
                className={`btn font s14 b3 anim c000 ${
                  view === "visit" ? "active" : ""
                }`}
              >
                Visitor View
              </button>
              <button
                onClick={() => setView("owner")}
                className={`btn font s14 b3 anim c000 ${
                  view === "owner" ? "active" : ""
                }`}
              >
                Owner View
              </button>
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

        {/* Credit Block */}
        {view === "owner" && (
          <div className="credit-block flex aic">
            <div className="credit-form flex flex-col">
              <div className="tit font s18 b6 c000">Withdraw</div>
              <input
                type="text"
                placeholder="0.00"
                className="cleanbtn iput font s14 c000 anim"
              />
              <div className="flex aic jcc">
                <button className="button font s15 cfff">Withdraw</button>
              </div>
            </div>
            <div className="credit-form flex flex-col">
              <div className="tit font s18 b6 c000">Add Amount</div>
              <input
                type="text"
                placeholder="0.00"
                className="cleanbtn iput font s14 c000 anim"
              />
              <div className="flex aic jcc">
                <button className="button font s15 cfff">Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Lock Record */}
        <div className="info-block records">
          <div className="hdr flex aic">
            <div className="label font s20 b5 c000">
              <span className="color">Lock</span>&nbsp;Records
            </div>
          </div>
          <div className="table-content">
            <div className="table-hdr flex aic">
              <div className="col">
                <div className="label font">Wallet address</div>
              </div>
              <div className="col">
                <div className="label font">Amount</div>
              </div>
              <div className="col">
                <div className="label font">Unlock time</div>
              </div>
              <div className="col"></div>
            </div>
            {lockedRecord.map((item, index) => (
              <div className="row">
                <div className="col">
                  <div className="text font blue">{item.wallet_address}</div>
                </div>
                <div className="col">
                  <div className="text font">{item.amount}</div>
                </div>
                <div className="col">
                  <div className="text font">{item.unlocked}</div>
                </div>
                <div className="col">
                  <Link
                    to="/locked-token-listing/detail/record"
                    className="cleanbtn view-all-btn font s14 blue"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockedTokenDetails;
