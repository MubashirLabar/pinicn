import React, { useEffect, useState } from "react";
import ArrowDownIcon from "../../assets/icons/ArrowDownIcon";
import ArrowUpIcon from "../../assets/icons/ArrowUpIcon";
import { useDispatch, useSelector } from "react-redux";
import {
  DataType,
  getLaunchPadAddress,
  RefundType,
  SaleType,
} from "../../store";
import { ethers } from "@usedapp/core/node_modules/ethers";
import { useNavigate } from "react-router-dom";
import { Launchpadv2 } from "../../typechain";
import { Loader } from "../../components";
import { BigNumber } from "ethers";

const Launchpadv2ABI = require("../../abis/Launchpadv2.json");

interface finishProps {
  handleNextStep?: any;
  handleBackStep?: any;
}

interface Release {
  cycle: number;
  releaseTime: number;
  tokensPC: number;
  percentageToRelease: number;
}

const zeroAddress = "0x0000000000000000000000000000000000000000";

const Finish = ({ handleNextStep, handleBackStep, }: finishProps) => {
  const navigate = useNavigate();

  const { presaleTokenInfo, presaleInfo, networkDetail, presaleGeneralInfo } = useSelector((state: DataType) => state);

  const [submiting, setSubmiting] = useState(false)

  const handleSubmit = async () => {

    
    let provider = new ethers.providers.Web3Provider(window.ethereum);

    let launchPadAddress = await getLaunchPadAddress(provider);
    // console.log("launchPadAddress ", launchPadAddress)

    const launchpadContract = new ethers.Contract(
      launchPadAddress,
      Launchpadv2ABI.abi,
      provider
    ) as Launchpadv2;

    const fee = await launchpadContract.upfrontfee();
    // console.log("fee ", fee.toString());

    const signer = provider.getSigner();
    const myAddress = await signer.getAddress();

    if (
      presaleTokenInfo.address === null ||
      presaleTokenInfo.name === null ||
      presaleTokenInfo.symbol === null ||
      presaleTokenInfo.decimal === null
    ) {
      return;
    }

    const tokenInfo = {
      id: "0",
      presaleOwner: myAddress,
      preSaleStatus: "0",
      preSaleToken: presaleTokenInfo.address,
      decimals: presaleTokenInfo.decimal
    };

    if (
      presaleInfo.tokensForSale === null ||
      presaleInfo.liquidity === null ||
      presaleInfo.typeOfPresale === null ||
      presaleInfo.priceOfEach === null
    ) {
      // console.log(presaleInfo);
      // console.log("Problem");
      return;
    }

    if (
      presaleInfo.tokensForSale === SaleType.TOKENHOLDERS &&
      presaleInfo.criteriaToken !== null &&
      presaleInfo.minCriteriaTokens !== null
    ) {
      // console.log(presaleInfo);
      alert(
        "criteriaToken or minCriteriaTokens Can't be null with TOKENHOLDERS presale"
      );
    }

    const participationCriteria = {
      tokensForSale: presaleInfo.tokensForSale.toFixed(),
      tokensPCForLP: presaleInfo.liquidity.toString(),
      typeOfPresale: presaleInfo.typeOfPresale,
      // priceOfEachToken: (presaleInfo.priceOfEach * 10 ** 18).toFixed(),
      priceOfEachToken: ethers.utils.parseEther(presaleInfo.priceOfEach.toString()),
      criteriaToken: presaleInfo.criteriaToken
        ? presaleInfo.criteriaToken
        : zeroAddress,
      minTokensForParticipation: presaleInfo.minCriteriaTokens
        ? presaleInfo.minCriteriaTokens.toString()
        : "0",
      refundType: presaleInfo.refundType,
    };

    if (
      presaleInfo.startAt === null ||
      presaleInfo.endAt === null ||
      presaleInfo.LPLcokup === null
    ) {
      // console.log("Problem");
      return;
    }

    const start = (
      (new Date(presaleInfo.startAt).getTime() -
        new Date(presaleInfo.startAt).getTimezoneOffset() * 60 * 1000) /
      1000
    ).toFixed();
    const end = (
      (new Date(presaleInfo.endAt).getTime() -
        new Date(presaleInfo.endAt).getTimezoneOffset() * 60 * 1000) /
      1000
    ).toFixed();

    const presaleTimes = {
      startedAt: start.toString(),
      expiredAt: end.toString(),
      lpLockupDuration: presaleInfo.LPLcokup.toString(),
    };

    if (
      presaleInfo.minBuy === null ||
      presaleInfo.maxBuy === null ||
      presaleInfo.softcap === null
    ) {
      // console.log("Problem");
      return;
    }
    const reqestedTokens = {
      minTokensReq: presaleInfo.minBuy.toString(),
      maxTokensReq: presaleInfo.maxBuy.toString(),
      softCap: presaleInfo.softcap.toString(),
    };

    const contributorsVesting =
      presaleInfo.contributorVesting &&
        presaleInfo.VCFirstReleasePC &&
        presaleInfo.VCEachCycleTime &&
        presaleInfo.VCEachCyclePC
        ? {
          isEnabled: presaleInfo.contributorVesting,
          firstReleasePC: presaleInfo.VCFirstReleasePC,
          vestingPeriodOfEachCycle: presaleInfo.VCEachCycleTime,
          tokensReleaseEachCyclePC: presaleInfo.VCEachCyclePC,
        }
        : {
          isEnabled: presaleInfo.contributorVesting,
          firstReleasePC: 0,
          vestingPeriodOfEachCycle: 0,
          tokensReleaseEachCyclePC: 0,
        };

    const lockedTokens =
      presaleInfo.tokenLocker &&
        presaleInfo.lockedTokens &&
        presaleInfo.lockedTokensReleaseTime
        ? {
          isEnabled: presaleInfo.tokenLocker,
          vestingTokens: presaleInfo.lockedTokens,
          firstReleaseTime: presaleInfo.lockedTokensReleaseTime,
          firstReleasePC: presaleInfo.teamVesting && presaleInfo.TVFirstTokenReleasePC ? presaleInfo.TVFirstTokenReleasePC : 100,
          vestingPeriodOfEachCycle: presaleInfo.teamVesting && presaleInfo.TVEachCycleTime ? presaleInfo.TVEachCycleTime : 0,
          tokensReleaseEachCyclePC: presaleInfo.teamVesting && presaleInfo.TVEachCyclePC ? presaleInfo.TVEachCyclePC : 0,
        }
        : {
          isEnabled: presaleInfo.tokenLocker,
          vestingTokens: 0,
          firstReleaseTime: 0,
          firstReleasePC: 0,
          vestingPeriodOfEachCycle: 0,
          tokensReleaseEachCyclePC: 0,
        };

    const generalInfo = {
      logoURL: presaleGeneralInfo.logoURL ? presaleGeneralInfo.logoURL : "",
      websiteURL: presaleGeneralInfo.websiteURL ? presaleGeneralInfo.websiteURL : "",
      twitterURL: presaleGeneralInfo.TwitterURL ? presaleGeneralInfo.TwitterURL : "",
      telegramURL: presaleGeneralInfo.TelegramURL ? presaleGeneralInfo.TelegramURL : "",
      discordURL: presaleGeneralInfo.DiscordURL ? presaleGeneralInfo.DiscordURL : "",
      description: presaleGeneralInfo.Description ? presaleGeneralInfo.Description : ""
    }


    // console.log("_presaleInfo ", tokenInfo);
    // console.log("participationCriteria ", participationCriteria);
    // console.log("presaleTimes ", presaleTimes);
    // console.log("reqestedTokens ", reqestedTokens);
    // console.log("contributorsVesting ", contributorsVesting);
    // console.log("lockedTokens ", lockedTokens);
    // console.log("generalInfo ", generalInfo);

    try {

      setSubmiting(true);

      const launchTx = launchpadContract.connect(signer);
      const tx = await launchTx.createPresale(
        tokenInfo, participationCriteria, presaleTimes, reqestedTokens, contributorsVesting, lockedTokens, generalInfo,
        { value: fee.toString() }
      );
      const reciept = await tx.wait();

      const presaleAddressByAddress =
        await launchpadContract.getPresaleRecordsByToken(
          presaleTokenInfo.address
        );

      const newPresale = presaleAddressByAddress[presaleAddressByAddress.length - 1];

      navigate(`/presale/${newPresale}?chainID=${networkDetail.id}`, { replace: true,});

      setSubmiting(false);


    } catch (e) {
      console.log(e);
      setSubmiting(false);
      
    }
  };


  let contributorsVestingchedule: Release[] = [];
  const getContributorsSchedule = (
    contributorVesting: boolean,
    VCFirstReleasePC: number | null,
    VCEachCyclePC: number | null,
    VCEachCycleTime: number | null
  ) => {

    if (!presaleInfo.endAt || !contributorVesting || !VCFirstReleasePC || !VCEachCyclePC || !VCEachCycleTime) { return };

    let initialRelease = Number(((new Date(presaleInfo.endAt).getTime() - new Date(presaleInfo.endAt).getTimezoneOffset() * 60 * 1000) / 1000).toFixed());

    const totalTokensPC = 100;

    let firstRelease: Release = {
      cycle: 0,
      releaseTime: Number(initialRelease),
      tokensPC: totalTokensPC,
      percentageToRelease: VCFirstReleasePC,
    };
    contributorsVestingchedule.push(firstRelease);

    const remainingTokensPC = totalTokensPC - VCFirstReleasePC;
    const cycles = totalTokensPC / VCEachCyclePC;

    for (let i = 1; i <= cycles; i++) {
      initialRelease = Number(initialRelease) + VCEachCycleTime * 60;
      let scheduleX: Release = {
        cycle: i,
        releaseTime: Number(initialRelease),
        tokensPC: remainingTokensPC,
        percentageToRelease: VCEachCyclePC,
      };
      contributorsVestingchedule.push(scheduleX);
    }
  };

  let teamVestingSchedule: Release[] = [];
  const getTeamSchedule = (
    tokenLocker: boolean,
    lockedTokens: number | null,
    lockedTokensReleaseTime: number | null,
    teamVesting: boolean,
    TVFirstTokenReleasePC: number | null,
    TVEachCycleTime: number | null,
    TVEachCyclePC?: number | null
  ) => {

    if (!presaleInfo.endAt) { return };

    if (!tokenLocker || !lockedTokens || !lockedTokensReleaseTime) { return };

    let initialRelease =
      lockedTokensReleaseTime * 60 +
      Number(
        (
          (new Date(presaleInfo.endAt).getTime() -
            new Date(presaleInfo.endAt).getTimezoneOffset() * 60 * 1000) /
          1000
        ).toFixed()
      );
    const totalTokensPC = 100;

    let firstRelease: Release = {
      cycle: 0,
      releaseTime: Number(initialRelease),
      tokensPC: lockedTokens,
      percentageToRelease: teamVesting && TVFirstTokenReleasePC ? TVFirstTokenReleasePC : 100,
    }
    teamVestingSchedule.push(firstRelease)

    if (teamVesting && TVFirstTokenReleasePC && TVEachCycleTime && TVEachCyclePC) {

      const remainingTokens = lockedTokens - ((lockedTokens * TVFirstTokenReleasePC) / 100)
      const cycles = totalTokensPC / Number(TVEachCyclePC);

      for (let i = 1; i <= cycles; i++) {
        initialRelease = Number(initialRelease) + TVEachCycleTime * 60;
        let scheduleX: Release = {
          cycle: i,
          releaseTime: Number(initialRelease),
          tokensPC: remainingTokens,
          percentageToRelease: Number(TVEachCyclePC),
        };
        teamVestingSchedule.push(scheduleX);
      }
    }
  };


  getContributorsSchedule(
    presaleInfo.contributorVesting,
    presaleInfo.VCFirstReleasePC,
    presaleInfo.VCEachCyclePC,
    presaleInfo.VCEachCycleTime
  );
  getTeamSchedule(
    presaleInfo.tokenLocker,
    presaleInfo.lockedTokens,
    presaleInfo.lockedTokensReleaseTime,
    presaleInfo.teamVesting,
    presaleInfo.TVFirstTokenReleasePC,
    presaleInfo.TVEachCycleTime,
    presaleInfo.TVEachCyclePC
  );


  // getContributorsSchedule(presaleInfo.contributorVesting, presaleInfo.VCFirstReleasePC, presaleInfo.VCEachCyclePC, presaleInfo.VCEachCycleTime);
  // getTeamSchedule(presaleInfo.tokenLocker, presaleInfo.lockedTokens, presaleInfo.lockedTokensReleaseTime, presaleInfo.teamVesting, presaleInfo.TVFirstTokenReleasePC, presaleInfo.TVEachCycleTime, presaleInfo.TVEachCyclePC)

  // useEffect(() => {
  // }, [])


  // if (presaleInfo.tokenLocker && presaleInfo.lockedTokens && presaleInfo.lockedTokensReleaseTime) {
  // console.log("Trying ")
  // tokenLocker: boolean, lockedTokens: number | null, lockedTokensReleaseTime: number | null, teamVesting:boolean, TVFirstTokenReleasePC: number | null, TVEachCycleTime: number | null, TVEachCyclePC?: number | null
  // }

  let decimalFactor = BigNumber.from(String(10**presaleTokenInfo.decimal)); 

    // console.log("min ", presaleInfo.minBuy)
    // console.log("max ", presaleInfo.maxBuy)

  return (
    <>
      <div className="finish-section flex flex-col">
        <div className="item flex aic">
          <div className="lbl font">Token Name</div>
          <div className={`val font wordwrap`}>{presaleTokenInfo.name}</div>
        </div>
        <div className="item flex aic">
          <div className="lbl font">Token Symbol</div>
          <div className={`val font wordwrap`}>{presaleTokenInfo.symbol}</div>
        </div>
        <div className="item flex aic">
          <div className="lbl font">Decimal</div>
          <div className={`val font wordwrap`}>{presaleTokenInfo.decimal}</div>
        </div>
        <div className="item flex aic">
          <div className="lbl font">Token Address</div>
          <div className={`val font link`}>{presaleTokenInfo.address}</div>
        </div>

        {
          presaleTokenInfo.totalSupply && (
            <div className="item flex aic">
              <div className="lbl font">Total Supply</div>
              <div className={`val font wordwrap`}>
                {(presaleTokenInfo.totalSupply.div(decimalFactor)).toString()}
              </div>
            </div>
          )
        }

        {presaleInfo.typeOfPresale === SaleType.PUBLIC ? (
          <div className="item flex aic">
            <div className="lbl font">Type of Sale</div>
            <div className={`val font wordwrap`}>{`PUBLIC`}</div>
          </div>
        ) : presaleInfo.typeOfPresale === SaleType.WHITELISTED ? (
          <div className="item flex aic">
            <div className="lbl font">Type of Sale</div>
            <div className={`val font wordwrap`}>{`WHITELISTED`}</div>
          </div>
        ) : presaleInfo.typeOfPresale === SaleType.TOKENHOLDERS ? (
          <>
            <div className="item flex aic">
              <div className="lbl font">Type of Sale</div>
              <div className={`val font wordwrap`}>{`TOKENHOLDERS`}</div>
            </div>
            <div className="item flex aic">
              <div className="lbl font">Criteria Token address</div>
              <div
                className={`val font link`}
              >{`${presaleInfo.criteriaToken}`}</div>
            </div>
            <div className="item flex aic">
              <div className="lbl font">Minimum tokens for participation</div>
              <div
                className={`val font wordwrap`}
              >{`${presaleInfo.minCriteriaTokens}`}</div>
            </div>
          </>
        ) : null}

        <div className="item flex aic">
          <div className="lbl font">Tokens For Presale</div>
          <div
            className={`val font wordwrap`}
          >{`${presaleInfo.tokensForSale} ${presaleTokenInfo.symbol}`}</div>
        </div>

        {presaleInfo.liquidity && (
          <div className="item flex aic">
            <div className="lbl font">Liquidity</div>
            <div
              className={`val font wordwrap`}
            >{`${presaleInfo.liquidity}%`}</div>
          </div>
        )}

        {presaleInfo.tokensForSale && presaleInfo.liquidity && (
          <div className="item flex aic">
            <div className="lbl font">Tokens For Liquidity</div>
            <div className={`val font wordwrap`}>{`${(presaleInfo.tokensForSale * presaleInfo.liquidity) / 100
              } ${presaleTokenInfo.symbol}`}</div>
          </div>
        )}

        {presaleInfo.priceOfEach && (
          <div className="item flex aic">
            <div className="lbl font">{`Price of each ${presaleTokenInfo.symbol}`}</div>
            <div className={`val font wordwrap`}>
              {`${presaleInfo.priceOfEach.toString()} BNB`}{" "}
            </div>
          </div>
        )}

        {presaleInfo.priceOfEach && (
          <div className="item flex aic">
            <div className="lbl font">Presale Rate</div>
            <div className={`val font wordwrap`}>
              {`1BNB = ${1 / presaleInfo.priceOfEach} ${presaleTokenInfo.symbol
                }`}{" "}
            </div>
          </div>
        )}
        <div className="item flex aic">
          <div className="lbl font">Soft Cap</div>
          <div
            className={`val font wordwrap`}
          >{`${presaleInfo.softcap} ${presaleTokenInfo.symbol}`}</div>
        </div>

        {
          presaleInfo.minBuy && presaleInfo.priceOfEach && (
            <div className="item flex aic">
              <div className="lbl font">Minimum buy</div>
              <div
                className={`val font wordwrap`}
              >{`${presaleInfo.minBuy * presaleInfo.priceOfEach} BNB`}</div>
            </div>
          )
        }

        {
          presaleInfo.maxBuy && presaleInfo.priceOfEach && (
            <div className="item flex aic">
              <div className="lbl font">Maximum buy</div>
              <div
                className={`val font wordwrap`}
                >{`${presaleInfo.maxBuy * presaleInfo.priceOfEach} BNB`}</div>
              </div>
          )
        }

        <div className="item flex aic">
          <div className="lbl font">Unsold Tokens</div>
          <div className={`val font wordwrap`}>
            {presaleInfo.refundType === RefundType.BURN ? "BURN" : "REFUND"}
          </div>
        </div>

        {presaleInfo.startAt && (
          <div className="item flex aic">
            <div className="lbl font">Presale Start Time</div>
            <div className={`val font wordwrap`}>
              {`${presaleInfo.startAt.slice(
                0,
                10
              )}  ${presaleInfo.startAt.slice(11, 19)} UTC`}{" "}
            </div>
          </div>
        )}

        {presaleInfo.endAt && (
          <div className="item flex aic">
            <div className="lbl font">Presale End Time</div>
            <div className={`val font wordwrap`}>
              {
                `${presaleInfo.endAt.slice(0, 10)}  ${presaleInfo.endAt.slice(
                  11,
                  19
                )} UTC`
                // `${new Date(presaleInfo.endAt).toISOString().slice(0, 10)}  ${new Date(presaleInfo.endAt).toISOString().slice(11, 19)} UTC`
              }
            </div>
          </div>
        )}

        <div className="item flex aic">
          <div className="lbl font">Listing on</div>
          <div className={`val font wordwrap`}>PancakeSwap</div>
        </div>

        <div className="item flex aic">
          <div className="lbl font">Liquidity Lockup Time</div>
          <div
            className={`val font wordwrap`}
          >{`${presaleInfo.LPLcokup} minutes`}</div>
        </div>

        {presaleInfo.contributorVesting && (
          <>
            <div className="item flex aic">
              <div className="lbl font">Contributors Vesting</div>
              <div className={`val font wordwrap`}>ENABLED</div>
            </div>
            <div className="item flex aic">
              <div className="lbl font">First release for presale</div>
              <div
                className={`val font wordwrap`}
              >{`${presaleInfo.VCFirstReleasePC}%`}</div>
            </div>
            <div className="item flex aic">
              <div className="lbl font">Vesting period cycle duratoin </div>
              <div
                className={`val font wordwrap`}
              >{`${presaleInfo.VCEachCycleTime} minutes`}</div>
            </div>
            <div className="item flex aic">
              <div className="lbl font">Presale token release each cycle</div>
              <div
                className={`val font wordwrap`}
              >{`${presaleInfo.VCFirstReleasePC}%`}</div>
            </div>
          </>
        )}

        {presaleInfo.tokenLocker && (
          <>
            <div className="item flex aic">
              <div className="lbl font">Locked Tokens</div>
              <div className={`val font wordwrap`}>ENABLED</div>
            </div>
            <div className="item flex aic">
              <div className="lbl font">Total Locked Tokens</div>
              <div
                className={`val font wordwrap`}
              >{`${presaleInfo.lockedTokens} ${presaleTokenInfo.symbol}`}</div>
            </div>
            <div className="item flex aic">
              <div className="lbl font">Release delay after listing</div>
              <div
                className={`val font wordwrap`}
              >{`${presaleInfo.lockedTokensReleaseTime} minutes`}</div>
            </div>

            {presaleInfo.teamVesting && (
              <>
                <div className="item flex aic">
                  <div className="lbl font">First token release</div>
                  <div
                    className={`val font wordwrap`}
                  >{`${presaleInfo.TVFirstTokenReleasePC} %`}</div>
                </div>

                {presaleInfo.TVEachCycleTime && (
                  <div className="item flex aic">
                    <div className="lbl font">Vesting period each cycle</div>
                    <div
                      className={`val font wordwrap`}
                    >{`${presaleInfo.TVEachCycleTime} minutes`}</div>
                  </div>
                )}

                {presaleInfo.TVEachCyclePC && (
                  <div className="item flex aic">
                    <div className="lbl font">
                      Team token release each cycle
                    </div>
                    <div
                      className={`val font wordwrap`}
                    >{`${presaleInfo.TVEachCyclePC} %`}</div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {presaleInfo.contributorVesting && (
          <SettingCard title="Contributors token release schedule">
            <div className="vesting-table">
              <div className="table-hdr">
                <div className="col">
                  <div className="tit font">Unlock #</div>
                </div>
                <div className="col">
                  <div className="tit font">Time (UTC)</div>
                </div>
                <div className="col">
                  <div className="tit font">Unlocked tokens</div>
                </div>
              </div>

              <div className="table-list">
                {contributorsVestingchedule.length > 0 &&
                  contributorsVestingchedule.map((item) => (
                    <div key={item.cycle} className="table-row">
                      <div className="col">
                        <div className="txt font">{item.cycle + 1}</div>
                      </div>
                      <div className="col">
                        <div className="txt font">{`${new Date(
                          item.releaseTime * 1000
                        )
                          .toISOString()
                          .slice(0, 10)}  ${new Date(item.releaseTime * 1000)
                            .toISOString()
                            .slice(11, 19)}`}</div>
                      </div>
                      {
                        <div className="col">
                          <div className="txt font">{`${item.percentageToRelease} % `}</div>
                        </div>
                      }
                    </div>
                  ))}
              </div>
            </div>
          </SettingCard>
        )}

        {presaleInfo.teamVesting && (
          <SettingCard title="Locked tokens release schedule">
            <div className="vesting-table">
              <div className="table-hdr">
                <div className="col">
                  <div className="tit font">Lock #</div>
                </div>
                <div className="col">
                  <div className="tit font">Time (UTC)</div>
                </div>
                <div className="col">
                  <div className="tit font">Locked tokens</div>
                </div>
              </div>
              <div className="table-list">
                {teamVestingSchedule.length > 0 &&
                  teamVestingSchedule.map((item) => (
                    <div key={item.cycle} className="table-row">
                      <div className="col">
                        <div className="txt font">{item.cycle + 1}</div>
                      </div>
                      <div className="col">
                        <div className="txt font">{`${new Date(
                          item.releaseTime * 1000
                        )
                          .toISOString()
                          .slice(0, 10)}  ${new Date(item.releaseTime * 1000)
                            .toISOString()
                            .slice(11, 19)}`}</div>
                      </div>
                      <div className="col">
                        <div className="txt font">{`${(
                          (item.percentageToRelease * item.tokensPC) /
                          100
                        ).toFixed(2)} ${presaleTokenInfo.symbol}`}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </SettingCard>
        )}

        <div className="ftr">
          <div className="actions flex aic">
            <button className="btn back font" onClick={handleBackStep}>
              Back
            </button>
            <button className="btn next font" onClick={handleSubmit}>
                    Submit
            </button>
          </div>
        </div>
      </div>
      <div className="ftr-description">
        <div className="txt font">
          Disclaimer: The information provided shall not in any way constitute a
          recommendation as to whether you should invest in any product
          discussed. We accept no liability for any loss occasioned to any
          person acting or refraining from action as a result of any material
          provided or published.
        </div>
      </div>
    </>
  );
};

export default Finish;

interface settingCardProps {
  title?: string;
  children?: JSX.Element[] | JSX.Element;
}

const SettingCard = (props: settingCardProps): JSX.Element => {
  const { children, title } = props;
  const [openSetting, setOpenSetting] = useState(false);

  return (
    <div className="setting-card">
      <div className="hdr flex aic">
        <div className="title font s15 c000">{title}</div>
        <button
          className="cleanbtn open-btn"
          onClick={() => setOpenSetting(!openSetting)}
        >
          {openSetting ? <ArrowUpIcon /> : <ArrowDownIcon />}
          { }
        </button>
      </div>
      <div className={`form flex flex-col anim ${openSetting ? "sho" : "hid"}`}>
        {children}
      </div>
    </div>
  );
};
