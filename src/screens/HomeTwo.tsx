import React from "react";
import { DropDownIcon, SwapIcon } from "../assets/icons";

const HomeTwo = () => {
  return (
    <div className="home-two-page">
      {/* Intro section */}
      <div className="intro-section">
        <div className="wrapWidth flex">
          <div className="intro flex flex-col">
            <div className="tag font s38 b5 color">CHEEMSPAD</div>
            <div className="slogn font s38 b6 c000">
              Buy & Get Exclusive Access To Our Launches
            </div>
            <div className="text font s15">
            CHEEMSPAD is the home of safe coin launches. Grab some
            </div>
          </div>
          <div className="right flex flex-col">
            <div className="form flex flex-col">
              <div className="item flex flex-col">
                <div className="lbl font">You have</div>
                <div className="field flex aic">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="iput font"
                  />
                  <button className="cleanbtn field-btn font s14 cfff">
                  CHEEMSPAD
                    <div className="ico">
                      <DropDownIcon />
                    </div>
                  </button>
                </div>
              </div>
              <div className="swap flex aic">
                <div className="icon">
                  <SwapIcon />
                </div>
              </div>
              <div className="item flex flex-col">
                <div className="lbl font">You get</div>
                <div className="field flex aic">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="iput font"
                  />
                  <button className="cleanbtn field-btn font s14 cfff">
                    BNB
                    <div className="ico">
                      <DropDownIcon />
                    </div>
                  </button>
                </div>
              </div>
              <button className="enter-btn button font s15 cfff">
                Enter Amount
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statics section */}
      <div className="statics-section">
        <div className="wrapWidth wrap flex aic">
          <div className="item">
            <div className="num font">0</div>
            <div className="lbl font">Launches</div>
          </div>
          {/* <div className="item">
            <div className="num font">7 800</div>
            <div className="lbl font">$PICNIC Burned</div>
          </div>
          <div className="item">
            <div className="num font">13 867</div>
            <div className="lbl font">$PICNIC Remaining</div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default HomeTwo;
