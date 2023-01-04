import React, { useState } from "react";
import { CalenderIcon, CheckIcon } from "../../assets/icons";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  setPresaleInfo,
  PresaleInfo,
  SaleType,
  DataType,
  RefundType,
  getCurrentTimeStamp,
} from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { BigNumber } from "ethers";
// import { equal } from "assert";

// const zeroAddress = "0x0000000000000000000000000000000000000000";

interface LaunchpadInfoProps {
  handleNextStep?: any;
  handleBackStep?: any;
}

const LaunchpadInfo = ({
  handleNextStep,
  handleBackStep,
}: LaunchpadInfoProps): JSX.Element => {
  
  const today = () => {
    return new Date().toISOString().slice(0, 19);
  };

  const { presaleInfo, presaleTokenInfo } = useSelector( (state: DataType) => state );
  const [saleType, setSaleType] = useState<SaleType>(presaleInfo.typeOfPresale);
  const [refund, setRefund] = useState<RefundType>(RefundType.BURN);

  const dispatch = useDispatch();

  const handleRefund = (e: "BURN"|"REFUND") => {

    // console.log("handleRefund", e);

    if (e === "BURN") {
      setRefund(RefundType.BURN);
    } else {
      setRefund(RefundType.REFUND);
    }

  };

  const handleContributorsVesting = (
    contributorVesting: boolean,
    setFieldValue: any
  ) => {
    if (contributorVesting === false) {
      // setContributorVesting(true)
      setFieldValue("contributorVesting", true);
    } else {
      // setContributorVesting(false)
      setFieldValue("contributorVesting", false);
      setFieldValue("VCFirstReleasePC", null);
      setFieldValue("VCEachCyclePC", null);
      setFieldValue("VCEachCycleTime", null);
    }
  };

  const handleTokenLocker = (tokenLocker: boolean, setFieldValue: any) => {
    // console.log("tokenLocker ", tokenLocker)
    if (tokenLocker === false) {
      // setTokenLocker(true)
      setFieldValue("tokenLocker", true);
    } else {
      // setTokenLocker(false)
      // setTeamVesting(false)
      setFieldValue("tokenLocker", false);
      setFieldValue("teamVesting", false);
      setFieldValue("TeamVestingTokens", null);
      setFieldValue("TVFirstTokenReleaseTime", null);
      setFieldValue("TVFirstTokenReleasePC", null);
      setFieldValue("TVEachCycleTime", null);
      setFieldValue("TVEachCyclePC", null);
    }
  };

  const handleTeamVesting = (teamVesting: boolean, setFieldValue: any) => {
    if (teamVesting === false) {
      // setTeamVesting(true)
      setFieldValue("teamVesting", true);
    } else {
      // setTeamVesting(false)
      setFieldValue("teamVesting", false);
      setFieldValue("TeamVestingTokens", null);
      setFieldValue("TVFirstTokenReleaseTime", null);
      setFieldValue("TVFirstTokenReleasePC", null);
      setFieldValue("TVEachCycleTime", null);
      setFieldValue("TVEachCyclePC", null);
    }
  };

  const handleSaletype = (saleType: SaleType, setFieldValue: any) => {
    if (saleType === SaleType.TOKENHOLDERS) {
      setSaleType(saleType);
      setFieldValue("tokenHolderSale", true);
    } else {
      setSaleType(saleType);
      setFieldValue("tokenHolderSale", false);
      setFieldValue("criteriaToken", null);
      setFieldValue("minCriteriaTokens", null);
    }
  };

  const tokenRequired = (tokensForSale: number | null, liquidity: number | null, lockedTokens: number | null)  => {

    const tokens =  tokensForSale && liquidity && lockedTokens ? tokensForSale + (liquidity * tokensForSale) / 100 +  lockedTokens
    : tokensForSale && liquidity ? tokensForSale + (liquidity * tokensForSale) / 100 : tokensForSale ? tokensForSale : 0
  
    return tokens;

  }


  const SignupSchema = Yup.object().shape({
    tokensForSale: Yup.number()
      .nullable()
      .moreThan(0, "Should be more than zero!")
      .required("Required"),
    softcap: Yup.number()
      .nullable()
      .moreThan(0, "Should be more than zero!")
      .required("Required")
      .when(["tokensForSale"], (tokensForSale, schema) => {
        return schema
          .min( tokensForSale/2, "Softcap must be more than 50% of Hardcap")
          .max(tokensForSale * 0.9, "Softcap must less then 90% of Hardcap");
      }),
    maxBuy: Yup.number()
      .nullable()
      .moreThan(0, "Should be more than zero")
      .required("Required"),
    minBuy: Yup.number()
      .nullable()
      .moreThan(0, "Should be more than zero")
      .required("Required"),
    priceOfEach: Yup.number().nullable().required("Required"),
    liquidity: Yup.number()
      .nullable()
      .moreThan(50, "Should be more than 50%")
      .lessThan(95, "Should be less than 95%")
      .required("Required"),
    startAt: Yup.date().min(today()).required("Required"),
    endAt: Yup.date().min(today()).required("Required"),
    LPLcokup: Yup.number()
      .nullable()
      .min(5, "Should be at leaste 5 minutes")
      .required("Required"),
    tokenHolderSale: Yup.boolean(),
    criteriaToken: Yup.string()
      .nullable()
      .when("tokenHolderSale", {
        is: true,
        then: Yup.string().nullable().required("Required"),
      }),
    minCriteriaTokens: Yup.number()
      .nullable()
      .when("tokenHolderSale", {
        is: true,
        then: Yup.number().nullable().required("Required"),
      }),
    VCFirstReleasePC: Yup.number()
      .nullable()
      .when("contributorVesting", {
        is: true,
        then: Yup.number()
          .nullable()
          .moreThan(0, "Should be more than zero")
          .required("Required"),
      }),
    VCEachCyclePC: Yup.number()
      .nullable()
      .when("contributorVesting", {
        is: true,
        then: Yup.number()
          .nullable()
          .moreThan(0, "Should be more than zero")
          .required("Required"),
      }),
    VCEachCycleTime: Yup.number()
      .nullable()
      .when("contributorVesting", {
        is: true,
        then: Yup.number()
          .nullable()
          .moreThan(0, "Should be more than zero")
          .required("Required"),
      }),
    tokenLocker: Yup.boolean(),
    lockedTokens: Yup.number()
      .nullable()
      .when("tokenLocker", {
        is: true,
        then: Yup.number().min(1, "Should be more than 1").required("Required"),
      }),
    lockedTokensReleaseTime: Yup.number()
      .nullable()
      .when("tokenLocker", {
        is: true,
        then: Yup.number().min(1, "Should be more than 1").required("Required"),
      }),

    teamVesting: Yup.boolean(),
    TVFirstTokenReleasePC: Yup.number()
      .nullable()
      .when("teamVesting", {
        is: true,
        then: Yup.number().min(1, "Should be more than 1").lessThan(100, "Should be less than 100%").required("Required"),
      }),
    TVEachCycleTime: Yup.number()
      .nullable()
      .when("teamVesting", {
        is: true,
        then: Yup.number().min(1, "Should be more than 1"),
      }),
    TVEachCyclePC: Yup.number()
      .nullable()
      .when("teamVesting", {
        is: true,
        then: Yup.number().min(1, "Should be more than 1"),
      }),
  });

  
  
  const showTokenMessage = (values: any) => {
    
    let decimalFactor = BigNumber.from(String(10**presaleTokenInfo.decimal)); 
    
    const tokensRequired = tokenRequired(values.tokensForSale, values.liquidity, values.lockedTokens) > 0 ? tokenRequired(values.tokensForSale, values.liquidity, values.lockedTokens) : null
    
    // const yourBalance = Number(presaleTokenInfo.youhold);
    const yourBalance = Number(presaleTokenInfo.youhold.div(decimalFactor));

    const symbol = presaleTokenInfo.symbol;

    // return `Need ${<span style={{color: "red"}}> { tokensRequired }</span>} ${symbol} tokens to create presale (Your Balance: ${yourBalance} ${symbol})`

    if(!tokensRequired) {
      return `Need  ${symbol} tokens to create presale (Your Balance: ${yourBalance} ${symbol})`
    }
    else if(tokensRequired && tokensRequired <= yourBalance ){
      return  <span style={{color: "green"}}> { `Need ${tokensRequired} ${symbol} tokens to create presale (Your Balance: ${yourBalance} ${symbol})` }</span>
    }
    else if(tokensRequired && tokensRequired > yourBalance){
      return  <span style={{color: "red"}}> { `Need ${tokensRequired} ${symbol} tokens to create presale (Your Balance: ${yourBalance} ${symbol})` }</span>
    }

  }


  return (
    <div className="launchpad-info-section">
      <Formik
        initialValues={{
          tokensForSale: presaleInfo.tokensForSale,
          tokenHolderSale: presaleInfo.tokenHolderSale,
          criteriaToken: presaleInfo.criteriaToken,
          minCriteriaTokens: presaleInfo.minCriteriaTokens,
          priceOfEach: presaleInfo.priceOfEach,
          softcap: presaleInfo.softcap,
          maxBuy: presaleInfo.maxBuy,
          minBuy: presaleInfo.minBuy,
          liquidity: presaleInfo.liquidity,
          startAt: today(),
          endAt: today(),
          LPLcokup: presaleInfo.LPLcokup,
          contributorVesting: presaleInfo?.contributorVesting,
          VCFirstReleasePC: presaleInfo?.VCFirstReleasePC,
          VCEachCyclePC: presaleInfo?.VCEachCyclePC,
          VCEachCycleTime: presaleInfo?.VCEachCycleTime,
          tokenLocker: presaleInfo?.tokenLocker,
          lockedTokens: presaleInfo?.lockedTokens,
          lockedTokensReleaseTime: presaleInfo?.lockedTokensReleaseTime,
          teamVesting: presaleInfo?.teamVesting,
          TVFirstTokenReleasePC: presaleInfo?.TVFirstTokenReleasePC,
          TVEachCycleTime: presaleInfo?.TVEachCycleTime,
          TVEachCyclePC: presaleInfo?.TVEachCyclePC,
        }}
        validationSchema={SignupSchema}
        onSubmit={(values) => {
          // console.log("values ", values)
          // console.log("teamVesting ", teamVesting)

          const CV =
            values.contributorVesting &&
              values.VCFirstReleasePC &&
              values.VCEachCyclePC &&
              values.VCEachCycleTime
              ? {
                contributorVesting: values.contributorVesting,
                VCFirstReleasePC: values.VCFirstReleasePC,
                VCEachCyclePC: values.VCEachCyclePC,
                VCEachCycleTime: values.VCEachCycleTime,
              }
              : {
                contributorVesting: false,
                VCFirstReleasePC: null,
                VCEachCyclePC: null,
                VCEachCycleTime: null,
              };

          const TokenLocker =
            values.tokenLocker &&
              values.lockedTokens &&
              values.lockedTokensReleaseTime
              ? {
                tokenLocker: values.tokenLocker,
                lockedTokens: values.lockedTokens,
                lockedTokensReleaseTime: values.lockedTokensReleaseTime,
              }
              : {
                tokenLocker: false,
                lockedTokens: null,
                lockedTokensReleaseTime: null,
              };

          const TV =
            values.teamVesting && values.TVEachCycleTime && values.TVEachCyclePC
              ? {
                teamVesting: values.teamVesting,
                TVFirstTokenReleasePC: values.TVFirstTokenReleasePC,
                TVEachCycleTime: values.TVEachCycleTime,
                TVEachCyclePC: values.TVEachCyclePC,
              }
              : {
                teamVesting: false,
                TVFirstTokenReleasePC: null,
                TVEachCycleTime: null,
                TVEachCyclePC: null,
              };

          const type =
            saleType === SaleType.TOKENHOLDERS &&
              values.criteriaToken &&
              values.minCriteriaTokens
              ? {
                typeOfPresale: saleType,
                tokenHolderSale: true,
                criteriaToken: values.criteriaToken,
                minCriteriaTokens: values.minCriteriaTokens,
                priceOfEach: values.priceOfEach,
              }
              : {
                typeOfPresale: saleType,
                tokenHolderSale: false,
                criteriaToken: null,
                minCriteriaTokens: null,
                priceOfEach: values.priceOfEach,
              };

          if (
            !values.tokensForSale ||
            !values.softcap ||
            !values.maxBuy ||
            !values.minBuy ||
            !values.liquidity ||
            !values.LPLcokup
          ) {
            alert("Please fill all fields");
            return;
          }


          // values.startAt, values.endAt,
          // console.log("xxxx ", new Date(values.startAt).getTime())
          // console.log("xxxx ", new Date(values.endAt).getTime())

          if(new Date(values.startAt).getTime() >= new Date(values.endAt).getTime()){
            alert("Ending time should be more than starting time")
            throw("ERROR");
          }


          const saleInfo = {
            tokensForSale: values.tokensForSale,
            ...type,
            softcap: values?.softcap,
            maxBuy: values?.maxBuy,
            minBuy: values?.minBuy,
            refundType: refund,
            liquidity: values?.liquidity,
            startAt: values.startAt,
            endAt: values.endAt,
            LPLcokup: values?.LPLcokup,
          };

          const presaleInfo: PresaleInfo = {
            ...saleInfo,
            ...CV,
            ...TokenLocker,
            ...TV,
          };

          dispatch(setPresaleInfo(presaleInfo));
          handleNextStep();
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className="info-msg font s14 color">(*) required field.</div>

            <div className="field-blk">
              <div className="label font">
                Tokens For sale <span className="star">*</span>
              </div>
              <div className="filed">
                <Field
                  name="tokensForSale"
                  type="number"
                  className="iput font"
                // value={presaleInfo?.tokensForSale}
                />
              </div>
              <div className="field-msg font red">
                <ErrorMessage name="tokensForSale" />
              </div>
              <div className="field-msg font blue">
                How many tokens you want to put on presale?
              </div>
            </div>

            <div className="field-blk">
              <div className="label font types-lbl">Type of Sale</div>
              <div className="row">
                <div
                  className="item"
                  onClick={() => handleSaletype(SaleType.PUBLIC, setFieldValue)}
                >
                  <div
                    className={`checkbox ${saleType === SaleType.PUBLIC ? "active" : ""
                      }`}
                  />
                  <div className="lbl font">Public</div>
                </div>

                <div
                  className="item"
                  onClick={() =>
                    handleSaletype(SaleType.WHITELISTED, setFieldValue)
                  }
                >
                  <div
                    className={`checkbox ${saleType === SaleType.WHITELISTED ? "active" : ""
                      }`}
                  />
                  <div className="lbl font">WhiteListed</div>
                </div>

                <div
                  className="item"
                  onClick={() =>
                    handleSaletype(SaleType.TOKENHOLDERS, setFieldValue)
                  }
                >
                  <div
                    className={`checkbox ${saleType === SaleType.TOKENHOLDERS ? "active" : ""
                      }`}
                  />
                  <div className="lbl font">Token Holders</div>
                </div>
              </div>
              <div className="field-msg font blue">
                You can change the type of sale at anytime during sale
              </div>
            </div>

            <div className="sale-types-blk">
              {saleType === SaleType.TOKENHOLDERS && (
                <div className="grid-section">
                  <div className="field-blk">
                    <div className="label font">Criteria Token address</div>
                    <div className="filed">
                      <Field
                        name="criteriaToken"
                        type="text"
                        className="iput font"
                      // value={presaleInfo?.criteriaToken}
                      />
                    </div>
                    <div className="field-msg font red">
                      <ErrorMessage name="criteriaToken" />
                    </div>
                  </div>

                  <div className="field-blk">
                    <div className="label font">
                      Minimum tokens for participation (e.g. 500 Tokens)
                    </div>
                    <div className="filed">
                      <Field
                        name="minCriteriaTokens"
                        type="number"
                        className="iput font"
                      // value={presaleInfo?.minCriteriaTokens}
                      />
                    </div>
                    <div className="field-msg font red">
                      <ErrorMessage name="minCriteriaTokens" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid-section">
              <div className="field-blk">
                <div className="label font">
                  Price of Each token (BNB) <span className="star">*</span>
                </div>
                <div className="filed">
                  <Field
                    name="priceOfEach"
                    type="number"
                    placeholder="Ex: 0.0001"
                    className="iput font"
                    step="0.0000000001"
                  />
                </div>
              </div>

              <div className="field-blk">
                <div className="label font">
                  Softcap (Tokens) <span className="star">*</span>
                </div>
                <div className="filed">
                  <Field name="softcap" type="number" className="iput font" />
                </div>
                <div className="field-msg font red">
                  <ErrorMessage name="softcap" />
                </div>
              </div>

              <div className="field-blk">
                <div className="label font">
                  {`Minimum token request (${presaleTokenInfo.symbol
                    }) | Minimum buy: ${values.priceOfEach && values.minBuy
                      ? `${(values.priceOfEach * values.minBuy).toFixed(
                        5
                      )} BNBs`
                      : "0 BNB"
                    } `}{" "}
                  <span className="star">*</span>
                </div>
                <div className="filed">
                  <Field
                    name="minBuy"
                    type="number"
                    className="iput font"
                    placeholder={`Ex: 10 ${presaleTokenInfo.symbol}`}
                  />
                </div>
                <div className="field-msg font red">
                  <ErrorMessage name="minBuy" />
                </div>
              </div>

              <div className="field-blk">
                <div className="label font">
                  {/* {`Maximum token request (${presaleTokenInfo.symbol})`} <span className="star">*</span> */}
                  {`Maximum token request (${presaleTokenInfo.symbol
                    }) | Maximum buy: ${values.priceOfEach && values.maxBuy
                      ? `${(values.priceOfEach * values.maxBuy).toFixed(
                        5
                      )} BNBs`
                      : "0 BNB"
                    } `}{" "}
                  <span className="star">*</span>
                </div>
                <div className="filed">
                  <Field
                    name="maxBuy"
                    type="number"
                    className="iput font"
                  // value={presaleInfo?.maxBuy}
                  />
                </div>
                <div className="field-msg font red">
                  <ErrorMessage name="maxBuy" />
                </div>
              </div>

              <div className="field-blk">
                <div className="label font">Refund type</div>
                <div className="filed">
                  <select className="iput" onChange={(e) => handleRefund(e.target.value as "BURN"|"REFUND")}>

                    <option value="BURN"> Burn </option>
                    <option value="REFUND"> Refund </option>
                  
                  </select>
                </div>
              </div>

              <div className="field-blk">
                <div className="label font">
                  Router <span className="star">*</span>
                </div>
                <div className="filed">
                  <select name="pancakeswap" className="iput">
                    <option value="">PancakeSwap</option>
                  </select>
                </div>
              </div>

              <div className="field-blk">
                <div className="label font">
                  liquidity (%) <span className="star">*</span>
                </div>
                <div className="filed">
                  <Field
                    name="liquidity"
                    type="number"
                    className="iput font"
                    placeholder="Ex: 70%"
                  // value={presaleInfo?.liquidity}
                  />
                </div>
                <div className="field-msg font red">
                  <ErrorMessage name="liquidity" />
                </div>
              </div>
            </div>

            {/* utc section */}
            <div className="utc-section">
              <div className="meta flex flex-col">
                {/* <div className="txt font">
                  Enter the percentage of raised funds that should be allocated to
                  Liquidly on (Min 51%, Max 98%)
                </div> */}
                {/* <div className="txt font">
            If I spend 1 RNR on how many tokens will I receive? Usually this
            amount is lower than presale rate to allow for a higher listing
            price on
          </div> */}
              </div>

              <div className="utc-title">
                Select start time & end time (UTC)*
              </div>
              <div className="grid-section">
                <div className="field-blk">
                  <div className="label font">
                    Start time (UTC) <span className="star">*</span>
                  </div>
                  <div className="filed">
                    <Field
                      name="startAt"
                      className="iput font"
                      type="datetime-local"
                      step="any"
                      min={today()}
                    />
                    {/* <div className="icon">*
                          <CalenderIcon />
                        </div> */}
                  </div>
                  <div className="field-msg font red">
                    <ErrorMessage name="startAt" />
                  </div>
                </div>

                <div className="field-blk">
                  <div className="label font">
                    End time (UTC) <span className="star">*</span>
                  </div>
                  <div className="filed">
                    <Field
                      name="endAt"
                      className="iput font"
                      type="datetime-local"
                      step="any"
                      min={today()}
                    />
                    {/* <div className="icon">
                          <CalenderIcon />
                        </div> */}
                  </div>
                  <div className="field-msg font red">
                    <ErrorMessage name="startAt" />
                  </div>
                </div>
              </div>

              <div className="field-blk">
                <div className="label font">
                  Liquidity lockup (minutes) <span className="star">*</span>
                </div>
                <div className="filed">
                  <Field
                    name="LPLcokup"
                    type="number"
                    className="iput font"
                    placeholder="Enter (minutes) Ex: 5"
                  // value={presaleInfo?.LPLcokup}
                  />
                </div>
                <div className="field-msg font red">
                  <ErrorMessage name="LPLcokup" />
                </div>
              </div>

              <div className="field-blk">
                <div className="row col">
                  <div
                    className="item"
                    onClick={() =>
                      handleContributorsVesting(
                        values.contributorVesting,
                        setFieldValue
                      )
                    }
                  >
                    <div
                      className={`checkbox ${values.contributorVesting ? "active" : ""
                        }`}
                    >
                      <div className="icon">
                        <CheckIcon />
                      </div>
                    </div>
                    <div className="lbl font">Use contributors vesting</div>
                  </div>
                </div>
              </div>

              {values.contributorVesting && (
                <div className="vesting-blk">
                  <div className="field-blk">
                    <div className="label font">
                      First release for presale (percent)
                      <span className="star">*</span>
                    </div>
                    <div className="filed">
                      <Field
                        name="VCFirstReleasePC"
                        type="number"
                        className="iput font"
                        placeholder="Ex: 20%"
                      />
                    </div>
                    <div className="field-msg font red">
                      <ErrorMessage name="VCFirstReleasePC" />
                    </div>
                  </div>

                  <div className="grid-section">
                    <div className="field-blk">
                      <div className="label font">
                        Vesting period each cycle (minutes)
                        <span className="star">*</span>
                      </div>
                      <div className="filed">
                        <Field
                          name="VCEachCycleTime"
                          type="number"
                          placeholder="Enter (minutes) Ex: 5"
                          className="iput font"
                        />
                      </div>
                      <div className="field-msg font red">
                        <ErrorMessage name="VCEachCycleTime" />
                      </div>
                    </div>

                    <div className="field-blk">
                      <div className="label font">
                        Presale token release each cycle (percent)
                        <span className="star">*</span>
                      </div>
                      <div className="filed">
                        <Field
                          name="VCEachCyclePC"
                          type="number"
                          placeholder="Ex: 20%"
                          className="iput font"
                        // value={presaleInfo?.VCEachCyclePC}
                        />
                      </div>
                      <div className="field-msg font red">
                        <ErrorMessage name="VCEachCyclePC" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="field-blk">
                <div className="row col">
                  <div
                    className="item"
                    onClick={() =>
                      handleTokenLocker(values.tokenLocker, setFieldValue)
                    }
                  >
                    <div
                      className={`checkbox ${values.tokenLocker ? "active" : ""
                        }`}
                    >
                      <div className="icon">
                        <CheckIcon />
                      </div>
                    </div>
                    <div className="lbl font"> Token Locker </div>
                  </div>
                </div>
              </div>

              {values.tokenLocker && (
                <div className="vesting-blk">
                  <div className="grid-section">
                    <div className="field-blk">
                      <div className="label font">
                        Total team vesting tokens{" "}
                        <span className="star">*</span>
                      </div>
                      <div className="filed">
                        <Field
                          name="lockedTokens"
                          type="number"
                          className="iput font"
                          placeholder="Enter no. of tokens Ex: 1000000"
                        />
                      </div>
                      <div className="field-msg font red">
                        <ErrorMessage name="lockedTokens" />
                      </div>
                    </div>
                    <div className="field-blk">
                      <div className="label font">
                        Token release after listing (minutes){" "}
                        <span className="star">*</span>
                      </div>
                      <div className="filed">
                        <Field
                          name="lockedTokensReleaseTime"
                          className="iput font"
                          type="number"
                          placeholder="Enter (minutes) Ex: 5"
                        />
                      </div>
                      <div className="field-msg font red">
                        <ErrorMessage name="lockedTokensReleaseTime" />
                      </div>
                    </div>
                  </div>

                  <div className="field-blk">
                    <div className="row col">
                      <div
                        className="item"
                        onClick={() =>
                          handleTeamVesting(values.teamVesting, setFieldValue)
                        }
                      >
                        <div
                          className={`checkbox ${values.teamVesting ? "active" : ""
                            }`}
                        >
                          <div className="icon">
                            <CheckIcon />
                          </div>
                        </div>
                        <div className="lbl font"> Locker Vesting </div>
                      </div>
                    </div>
                  </div>

                  {values.teamVesting && (
                    <>
                      <div className="field-blk">
                        <div className="label font">
                          First token release (percent){" "}
                          <span className="star">*</span>
                        </div>
                        <div className="filed">
                          <Field
                            name="TVFirstTokenReleasePC"
                            className="iput font"
                            type="number"
                            placeholder="Ex: 20%"
                          />
                        </div>
                        <div className="field-msg font red">
                          <ErrorMessage name="TVFirstTokenReleasePC" />
                        </div>
                      </div>

                      <div className="grid-section">
                        <div className="field-blk">
                          <div className="label font">
                            Vesting period each cycle (minutes)
                            <span className="star">*</span>
                          </div>
                          <div className="filed">
                            <Field
                              name="TVEachCycleTime"
                              className="iput font"
                              type="number"
                              placeholder="Enter (minutes) Ex: 5"
                            />
                          </div>
                          <div className="field-msg font red">
                            <ErrorMessage name="TVEachCycleTime" />
                          </div>
                        </div>

                        <div className="field-blk">
                          <div className="label font">
                            Team token release each cycle (percent){" "}
                            <span className="star">*</span>
                          </div>
                          <div className="filed">
                            <Field
                              name="TVEachCyclePC"
                              className="iput font"
                              placeholder="Ex: 20%"
                            />
                          </div>
                          <div className="field-msg font red">
                            <ErrorMessage name="TVEachCyclePC" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="ftr">
              {/* <div className="txt font">Need {tokensCount.forSale + tokensCount.forLiquidity + tokensCount.forTeamVesting } tokens to create launchpad.</div> */}
              <div className="txt font">
                {showTokenMessage(values)}
                {/* Need{" "}
                { tokenRequired(values.tokensForSale, values.liquidity , values.lockedTokens) > 0 ? tokenRequired(values.tokensForSale, values.liquidity , values.lockedTokens) : null }
                {" "}{presaleTokenInfo.symbol} {" "} tokens to create presale {" "}(Your Balance: {" "}{Number(presaleTokenInfo.youhold)}{" "}{presaleTokenInfo.symbol}) */}
              </div>

              <div className="actions flex aic">
                <button className="btn back font" onClick={handleBackStep}>
                  Back
                </button>
                {/* <button className="btn next font" onClick={handleNextStep}> */}
                <button
                  className="btn next font" 
                  type="submit"
                  disabled = { Number(presaleTokenInfo.youhold) >= tokenRequired(values.tokensForSale, values.liquidity , values.lockedTokens) ? false : true }
                >
                  Next
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LaunchpadInfo;
