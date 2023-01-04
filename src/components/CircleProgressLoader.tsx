import React from "react";

const CircleProgressLoader = () => {
  var strokeDashOffsetValue = 25;
  return (
    <div className="circle-progress-loader">
      <div className="circle-progress-bar">
        <svg className="circle" viewBox="-1 -1 38 38">
          <circle
            cx="19"
            cy="19"
            r="15.9155"
            className="progress-bar__background"
          />
          <circle
            cx="19"
            cy="19"
            r="15.9155"
            className="progress-bar__progress"
            style={{ strokeDashoffset: strokeDashOffsetValue }}
          />
        </svg>
        <div className="meta flex flex-col aic">
          <div className="loaded font s26 b6 c36">{`${
            100 - strokeDashOffsetValue
          }%`}</div>
          <div className="txt font s13">Loading...</div>
        </div>
      </div>
    </div>
  );
};

export default CircleProgressLoader;
