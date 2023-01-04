import { createSlice, PayloadAction } from '@reduxjs/toolkit' 
import { BEP20, Presale } from "../typechain"
import Countdown from 'react-countdown';
import { BigNumber, ethers} from 'ethers';
import { toast } from 'react-toastify';

const PresaleABI = require("../abis/Presale.json");
const BEP20ABI = require("../abis/BEP20.json");

export enum CHAIN {MAIN, TEST}
export enum PreSaleStatus {PENDING, INPROGRESS, SUCCEED, FAILED, CANCELED}
export enum SaleType { PUBLIC, WHITELISTED, TOKENHOLDERS }
export enum RefundType { BURN, REFUND }

export const notify = (
  action:
    | "buy"
    | "withdraw"
    | "claim"
    | "final"
    | "cancel"
    | "unlockTokens"
    | "unlockLPTokens"
    | "saleType"
    | "whiteList"
    | "blackList",
  type: "success" | "failed"
) => {
  if (action === "buy" && type === "success") {
    toast("Successfully bought!");
  } else if (action === "buy" && type === "failed") {
    toast("Purchase is Unsuccessfull!");
  } else if (action === "withdraw" && type === "success") {
    toast("Successfully withdrawed!");
  } else if (action === "withdraw" && type === "failed") {
    toast("Withdrawl Unsuccessfull!");
  } else if (action === "claim" && type === "success") {
    toast("Successfully Claimed!");
  } else if (action === "claim" && type === "failed") {
    toast("Claim Unsuccessfull!");
  } else if (action === "final" && type === "success") {
    toast("Successfully Finalized");
  } else if (action === "final" && type === "failed") {
    toast("Finalization Unsuccessfull");
  } else if (action === "cancel" && type === "success") {
    toast("Successfully Cancelled");
  } else if (action === "cancel" && type === "failed") {
    toast("Cancellation Unsuccessfull");
  } else if (action === "unlockTokens" && type === "success") {
    toast("Successfully Unlocked Tokens");
  } else if (action === "unlockTokens" && type === "failed") {
    toast("Token Unlocking Unsuccessfull");
  } else if (action === "unlockLPTokens" && type === "success") {
    toast("Successfully Unlocked LP Tokens");
  } else if (action === "unlockLPTokens" && type === "failed") {
    toast("LP Token Unlocking Unsuccessfull");
  } else if (action === "saleType" && type === "success") {
    toast("Successfully Changed Sale Type");
  } else if (action === "saleType" && type === "failed") {
    toast("Sale Type Change Unsuccessfull");
  } else if (action === "whiteList" && type === "failed") {
    toast("Successfully Whitelist Users");
  } else if (action === "whiteList" && type === "failed") {
    toast("Whitelisting Unsuccessfull");
  } else if (action === "blackList" && type === "failed") {
    toast("Successfully Removed whitelisted users");
  } else if (action === "blackList" && type === "failed") {
    toast("Whitelist removal Unsuccessfull");
  }
};

export const getLogoURL = async (logoURL: string) => {

  const dummy = "https://m.media-amazon.com/images/I/81UrL01oOcL._SS500_.jpg";
  var image = new Image();
  image.src = logoURL;

  if(logoURL === ""){
    return dummy;
  }

  if (!image.complete) {
    return dummy;
  }
  else if (image.height === 0) {
    return dummy;
  }
  return logoURL;

}

export const checkNetwork = async () => {
  let provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork()

  if(network.chainId !== 97 && network.chainId !== 56){
    alert("only BSC mainnet and testnet is supported");
    throw("Network Error");
  }

}

export const convertToETHs = (num: BigNumber | undefined) => {
  if(num === undefined) return;
  
  return ethers.utils.formatEther(num)

  // return (num.div(10**decimal)).toString();

}

export const convertToWei = (num: string | undefined) => {
  if(num === undefined) return;
  return ethers.utils.parseEther(num)
}

export const convertToBigNumber = (num: number | string | undefined) => {
  if(num === undefined) return;
  return BigNumber.from(num)
}

export const getPresaleData = async(address: string) => {

  let provider = new ethers.providers.Web3Provider(window.ethereum);

  const presaleContract = new ethers.Contract(
    address,
    PresaleABI.abi,
    provider
  ) as Presale;

  // const promise1 = presaleContract.presaleInfo();
  const promise2 = presaleContract.participationCriteria();
  const promise3 = presaleContract.reqestedTokens();
  const promise4 = presaleContract.presaleTimes();
  const promise5 = presaleContract.presaleInfo();
  const promise6 = presaleContract.presaleCounts();
  const promise7 = presaleContract.generalInfo();

  const values = await Promise.all([promise2, promise3, promise4, promise5, promise6, promise7]);
  
  // if(values[3].preSaleToken === )

  // console.log("values ", values);

  const BEP20Token = new ethers.Contract(
    values[3].preSaleToken,
    BEP20ABI.abi,
    provider
  ) as BEP20;

    const name = await BEP20Token.name();
    const symbol = await BEP20Token.symbol();
    const totalSupply = await BEP20Token.totalSupply();

    const tokenInfo = {
      preSaleToken: values[3].preSaleToken,
      name,
      symbol,
      decimals: Number(values[3].decimals)
    }

    const participationCriteria = {
      tokensForSale: values[0].tokensForSale,
      tokensPCForLP: values[0].tokensPCForLP,
      typeOfPresale: Number(values[0].typeOfPresale),
      priceOfEachToken: values[0].priceOfEachToken,
      criteriaToken: values[0].criteriaToken,
      minTokensForParticipation: values[0].minTokensForParticipation,
      refundType: Number(values[0].refundType)
    };

    const reqestedTokens = {
      minTokensReq: values[1].minTokensReq,
      maxTokensReq: values[1].maxTokensReq,
      softCap: values[1].softCap
    };

    const presaleTimes = {
      startedAt: Number(values[2].startedAt),
      expiredAt: Number(values[2].expiredAt),
      lpLockupDuration: Number(values[2].lpLockupDuration)
    };

    const presaleInfo = {
      id: Number(values[3].id),
      presaleOwner: values[3].presaleOwner,
      preSaleStatus: Number(values[3].preSaleStatus),
    };

    const presalectCounts = {
      remainingTokensForSale: values[4].remainingTokensForSale,
      accumulatedBalance: values[4].accumulatedBalance,
      contributors: Number(values[4].contributors),
      claimsCount: Number(values[4].claimsCount),
    };

    const logo = await getLogoURL(values[5].logoURL);

    const generalInfo = {
        description: values[5].description,
        discordURL: values[5].discordURL,
        logoURL: logo,
        telegramURL: values[5].telegramURL,
        twitterURL: values[5].twitterURL,
        websiteURL: values[5].websiteURL,
    }


  const sale: SalesDataType = { saleAddress: presaleContract.address, totalSupply, tokenInfo, participationCriteria, reqestedTokens, presaleTimes, presaleInfo, presalectCounts, generalInfo }
  return sale;
  
}

export const getLockerData = async(address: string) => {

  // let provider = new ethers.providers.Web3Provider(window.ethereum);

  // const presaleContract = new ethers.Contract(
  //   address,
  //   PresaleABI.abi,
  //   provider
  // ) as Presale;

  // const promise1 = presaleContract.tokenInfo();
  // const promise2 = presaleContract.teamVesting();
  // const values = await Promise.all([promise1, promise2]);

  // const tokenInfo = {
  //   preSaleToken: values[0].preSaleToken,
  //   name: values[0].name,
  //   symbol: values[0].symbol,
  //   decimals: Number(values[0].decimals)
  // }

  // const teamVestingCycles = Number(await presaleContract.temaVestingCycles());
  // const teamVestingSchedule = [];

  // for (let i = 0; i <= teamVestingCycles; i++) {
  //   const teamVestingRecord = await presaleContract.teamVestingRecord(i);
  //   const teamVesting = {
  //     cycle: Number(teamVestingRecord.cycle),
  //     releaseTime: Number(teamVestingRecord.releaseTime),
  //     tokensPC: Number(teamVestingRecord.tokensPC),
  //     percentageToRelease: Number(teamVestingRecord.percentageToRelease),
  //     releaseStatus: Number(teamVestingRecord.releaseStatus),
  //   }
  //   teamVestingSchedule.push(teamVesting);
  // }

  // const teamVesting = {
  //   isEnabled: values[1].isEnabled,
  //   vestingTokens: values[1].vestingTokens,
  //   teamVestingSchedule
  // }

  // const sale: LockDataType = { saleAddress: presaleContract.address, tokenInfo, teamVesting}
  // return sale;
  
}

export const getProgress = (tokensForSale: BigNumber, remainingTokensForSale: BigNumber) => {
  // console.log("progress tokensForSale ", Number(tokensForSale))
  // console.log("progress remainingTokensForSale ", Number(remainingTokensForSale))
  // console.log("progress ", progress);

  const progress = Number((tokensForSale.sub(remainingTokensForSale)).mul(BigNumber.from(100)).div(tokensForSale));
  return progress;

}

export const getLaunchPadAddress = async (provider: ethers.providers.Web3Provider) => {
  const network = await provider.getNetwork()
  // console.log("network ", network);
  
  //TestNet
  if(network.chainId === 97){
    // console.log("Test net ", network.chainId, network.name)
    return initialState.masterContracts.launchPadAddressTest;
  }
  // MainNet
  else if(network.chainId === 56){
    // console.log("Test net ", network.chainId, network.name)
    return initialState.masterContracts.launchPadAddressMain;
    // alert("only BSC testnet is supported yet ")
    // throw("NETWORk ERROR")
    // return initialState.masterContracts.launchPadAddressMain;
    
  }
  else {
    alert("only BSC mainnet and testnet are supported ")
    throw("NETWORk ERROR")
  }


}

export const getHREFLink = async (address: string) => {
  let provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork()

  // testNet
  if(network.chainId === 97){
    return `https://testnet.bscscan.com/address/${address}`;
  }
  // MainNet
  else if(network.chainId === 56){
    // console.log("Test net ", network.chainId, network.name)
    // alert("only BSC testnet is supported yet ")
    return `https://bscscan.com/address/${address}`;   
  }
  else {
    alert("only BSC mainnet and testnet are supported ")
    throw("NETWORk ERROR")
  }

}

export const getTokensReleaseStatus = (releaseTime: number, status: number) => {
  if(status === 1){
    return "Withdrawed"
  }
  else if(status === 0 && getCurrentTimeStamp() >= releaseTime){
    return "UnLocked"
  }
  else if(status === 0 && getCurrentTimeStamp() < releaseTime){
    return "Locked"
  }
  
}

export const getRefundType = (type: number) => {
  if(type === 0){
    return "BURN"
  }
  else if(type === 1){
    return "WITHDRAW"
  }
  else{
    return "Invalid"
  }

}

export const getCurrentTimeStamp = () => {
  var now = new Date();
  var utc_timestamp = Date.UTC(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() , 
      now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
  // return utc_timestamp;
  return Number((utc_timestamp / 1000).toFixed())
}

export const currentTimeStamp = () => {
  return Number((new Date().getTime() / 1000).toFixed())
}

export const getSaleStatus = (data: SalesDataType) => {
  
  const status = data.presaleInfo.preSaleStatus;
  const start = data.presaleTimes.startedAt;
  const end = data.presaleTimes.expiredAt
  const tokensForSale = data.participationCriteria.tokensForSale;
  const remainingTokensForSale = data.presalectCounts.remainingTokensForSale;
  const softCap = data.reqestedTokens.softCap;
  const tokenSold = tokensForSale.sub(remainingTokensForSale);

  if (status === 2) {
    return "SUCCEED";
  }
  else if (status === 3) {
    return "FAILED";
  }
  else if (status === 4) {
    return "CANCELED";
  }
  else if (status === 1 && getCurrentTimeStamp() > start && Number(remainingTokensForSale) ===  0 ) {
    return "SUCCEED";
  }
  else if (status === 1 && getCurrentTimeStamp() > start && getCurrentTimeStamp() < end) {
    return "INPROGRESS";
  }
  else if (status === 1 && getCurrentTimeStamp() > end && tokenSold < softCap) {
    return "FAILED";
  }
  else if (status === 1 && getCurrentTimeStamp() > end && tokenSold >= softCap) {
    return "SUCCEED";
  }
  else if (status === 0 && getCurrentTimeStamp() < start) {
    return "PENDING";
  }
  else if (status === 0 && getCurrentTimeStamp() < end) {
    return "INPROGRESS";
  }
  else if (status === 0 && getCurrentTimeStamp() > end ) {
    return "FAILED";
  }
 else {
    return "Invalid Type";
  }
}

export const getSaleType = (type: number) => {
  if (type === 0) {
    return "PUBLIC";
  }
  else if (type === 1) {
    return "WHITELISTED";
  }
  else if (type === 2) {
    return "TOKENHOLDERS";
  }
  else {
    return "Invalid";
  }
}

export const getCountDownStatus = (data: SalesDataType, start: number, end: number) => {
  if(data.presaleInfo.preSaleStatus !== PreSaleStatus.PENDING &&  data.presaleInfo.preSaleStatus !==  PreSaleStatus.INPROGRESS ){
    return "Ended"
  }
  if(getCurrentTimeStamp() > end ){
    return "Ended"
  }
  else if(getCurrentTimeStamp() > start && getCurrentTimeStamp() < end ){
    return "Ending in"
  }
  else if(getCurrentTimeStamp() < start){
    return "Starting in";
  }

}

const renderer = ({ days, hours, minutes, seconds, completed }: any, status: string) => {
  // console.log()
  if (completed) {
    // Render a completed state
    return <div> {status === "START" ? "Started" : status === "END" ? "ENDED" : null} </div>;
  } else {
    // Render a countdown
    return <span>{days}:{hours}:{minutes}:{seconds}</span>;
  }
};

export const getCountDown = (data: SalesDataType, start: number, end: number) => {

  // console.log("ddd preSaleStatus ", data.presaleInfo.preSaleStatus)
  // console.log("ddd start ", start)
  // console.log("ddd end ", end)
  // console.log("ddd getCurrentTimeStamp ", getCurrentTimeStamp())

  if((getCurrentTimeStamp() < start) && (data.presaleInfo.preSaleStatus === 0 || data.presaleInfo.preSaleStatus === 1 )){
    return (
      <Countdown
        date={start * 1000}
        renderer={(e) => renderer(e, "START") }
      />
    )
  }
  
  else if(getCurrentTimeStamp() > start && getCurrentTimeStamp() < end && (data.presaleInfo.preSaleStatus === 0 || data.presaleInfo.preSaleStatus === 1 )){
    return (
      <Countdown
        date={end * 1000}
        renderer={(e) => renderer(e, "END") }
      />
    )
  }
  
  else {
    return "ENDED"
  }
  
}

export interface ContributorsVestingSchedule {
  cycle: number;
  releaseTime: number;
  tokensPC: number;
  percentageToRelease: number;
  releaseStatus?: number
}

export interface TeamVestingSchedule{
  cycle: number,
  releaseTime: number,
  tokensPC: number,
  percentageToRelease: number,
  releaseStatus: number
}

export const releaseStatus = (status: number) => {
  if(status === 0){
    return "UNRELEASED"
  }
  else if (status === 1){
    return "RELEASED"
  }
  else {
    return "Invalid"
  }
} 

export interface SalesDataType {
  saleAddress: string,
  totalSupply: ethers.BigNumber,
  tokenInfo: {
    preSaleToken: string,
    name: string,
    symbol: string,
    decimals: number
  },
  participationCriteria: {
    tokensForSale: ethers.BigNumber,
    tokensPCForLP: ethers.BigNumber,
    typeOfPresale: number,
    priceOfEachToken: ethers.BigNumber,
    criteriaToken: string,
    minTokensForParticipation: ethers.BigNumber,
    criteriaTokenName?: string,
    criteriaTokenSymbol?: string,
    criteriaTokenBalance?: ethers.BigNumber,
    refundType: number,
  },
  reqestedTokens: {
    minTokensReq: ethers.BigNumber,
    maxTokensReq: ethers.BigNumber,
    softCap: ethers.BigNumber,
  },
  presaleTimes: {
    startedAt: number,
    expiredAt: number,
    lpLockupDuration: number
  },
  presaleInfo: {
    id: number,
    presaleOwner: string,
    preSaleStatus: number
  },
  presalectCounts: {
    remainingTokensForSale: ethers.BigNumber,
    accumulatedBalance: ethers.BigNumber,
    contributors: number,
    claimsCount: number
  },
  contributorsVesting?: {
    isEnabled: boolean,
    contributorsVestingSchedule?: ContributorsVestingSchedule[]
  },
  teamVesting?: {
    isEnabled: boolean,
    vestingTokens: ethers.BigNumber,
    teamVestingSchedule?: TeamVestingSchedule[]
  },
  participant? : {
    value: ethers.BigNumber,
    tokens: ethers.BigNumber
  },
  hrefLinks?: {
    saleHREF: string,
    criteriaTokenHREF: string,
    tokenHREF: string
  },
  whitelistedUsers?: string[],
  generalInfo?: {
    description: string;
    discordURL: string;
    logoURL: string;
    telegramURL: string;
    twitterURL: string;
    websiteURL: string;
  }

}

export interface LockDataType {
  saleAddress: string,
  tokenInfo: {
    preSaleToken: string,
    name: string,
    symbol: string,
    decimals: number
  },
  teamVesting?: {
    isEnabled: boolean,
    vestingTokens: ethers.BigNumber,
    teamVestingSchedule?: TeamVestingSchedule[]
  }
}

interface MasterContracts {
  launchPadAddressTest: string,
  // launchPadMethodsTest: null | Launchpadv2,
  launchPadAddressMain: string,
  // launchPadMethodsMain: null | Launchpadv2,
}

interface NetworkDetail {
  id: number,
  // chain: string
}

interface UserInfo {
  userAddress: string | null,
}

export interface PresaleTokenInfo {
  loading: boolean;
  address: string | null;
  methods: BEP20 | null;
  name: string | null;
  symbol: string | null;
  decimal: number;
  totalSupply: BigNumber | null;
  youhold: BigNumber;
  allowance: BigNumber | null;
}


export interface PresaleInfo {
  tokensForSale: number | null,
  typeOfPresale: SaleType,
  tokenHolderSale: boolean,
  criteriaToken: string | null,
  minCriteriaTokens: number | null,
  priceOfEach: number | null,
  softcap: number | null,
  maxBuy: number | null,
  minBuy: number | null,
  refundType: RefundType,
  liquidity: number | null,
  startAt: string | null,
  endAt: string | null,
  LPLcokup: number | null,
  contributorVesting: boolean,
  VCFirstReleasePC: number | null,
  VCEachCyclePC: number | null,
  VCEachCycleTime: number | null,
  tokenLocker: boolean,
  teamVesting: boolean,
  lockedTokens: number | null,
  lockedTokensReleaseTime: number | null,
  TVFirstTokenReleasePC: number | null,
  TVEachCycleTime: number | null,
  TVEachCyclePC: number | null
}

const defaultPresaleInfo: PresaleInfo = {
  tokensForSale: null,
  typeOfPresale: SaleType.PUBLIC,
  tokenHolderSale: false,
  criteriaToken: null,
  minCriteriaTokens: null,
  priceOfEach: null,
  softcap: null,
  maxBuy: null,
  minBuy: null,
  refundType: RefundType.BURN,
  liquidity: null,
  startAt: null,
  endAt: null,
  LPLcokup: null,
  contributorVesting: false,
  VCFirstReleasePC: null,
  VCEachCyclePC: null,
  VCEachCycleTime: null,
  tokenLocker: false,
  lockedTokens: null,
  lockedTokensReleaseTime: null,
  teamVesting: false,
  TVFirstTokenReleasePC: null,
  TVEachCycleTime: null,
  TVEachCyclePC: null
}

export interface PresaleGeneralInfo {
  logoURL: string | null,
  websiteURL: string | null,
  TwitterURL: string | null,
  TelegramURL: string | null,
  DiscordURL: string | null,
  Description: string | null
}

const presaleGeneralInfo: PresaleGeneralInfo = {
  // loading: false,
  logoURL: null,
  websiteURL: null,
  TwitterURL: null,
  TelegramURL: null,
  DiscordURL: null,
  Description: null
  // facebookURL: null,
  // GitHubURL: null,
  // InstagramURL: null,
  // RedditURL: null,
}

export interface LockerInfo {
  id: number;
  type: number;
  name: string,
  symbol: string,
  lockTime: number
  lockerAddress: string
  numOfTokens: number
  owner: string,
  status: number,
  tokenAddress: string,
  unlockTime: number
}

export interface LockersData {
  lockersCount: number | null
  lockers: LockerInfo[] | null
}

const defaultPresaleTokenInfo = {
  loading: false,
  address: null,
  methods: null,
  name: null,
  symbol: null,
  decimal: 1,
  totalSupply: null,
  youhold: BigNumber.from("0"),
  allowance: null
}

export interface DataType {
  networkDetail: NetworkDetail,
  userInfo: UserInfo,
  loading: boolean,
  transectionProgress: boolean,
  masterContracts: MasterContracts,
  presaleTokenInfo: PresaleTokenInfo,
  presaleInfo: PresaleInfo,
  presaleGeneralInfo: PresaleGeneralInfo,
  salesData: {
    data: SalesDataType[] | [],
    loading: boolean,
    totalSales: number,
    salesShowing: number
  },
  lockersData: LockersData
}

const initialSaleData = {
  totalSales: 0,
  salesShowing: 0,
  loading: false,
  data: []
}

const initialState: DataType = {
  networkDetail: {
    id: 0,
    // chain: "",
  },
  userInfo: {
    userAddress: null,
  },
  loading: false,
  transectionProgress: false,
  masterContracts: {
    launchPadAddressTest: "0xfd05006f91aD2c7bF704d14E1b91FBB385CC727B",
    launchPadAddressMain: "0x010ef703df325ffe317b158904e7afcebb0de897",
  },
  presaleTokenInfo: defaultPresaleTokenInfo,
  presaleInfo: defaultPresaleInfo,
  presaleGeneralInfo: presaleGeneralInfo,
  salesData: initialSaleData,
  lockersData: {
    lockersCount: null,
    lockers: null,
  }
}

const dataSlice = createSlice({
  name: "Lottery",
  initialState,
  reducers: {
    clearState() {
      return initialState;
    },

    setActiveUserInfo(state, { payload }: PayloadAction<{ address: string, balance: number, erc20Symbol: string }>) {
      state.userInfo.userAddress = payload.address;
    },

    setActiveUser(state, { payload }: PayloadAction<string>) {
      state.userInfo.userAddress = payload;
    },

    setNetworkID(state, { payload }: PayloadAction<number>) {
      state.networkDetail.id = payload;
      // state.networkDetail.chain = payload.chain;
    },

    setLoading(state, { payload }: PayloadAction<boolean>) {
      state.loading = payload
    },

    setTransactionProgress(state, { payload }: PayloadAction<boolean>) {
      state.transectionProgress = payload
    },

    setPresaleTokenInfo(state, { payload }: PayloadAction<any | null>) {
      if (payload === null) {
        state.presaleTokenInfo = defaultPresaleTokenInfo;
      }
      else {
        state.presaleTokenInfo = payload;
      }
    },

    setPresaleTokenLoading(state, { payload }: PayloadAction<boolean>) {
      state.presaleTokenInfo.loading = payload;
    },

    updatePresaleTokenAllownce(state, { payload }: PayloadAction<BigNumber>) {
      state.presaleTokenInfo.allowance = payload;
    },
    
    addLockerData(state, { payload }: PayloadAction<{ count: number, lockers: LockerInfo[] }>) {
      state.lockersData.lockersCount = payload.count;
      state.lockersData.lockers = payload.lockers;
    },

    setPresaleInfo(state, { payload }: PayloadAction<PresaleInfo | null>) {
      if(payload === null){
        state.presaleInfo = defaultPresaleInfo;
      }
      else {
        state.presaleInfo = payload;
      }
    },

    setPresaleGeneralInfo(state, { payload }: PayloadAction<PresaleGeneralInfo>) {
      state.presaleGeneralInfo = payload;
    },

    setSalesData(state, { payload }: PayloadAction<SalesDataType[]>) {
      if (state.salesData.data === null) {
        state.salesData.data = payload;
      }
      else {
        state.salesData.data = [...state.salesData.data, ...payload]
      }
    },

    resetSaleData(state) {
        state.salesData = initialSaleData;
    },

    setSalesDataLoading(state, { payload }: PayloadAction<boolean>) {
      state.salesData.loading = payload
    },

    setSalesDataTotalSales(state, { payload }: PayloadAction<number>) {
      state.salesData.totalSales = payload
    },
    
    setSalesShowing(state, { payload }: PayloadAction<number>) {
      state.salesData.salesShowing = payload
    },

  }


});


// Extract the action creators object and the reducer
const { actions, reducer } = dataSlice
// Extract and export each action creator by name
export const { resetSaleData, setSalesShowing, setSalesDataTotalSales, setSalesDataLoading, setSalesData, setPresaleGeneralInfo, setPresaleInfo, addLockerData, updatePresaleTokenAllownce, setPresaleTokenLoading, setPresaleTokenInfo, setActiveUser, setNetworkID } = actions
// Export the reducer, either as a default or named export
export default reducer
