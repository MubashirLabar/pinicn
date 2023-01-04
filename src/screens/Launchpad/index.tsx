import React, { useState, useEffect } from "react";

import VerifyToken from "./VerifyToken";
import LaunchpadInfo from "./LaunchpadInfo";
import AdditionalInfo from "./AdditionalInfo";
import Finish from "./Finish";

const Launchpad = () => {
  const [step, setStep] = useState(1);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleBackStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="launchpad-page">
      {/* Steps */}
      <div className="steps wrapWidth flex aic">
        <section className="ps-timeline-sec">
          <div className="container">
            <ol className="ps-timeline">
              <li>
                <div className="img-handler-bot">
                  <div className="item flex flex-col">
                    <div className="lbl font s13 c000 b5">Verify Token</div>
                    <div className="txt font s12 c7d">
                      Enter the token address and verify
                    </div>
                  </div>
                </div>
                <span className={`ps-sp anim ${step === 1 ? "active" : ""}`}>
                  <div className="small-circle anim">01</div>
                </span>
              </li>
              <li>
                <div className="img-handler-bot">
                  <div className="item flex flex-col">
                    <div className="lbl font s13 c000 b5">
                       Launchpad Info
                    </div>
                    <div className="txt font s12 c7d">
                      Enter the launchpad information that you want to raise ,
                      that should be enter all details about your presale
                    </div>
                  </div>
                </div>
                <span className={`ps-sp anim ${step === 2 ? "active" : ""}`}>
                  <div className="small-circle anim">02</div>
                </span>
              </li>
              <li>
                <div className="img-handler-bot">
                  <div className="item flex flex-col">
                    <div className="lbl font s13 c000 b5">
                      Add Additional info
                    </div>
                    <div className="txt font s12 c7d">
                      Let people know who you are
                    </div>
                  </div>
                </div>
                <span className={`ps-sp anim ${step === 3 ? "active" : ""}`}>
                  <div className="small-circle anim">03</div>
                </span>
              </li>
              <li>
                <div className="img-handler-bot">
                  <div className="item flex flex-col">
                    <div className="lbl font s13 c000 b5">Finish</div>
                    <div className="txt font s12 c7d">
                      Review your information
                    </div>
                  </div>
                </div>
                <span className={`ps-sp anim ${step === 4 ? "active" : ""}`}>
                  <div className="small-circle anim">04</div>
                </span>
              </li>
            </ol>
          </div>
        </section>
      </div>

      {/* Wrapper */}
      <div className="wrapper wrapWidth flex flex-col">
        {step === 1 && <VerifyToken handleNextStep={handleNextStep} />}
        {step === 2 && (
          <LaunchpadInfo
            handleNextStep={handleNextStep}
            handleBackStep={handleBackStep}
          />
        )}
        {step === 3 && (
          <AdditionalInfo
            handleNextStep={handleNextStep}
            handleBackStep={handleBackStep}
          />
        )}
        {step === 4 && (
          <Finish
            handleNextStep={handleNextStep}
            handleBackStep={handleBackStep}
          />
        )}
      </div>
    </div>
  );
};

export default Launchpad;
