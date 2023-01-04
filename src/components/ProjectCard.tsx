import React from "react";
import { Link } from "react-router-dom";
import {
  ShareIcon,
  TwitterIcon,
  DiscordIcon,
  SendIcon,
  ClockIcon,
} from "../assets/icons";
import { useDispatch, useSelector } from "react-redux";

import {
  SalesDataType,
  getSaleStatus,
  getSaleType,
  getCountDownStatus,
  getCountDown,
  getProgress,
  DataType,
  convertToETHs,
} from "../store";
import { BigNumber, ethers } from "ethers";

const ProjectCard: React.FC<SalesDataType> = (saleData) => {
  const { networkDetail } = useSelector((state: DataType) => state);

  console.log("saleData ", saleData)

  const price = saleData.participationCriteria.priceOfEachToken;
  const totalTokens = saleData.participationCriteria.tokensForSale;
  const symbol = saleData.tokenInfo.symbol;
  const deciaml = saleData.tokenInfo.decimals;

  const min = ethers.utils.formatEther(saleData.reqestedTokens.minTokensReq.mul(price));
  const max = ethers.utils.formatEther(saleData.reqestedTokens.maxTokensReq.mul(price))
  const MinMax = () => `${min} BNB / ${max} BNB`;

  // console.log("min ", ethers.utils.formatEther(saleData.reqestedTokens.minTokensReq.mul(price)))
  // console.log("max ", max)
  
  const tokensOnSale = () =>  `${saleData.participationCriteria.tokensForSale} ${symbol}`;
  
  // const softcap = Number(convertToETHs(price.mul(saleData.reqestedTokens.softCap), saleData.tokenInfo.decimals)).toFixed(2);
  // const hardcap = Number(convertToETHs(price.mul(totalTokens), saleData.tokenInfo.decimals ) ).toFixed(2);
  // const hardcap = Number(convertToETHs(price.mul(totalTokens), saleData.tokenInfo.decimals ) ).toFixed(2);

  const softcap =  ethers.utils.formatEther(price.mul(saleData.reqestedTokens.softCap));
  const hardcap =  ethers.utils.formatEther(price.mul(totalTokens)).toString();
  const SoftHardCap = () => `${softcap} BNB / ${hardcap} BNB`;


  const raiseAmount = ethers.utils.formatEther(totalTokens.sub(saleData.presalectCounts.remainingTokensForSale).mul(price));
  const raised = () => `${raiseAmount} BNB`;
  
  const available = () => `${saleData.presalectCounts.remainingTokensForSale} ${symbol}`;

  const progress = () => getProgress( saleData.participationCriteria.tokensForSale, saleData.presalectCounts.remainingTokensForSale );

  // console.log("Progress ", progress());
  // console.log("status....", getSaleStatus(saleData));

  return (
    <Link
      to={`/presale/${saleData.saleAddress}?chainID=${networkDetail.id}`}
      className="project-card flex flex-col"
    >
      <div className="hdr flex aic">
        <div className="lit flex aic">
          <div className="img flex aic">
            <img
              src={saleData.generalInfo?.logoURL}
              className="icon"
            />
          </div>
          <div className="meta flex flex-col">
            <div className="lbl font s14 c000">{saleData.tokenInfo.name}</div>
            <div className="font s13 b3 ccc">{saleData.tokenInfo.symbol}</div>
          </div>
        </div>
        <div className="rit flex aic">
          <div className={`status flex aic ${getSaleStatus(saleData)}`}>
            <div className="dot" />
            <div className="lbl font">{getSaleStatus(saleData)}</div>
          </div>
        </div>
      </div>
      <div className="progress-blk flex aic">
        {/* <div className="progress-txt font c000">Progress (0.20%)</div>
        <div className="progress-bar">
          <div className="bar" style={{ width: "60%" }} />
        </div> */}

        <div className="progress-txt font c000">
          {`Progress (${getProgress(
            saleData.participationCriteria.tokensForSale,
            saleData.presalectCounts.remainingTokensForSale
          )}%`}
          )
        </div>
        <div className="progress-bar">
          <div
            className="bar"
            style={{
              width: `${getProgress(
                saleData.participationCriteria.tokensForSale,
                saleData.presalectCounts.remainingTokensForSale
              )}%`,
            }}
          />
        </div>

        <div className="progress-meta flex aic">
          <div className="lit txt font">0 BNB</div>
          <div className="rit txt font">{
          `${ethers.utils.formatEther(saleData.participationCriteria.tokensForSale.mul(saleData.participationCriteria.priceOfEachToken))} BNB`
          }</div>
          {/* <div className="rit txt font">Hello</div> */}
        </div>

      </div>

      <div className="info-blk flex flex-col">
        <div className="item flex aic">
          <div className="lbl font">Type</div>
          <div className="font txt">
            {getSaleType(saleData.participationCriteria.typeOfPresale)}
          </div>
        </div>

        <div className="item flex aic">
          <div className="lbl font">Tokens on presale</div>
          <div className="font txt">{tokensOnSale()}</div>
        </div>

        <div className="item flex aic">
          <div className="lbl font">Soft/Hard</div>
          <div className="font txt">{SoftHardCap()}</div>
        </div>

        <div className="item flex aic">
          <div className="lbl font">Min/Max</div>
          <div className="font txt">{MinMax()}</div>
        </div>
      </div>
      <div className="info-blk statics-blk flex flex-col">
        <div className="item flex aic">
          <div className="lbl font">Total raised</div>
          <div className="font txt">{raised()}</div>
        </div>

        <div className="item flex aic">
          <div className="lbl font">{`Avaialble`}</div>
          <div className="font txt">{available()}</div>
        </div>

        <div className="item flex aic">
          <div className="lbl font">
            {getCountDownStatus(
              saleData,
              saleData.presaleTimes.startedAt,
              saleData.presaleTimes.expiredAt
            )}
          </div>
          <div className="font txt">
            {getCountDown(
              saleData,
              saleData.presaleTimes.startedAt,
              saleData.presaleTimes.expiredAt
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
