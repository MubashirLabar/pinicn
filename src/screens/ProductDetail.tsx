import React, { useEffect, useState } from "react";
import {
  ShareIcon,
  TwitterIcon,
  DiscordIcon,
  SendIcon,
  EditIcon,
} from "../assets/icons";
import ArrowDownIcon from "../assets/icons/ArrowDownIcon";
import ArrowUpIcon from "../assets/icons/ArrowUpIcon";
import { useParams } from "react-router-dom";
import { ethers } from "@usedapp/core/node_modules/ethers";
import { useDispatch, useSelector } from "react-redux";
import { Presale, BEP20 } from "../typechain";
import { toast } from "react-toastify";

import {
  DataType,
  setActiveUser,
  getCountDown,
  getCountDownStatus,
  getCurrentTimeStamp,
  getProgress,
  getRefundType,
  getSaleStatus,
  getSaleType,
  getTokensReleaseStatus,
  SalesDataType,
  PreSaleStatus,
  getHREFLink,
  SaleType,
  convertToETHs,
  convertToWei,
  checkNetwork,
  getLogoURL,
  setNetworkID,
  notify,
} from "../store";

import { BigNumber } from "ethers";

import { Loader } from "../components";
import MetaMaskOnboarding from "@metamask/onboarding";
import queryString from "query-string";
import Modal from "../components/Modal";
import ProductDetailModel from "./ProductDetailModel";

//@ts-ignore
import {
  Chart,
  registerables,
  PieController,
  ArcElement,
  Legend,
  Tooltip,
  Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

const BEP20ABI = require("../abis/BEP20.json");
const PresaleABI = require("../abis/Presale.json");
const zeroAddress = "0x0000000000000000000000000000000000000000";

const ProductDetail = () => {
  let { saleID } = useParams();
  const { chainID } = queryString.parse(window.location.search);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: DataType) => state);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [presaleData, setPresaleData] = useState<SalesDataType | null>();
  const [presaleFunctions, setPresaleFunctions] = useState<Presale | null>();
  const [purchase, setPurchase] = useState<string | null>();
  const [openEditDailog, setOpenEditDialog] = useState<boolean>();

  const defaulModelData = {
    saleID: saleID || "",
    setPresaleData: setPresaleData,
    logoURL: presaleData?.generalInfo?.logoURL || "",
    websiteURL: presaleData?.generalInfo?.websiteURL || "",
    TwitterURL: presaleData?.generalInfo?.twitterURL || "",
    TelegramURL: presaleData?.generalInfo?.telegramURL || "",
    DiscordURL: presaleData?.generalInfo?.discordURL || "",
    Description: presaleData?.generalInfo?.description || "",
  };

  // console.log("getLogoURL ", getLogoURL(presaleData?.generalInfo?.logoURL));

  useEffect(() => {
    connectMetamask();
    fetchData();
  }, [userInfo.userAddress]);

  const handlePurchase = (e: string) => {
    setPurchase(e);
  };

  const handleMax = async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let myaddress = await signer.getAddress();

    const balance = await provider.getBalance(myaddress);
    // console.log("balance ", Number(balance));
    // const balanceEth = Number(ethers.utils.formatEther(balance))
    const preveousContributions = presaleData?.participant?.value
      ? presaleData.participant.value
      : BigNumber.from("0");

    // console.log("preveousContributions ", Number(preveousContributions));

    // console.log("maxAllowed preveousContributions", preveousContributions)

    if (presaleData) {
      const maxAllowed = presaleData.participationCriteria.priceOfEachToken
        .mul(presaleData.reqestedTokens.maxTokensReq)
        .sub(preveousContributions);

      const available = presaleData.presalectCounts.remainingTokensForSale.mul(
        presaleData.participationCriteria.priceOfEachToken
      );
      console.log("available ", convertToETHs(available));

      // console.log("maxAllowed ", Number(maxAllowed));

      Number(available) <= Number(maxAllowed)
        ? setPurchase(convertToETHs(available))
        : Number(balance) <= Number(maxAllowed)
        ? setPurchase(convertToETHs(balance))
        : setPurchase(convertToETHs(maxAllowed));

      // Number(balance) <= Number(maxAllowed)
      //   ? setPurchase(convertToETHs(balance))
      //   : setPurchase(convertToETHs(maxAllowed));
    }
  };

  const handleBuy = async () => {
    if (!presaleFunctions || !purchase || !presaleData) return;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const purchaseTx = presaleFunctions?.connect(signer);

    try {
      const purchaseAmountInWie = convertToWei(purchase);

      const tokensToBuy = BigNumber.from(purchaseAmountInWie).div(
        presaleData.participationCriteria.priceOfEachToken
      );
      const actualTokensToBuy = Number(tokensToBuy).toFixed();
      const balanceRequired = BigNumber.from(actualTokensToBuy).mul(
        presaleData.participationCriteria.priceOfEachToken
      );

      const tx = await purchaseTx.buyTokensOnPresale(actualTokensToBuy, {
        value: balanceRequired,
      });
      await tx.wait();
      // console.log("purchase transaction ", transaction);

      notify("buy", "success");

      setPresaleData((e) => {
        if (!e) return;

        const presalectCounts = {
          claimsCount: e.presalectCounts.claimsCount,
          contributors:
            Number(e.participant?.value) === 0
              ? e.presalectCounts.contributors + 1
              : e.presalectCounts.contributors,
          remainingTokensForSale: e.presalectCounts.remainingTokensForSale.sub(
            BigNumber.from(actualTokensToBuy)
          ),
          accumulatedBalance:
            e.presalectCounts.accumulatedBalance.add(balanceRequired),
        };

        let updated = { ...e, presalectCounts };

        if (
          e.participant &&
          e.participant.value >= BigNumber.from(0) &&
          e.participant.tokens >= BigNumber.from(0)
        ) {
          const participant = {
            value: e.participant.value.add(balanceRequired),
            tokens: e.participant.tokens.add(actualTokensToBuy),
          };
          return { ...updated, participant };
        } else {
          return updated;
        }
      });
    } catch (e: any) {
      // alert("Not allowed");
      console.error(e.message);
      notify("buy", "failed");
    }
  };

  const handleClaim = async () => {
    if (!presaleData?.participant || !presaleFunctions) return;

    if (
      presaleData?.participant.tokens !== BigNumber.from(0) ||
      presaleData?.participant.value !== BigNumber.from(0)
    ) {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const claimTx = presaleFunctions.connect(signer);

      try {
        const tx = await claimTx.claimTokensOrARefund();
        await tx.wait();
        // console.log("claim transaction ", transaction);
        notify("claim", "success");

        if (!presaleData.contributorsVesting?.isEnabled) {
          setPresaleData((e) => {
            if (!e) return;

            const presalectCounts = {
              ...e.presalectCounts,
              claimsCount: e.presalectCounts.claimsCount + 1,
            };

            const participant = {
              value: BigNumber.from(0),
              tokens: BigNumber.from(0),
            };

            return { ...e, presalectCounts, participant };
          });
        } else {
          updateSchedules();
        }
      } catch (e: any) {
        console.error(e.message);
        notify("claim", "failed");
      }
    }
  };

  const finalizePool = async () => {
    if (!presaleFunctions) return;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const finalizeTx = presaleFunctions.connect(signer);

    try {
      const tx = await finalizeTx.finalizePresale();
      await tx.wait();
      // console.log("finalizeTx ", transaction);

      const newStatus = await presaleFunctions.presaleInfo();

      notify("final", "success");

      setPresaleData((e) => {
        if (!e) return;
        const presaleInfo = {
          ...e.presaleInfo,
          preSaleStatus: newStatus.preSaleStatus,
        };
        return { ...e, presaleInfo };
      });
    } catch (e: any) {
      // alert("Not allowed");
      console.error(e.message);
      notify("final", "failed");
    }
  };

  const cancelPool = async () => {
    if (!presaleFunctions) return;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const cancelTx = presaleFunctions.connect(signer);

    try {
      const tx = await cancelTx.cancelSale();
      await tx.wait();
      notify("cancel", "success");
      setPresaleData((e) => {
        if (!e) return;
        const presaleInfo = {
          ...e.presaleInfo,
          preSaleStatus: PreSaleStatus.CANCELED,
        };
        return { ...e, presaleInfo };
      });
    } catch (e: any) {
      // console.log(presaleFunctions)
      console.error(e.message);
      notify("cancel", "failed");
    }
  };

  const unlockTokens = async () => {
    if (!presaleFunctions) return;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const unlockTx = presaleFunctions.connect(signer);

    try {
      const tx = await unlockTx.unlockTokens();
      await tx.wait();
      notify("unlockTokens", "success");
      updateSchedules();
      // console.log("finalizeTx ", transaction);
    } catch (e: any) {
      // alert("Not allowed");
      console.error(e.message);
      notify("unlockTokens", "failed");
    }
  };

  const unlockLPTokens = async () => {
    if (!presaleFunctions) return;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const unlockLPTx = presaleFunctions.connect(signer);

    try {
      const tx = await unlockLPTx.unlockLPTokens();
      await tx.wait();
      notify("unlockLPTokens", "success");
      // console.log("finalizeTx ", transaction);
    } catch (e: any) {
      // alert("Not allowed");
      console.error(e.message);
      notify("unlockLPTokens", "failed");
    }
  };

  const emergencyWithdraw = async () => {
    if (!presaleFunctions) return;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const withdrawTx = presaleFunctions.connect(signer);

    try {
      const tx = await withdrawTx.emergencyWithdraw();
      await tx.wait();
      // console.log("finalizeTx ", transaction);

      notify("withdraw", "success");

      setPresaleData((e) => {
        if (!e) return;
        if (!e.participant) return;

        const presalectCounts = {
          claimsCount: e.presalectCounts.claimsCount,
          contributors: e.presalectCounts.contributors - 1,
          remainingTokensForSale: e.presalectCounts.remainingTokensForSale.add(
            e.participant.tokens
          ),
          accumulatedBalance: e.presalectCounts.accumulatedBalance.sub(
            e.participant.value
          ),
        };

        const participant = {
          value: BigNumber.from(0),
          tokens: BigNumber.from(0),
        };

        return { ...e, presalectCounts, participant };
      });
    } catch (e: any) {
      // alert("Not allowed");
      console.error(e.message);
      notify("withdraw", "failed");
    }
  };

  const [saleType, setSaleType] = useState<SaleType>(SaleType.PUBLIC);

  const handleSaleType = async (type: SaleType) => {
    if (type === SaleType.PUBLIC || type === SaleType.WHITELISTED) {
      await handleTokenHolderType(type);
      setSaleType(type);
    } else if (type === SaleType.TOKENHOLDERS) {
      setSaleType(type);
    }
  };

  const handleTokenHolderType = async (
    type: SaleType,
    address = zeroAddress,
    minTokens = 0
  ) => {
    if (!presaleFunctions) return;
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    let myaddress = await signer.getAddress();

    const tookenHolderTx = presaleFunctions.connect(signer);

    try {
      if (type === SaleType.PUBLIC || type === SaleType.WHITELISTED) {
        const tx = await tookenHolderTx.chageSaleType(type, address, minTokens);
        await tx.wait();
        // console.log("finalizeTx ", transaction);

        notify("saleType", "success");

        setPresaleData((e) => {
          if (!e) return;
          const participationCriteria = {
            ...e.participationCriteria,
            typeOfPresale:
              type === SaleType.PUBLIC ? SaleType.PUBLIC : SaleType.WHITELISTED,
          };
          return { ...e, participationCriteria };
        });
      } else if (
        type === SaleType.TOKENHOLDERS &&
        tokenHolderTypeInfo.address !== "" &&
        tokenHolderTypeInfo.minTokens! > 0
      ) {
        if (ethers.utils.isAddress(address)) {
          const tx = await tookenHolderTx.chageSaleType(
            type,
            address,
            ethers.utils.parseEther(String(minTokens))
          );
          await tx.wait();
          // console.log("finalizeTx ", transaction);

          const criteriaContract = new ethers.Contract(
            address,
            BEP20ABI.abi,
            provider
          ) as BEP20;

          const criteriaTokenName = await criteriaContract.name();
          const criteriaTokenSymbol = await criteriaContract.symbol();
          const criteriaTokenBalance = await criteriaContract.balanceOf(
            myaddress
          );
          const criteriaTokenHREF = await getHREFLink(address);

          notify("saleType", "success");

          setPresaleData((e) => {
            if (!e) return;

            const participationCriteria = {
              ...e.participationCriteria,
              typeOfPresale: SaleType.TOKENHOLDERS,
              criteriaTokenName,
              criteriaTokenSymbol,
              criteriaTokenBalance,
              criteriaToken: address,
              minTokensForParticipation: BigNumber.from(
                ethers.utils.parseEther(String(minTokens))
              ),
            };

            if (e.hrefLinks) {
              const hrefLinks = {
                ...e.hrefLinks,
                criteriaTokenHREF: criteriaTokenHREF,
              };
              return { ...e, participationCriteria, hrefLinks };
            } else {
              return { ...e, participationCriteria };
            }
          });
        } else alert("Invalid token Address");
      } else {
        alert("Not a valid input in token holder section");
      }
    } catch (e: any) {
      // alert("Not allowed");
      console.error(e.message);
      notify("saleType", "failed");
    }
  };

  const [tokenHolderTypeInfo, setTokenHolderTypeInfo] = useState({
    address: "",
    minTokens: 0,
  });

  const handleTokenInoInput = (
    info: string | number,
    type: "ADDRESS" | "MINTOKENS"
  ) => {
    if (type === "ADDRESS") {
      setTokenHolderTypeInfo({
        address: String(info),
        minTokens: tokenHolderTypeInfo.minTokens,
      });
    } else if (type === "MINTOKENS") {
      setTokenHolderTypeInfo({
        address: tokenHolderTypeInfo.address,
        minTokens: Number(info),
      });
    }
  };

  const [whitelist, setWhitelist] = useState("");

  const handleWhitelList = async (type: "INCLUDE" | "REMOVE") => {
    // console.log("whitelist ", whitelist.replace(/(\r\n|\n|\r)/gm, "").split(','));
    const whitelistedUsers = whitelist.replace(/(\r\n|\n|\r)/gm, "").split(",");
    if (whitelist !== "" && whitelistedUsers.length > 0 && presaleFunctions) {
      whitelistedUsers.map((user) => {
        const check = ethers.utils.isAddress(user);
        if (!check) {
          alert(`${user} is not a valid address.`);
          throw "ERROR with whitelisting";
        }
      });

      let provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const whitelistTx = presaleFunctions.connect(signer);

      try {
        if (type === "INCLUDE") {
          const tx = await whitelistTx.whiteListUsers(whitelistedUsers);
          await tx.wait();
          // console.log("whitelistTx ", transaction);

          toast("whiteList");

          setPresaleData((e) => {
            if (!e) return;
            if (e.whitelistedUsers) {
              const whiteList = [...e.whitelistedUsers, ...whitelistedUsers];
              return { ...e, whitelistedUsers: whiteList };
            } else {
              return { ...e, whitelistedUsers };
            }
          });
        } else if (type === "REMOVE") {
          const tx = await whitelistTx.removeWhiteListUsers(whitelistedUsers);
          await tx.wait();
          // console.log("whitelistTx ", transaction);

          toast("blackList");

          setPresaleData((e) => {
            if (!e) return;

            if (e.whitelistedUsers) {
              const whiteList = e.whitelistedUsers.filter(
                (address) => whitelistedUsers.indexOf(address) < 0
              );
              // console.log("whiteList ", whiteList)
              return { ...e, whitelistedUsers: whiteList };
            } else {
              return e;
            }
          });
        }
      } catch (e: any) {
        console.error(e.message);
      }
    } else {
      console.error("Invalid whitelist input");
    }
  };

  const switchNetwork = async () => {
    // let id;
    // if (chain === "97") id = 97;
    // else if (chain === "56") id = 56;
    // try {
    //   await window.ethereum.enable();
    //   await window.ethereum._handleChainChanged({
    //     chainId: id,
    //     networkVersion: 2,
    //   });
    //   // console.log("Trying to switch to id: ", id);
    // } catch (error) {
    //   console.error(error);
    // }
    //   window.ethereum.request({
    //     method: "wallet_addEthereumChain",
    //     params: [{
    //         chainId: "0x89",
    //         rpcUrls: ["https://rpc-mainnet.matic.network/"],
    //         chainName: "Matic Mainnet",
    //         nativeCurrency: {
    //             name: "MATIC",
    //             symbol: "MATIC",
    //             decimals: 18
    //         },
    //         blockExplorerUrls: ["https://polygonscan.com/"]
    //     }]
    // });
  };

  const connectMetamask = async () => {
    const isMetaMaskAvaialble = MetaMaskOnboarding.isMetaMaskInstalled();
    if (!isMetaMaskAvaialble) {
      const askToInstall = window.confirm(
        "No metamask Found. please install it"
      );
      if (askToInstall) {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
      }
    }

    if (isMetaMaskAvaialble) {
      await checkNetwork();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const myAddress = await signer.getAddress();
      // console.log("sss", myAddress)
      dispatch(setActiveUser(myAddress));

      const network = await provider.getNetwork();
      // if (Number(network.chainId) !== 97) {
      //   alert("Please connect to Binance Smart Chain Mainnetwork to use this Dapp")
      // }
      // console.log("Chain id ", Number(network.chainId));
      // console.log("Chain name ", getChainName(Number(network.chainId)));
      dispatch(setNetworkID(Number(network.chainId)));
      // dispatch(setNetworkDetails({ id: Number(0), chain: "hello world" }));
    }
  };

  const handleGeneralInfoUpdate = () => {
    setOpenEditDialog(true);
  };

  const updateSchedules = async () => {
    if (!saleID) return;

    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const myAddress = await signer.getAddress();

    const presaleContract = new ethers.Contract(
      saleID,
      PresaleABI.abi,
      provider
    ) as Presale;

    const promise1 = presaleContract.contributorsVesting();
    const promise2 = presaleContract.teamVesting();

    const values = await Promise.all([promise1, promise2]);

    const contributorCycles = Number(await presaleContract.contributorCycles());
    const finalizationTime = await presaleContract.finalizingTime();
    const contributorsVestingSchedule = [];

    for (let i = 0; i <= contributorCycles; i++) {
      const contributorVestingRecord =
        await presaleContract.contributorVestingRecord(i);

      const releaseStatus = await presaleContract.getContributorReleaseStatus(
        finalizationTime.add(contributorVestingRecord.releaseTime),
        myAddress
      );

      const contributorsVesting = {
        cycle: Number(contributorVestingRecord.cycle),
        percentageToRelease: Number(
          contributorVestingRecord.percentageToRelease
        ),
        releaseTime: Number(
          finalizationTime.add(contributorVestingRecord.releaseTime)
        ),
        tokensPC: Number(contributorVestingRecord.tokensPC),
        releaseStatus: Number(releaseStatus),
      };
      contributorsVestingSchedule.push(contributorsVesting);
    }

    const contributorsVesting = {
      isEnabled: values[0].isEnabled,
      contributorsVestingSchedule,
    };
    const teamVestingCycles = Number(await presaleContract.temaVestingCycles());
    const teamVestingSchedule = [];

    for (let i = 0; i <= teamVestingCycles; i++) {
      const teamVestingRecord = await presaleContract.teamVestingRecord(i);
      const teamVesting = {
        cycle: Number(teamVestingRecord.cycle),
        releaseTime: Number(
          finalizationTime.add(teamVestingRecord.releaseTime)
        ),
        tokensPC: Number(teamVestingRecord.tokensPC),
        percentageToRelease: Number(teamVestingRecord.percentageToRelease),
        releaseStatus: Number(teamVestingRecord.releaseStatus),
      };
      teamVestingSchedule.push(teamVesting);
    }

    const teamVesting = {
      isEnabled: values[1].isEnabled,
      vestingTokens: values[1].vestingTokens,
      teamVestingSchedule,
    };

    setPresaleData((sale) => {
      if (!sale) return;

      return {
        ...sale,
        teamVesting,
        contributorsVesting,
      };
    });
  };

  const fetchData = async () => {
    // console.log("fixxx saleID", saleID)

    let provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();

    const signer = await provider.getSigner();
    const myAddress = await signer.getAddress();
    // console.log("fixxx userAddress", myAddress)

    // console.log("network.chainId ", network.chainId)
    // console.log("chain ", chainID)

    if (chainID === "97" && network.chainId !== 97) {
      alert(
        "This sale is hosted on BSC Testnet only. Please swtitch to BSC Testnet"
      );
      throw "Network Error";
    } else if (chainID === "56" && network.chainId !== 56) {
      alert(
        "This sale is hosted on BSC Mainnet only. Please swtitch to BSC Mainnet"
      );
      throw "Network Error";
    }

    if (!saleID) return;
    setPresaleData(null);
    setLoading(true);

    let presaleContract;

    try {
      presaleContract = new ethers.Contract(
        saleID,
        PresaleABI.abi,
        provider
      ) as Presale;
    } catch (e) {
      alert("Presale doesn't exist");
    }

    if (!presaleContract) return;

    setPresaleFunctions(presaleContract);

    // const promise1 = presaleContract.tokenInfo();
    const promise1 = presaleContract.participationCriteria();
    const promise2 = presaleContract.reqestedTokens();
    const promise3 = presaleContract.presaleTimes();
    const promise4 = presaleContract.presaleInfo();
    const promise5 = presaleContract.presaleCounts();
    const promise6 = presaleContract.contributorsVesting();
    const promise7 = presaleContract.teamVesting();
    const promise8 = presaleContract.participant(myAddress);
    const promise9 = presaleContract.getWhiteListUsers();
    const promise10 = presaleContract.generalInfo();

    const values = await Promise.all([
      promise1,
      promise2,
      promise3,
      promise4,
      promise5,
      promise6,
      promise7,
      promise8,
      promise9,
      promise10,
    ]);
    // console.log(values[5].accumulatedBalance.toString())

    const saleHREF = await getHREFLink(saleID);
    const criteriaTokenHREF = await getHREFLink(values[0].criteriaToken);
    const tokenHREF = await getHREFLink(values[3].preSaleToken);

    const hrefLinks = {
      saleHREF,
      criteriaTokenHREF,
      tokenHREF,
    };

    const presaletoken = new ethers.Contract(
      values[3].preSaleToken,
      BEP20ABI.abi,
      provider
    ) as BEP20;

    const totalSupply = await presaletoken.totalSupply();
    const name = await presaletoken.name();
    const symbol = await presaletoken.symbol();

    const tokenInfo = {
      preSaleToken: values[3].preSaleToken,
      name: name,
      symbol: symbol,
      decimals: Number(values[3].decimals),
    };

    let criteriaTokenName;
    let criteriaTokenSymbol;
    let criteriaTokenBalance;

    const criteriaContract = new ethers.Contract(
      values[0].criteriaToken,
      BEP20ABI.abi,
      provider
    ) as BEP20;

    if (Number(values[0].typeOfPresale) === SaleType.TOKENHOLDERS) {
      criteriaTokenName = await criteriaContract.name();
      criteriaTokenSymbol = await criteriaContract.symbol();
      criteriaTokenBalance = await criteriaContract.balanceOf(myAddress);
    }

    const participationCriteria = {
      tokensForSale: values[0].tokensForSale,
      tokensPCForLP: values[0].tokensPCForLP,
      typeOfPresale: Number(values[0].typeOfPresale),
      priceOfEachToken: values[0].priceOfEachToken,
      criteriaToken: values[0].criteriaToken,
      criteriaTokenName,
      criteriaTokenSymbol,
      criteriaTokenBalance,
      minTokensForParticipation: values[0].minTokensForParticipation,
      refundType: Number(values[0].refundType),
    };

    const reqestedTokens = {
      minTokensReq: values[1].minTokensReq,
      maxTokensReq: values[1].maxTokensReq,
      softCap: values[1].softCap,
    };

    const presaleTimes = {
      startedAt: Number(values[2].startedAt),
      expiredAt: Number(values[2].expiredAt),
      lpLockupDuration: Number(values[2].lpLockupDuration),
    };

    if (values[3].presaleOwner.toLowerCase() === myAddress.toLowerCase()) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }

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

    const contributorCycles = Number(await presaleContract.contributorCycles());
    const finalizationTime = await presaleContract.finalizingTime();
    const contributorsVestingSchedule = [];

    for (let i = 0; i <= contributorCycles; i++) {
      const contributorVestingRecord =
        await presaleContract.contributorVestingRecord(i);

      const releaseStatus = await presaleContract.getContributorReleaseStatus(
        finalizationTime.add(contributorVestingRecord.releaseTime),
        myAddress
      );

      const contributorsVesting = {
        cycle: Number(contributorVestingRecord.cycle),
        percentageToRelease: Number(
          contributorVestingRecord.percentageToRelease
        ),
        releaseTime: Number(
          finalizationTime.add(contributorVestingRecord.releaseTime)
        ),
        tokensPC: Number(contributorVestingRecord.tokensPC),
        releaseStatus: Number(releaseStatus),
      };
      contributorsVestingSchedule.push(contributorsVesting);
    }

    const contributorsVesting = {
      isEnabled: values[5].isEnabled,
      contributorsVestingSchedule,
    };
    const teamVestingCycles = Number(await presaleContract.temaVestingCycles());
    const teamVestingSchedule = [];

    for (let i = 0; i <= teamVestingCycles; i++) {
      const teamVestingRecord = await presaleContract.teamVestingRecord(i);
      const teamVesting = {
        cycle: Number(teamVestingRecord.cycle),
        releaseTime: Number(
          finalizationTime.add(teamVestingRecord.releaseTime)
        ),
        tokensPC: Number(teamVestingRecord.tokensPC),
        percentageToRelease: Number(teamVestingRecord.percentageToRelease),
        releaseStatus: Number(teamVestingRecord.releaseStatus),
      };
      teamVestingSchedule.push(teamVesting);
    }

    const teamVesting = {
      isEnabled: values[6].isEnabled,
      vestingTokens: values[6].vestingTokens,
      teamVestingSchedule,
    };

    const participant = {
      value: values[7].value,
      tokens: values[7].tokens,
    };

    // console.log("general Info ", values[9]);

    const logo = await getLogoURL(values[9].logoURL);

    const generalInfo = {
      description: values[9].description,
      discordURL: values[9].discordURL,
      logoURL: logo || "",
      telegramURL: values[9].telegramURL,
      twitterURL: values[9].twitterURL,
      websiteURL: values[9].websiteURL,
    };

    const sale: SalesDataType = {
      saleAddress: presaleContract.address,
      totalSupply,
      tokenInfo,
      participationCriteria,
      reqestedTokens,
      presaleTimes,
      presaleInfo,
      presalectCounts,
      contributorsVesting,
      teamVesting,
      participant,
      hrefLinks,
      whitelistedUsers: values[8],
      generalInfo,
    };

    setPresaleData(sale);

    setSaleType(
      participationCriteria.typeOfPresale === 2
        ? SaleType.TOKENHOLDERS
        : participationCriteria.typeOfPresale === 1
        ? SaleType.WHITELISTED
        : SaleType.PUBLIC
    );

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="product-detail-page-loader">
        <Loader />
      </div>
    );
  }

  if (!presaleData) {
    return (
      <div className="product-detail-page-loader">
        <div className="font s16 b3 cfff">No data available</div>
      </div>
    );
  }

  const getFundsRaised = () => {
    const funds = presaleData.participationCriteria.tokensForSale
      .sub(presaleData.presalectCounts.remainingTokensForSale)
      .mul(presaleData.participationCriteria.priceOfEachToken);
    return `${convertToETHs(funds)} BNBs`;
  };

  const getRemainingTokens = () => {
    return `${presaleData.presalectCounts.remainingTokensForSale} ${presaleData.tokenInfo.symbol}`;
  };

  const getContributors = () => {
    return presaleData.presalectCounts.contributors;
  };

  const getClaimees = () => {
    return presaleData.presalectCounts.claimsCount;
  };

  // const getNextTeamTokenUnLocktime = () => {
  //   const current = getCurrentTimeStamp();
  //   // currentTimeStamp()
  //   if (presaleData.teamVesting?.isEnabled) {
  //     const schedule = presaleData.teamVesting.teamVestingSchedule;
  //     // console.log("schedule ", current, schedule);
  //   }
  // };

  const HREFComponent = ({
    HREF,
    address,
  }: {
    HREF: string | undefined;
    address: string | undefined;
  }) => {
    return (
      <a className={`val font link wordwrap`} href={HREF} target="_blank">
        {" "}
        {address}{" "}
      </a>
    );
  };

  type LayoutPosition = "left" | "top" | "right" | "bottom" | "center";

  const position: LayoutPosition = "bottom";

  const option = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: position,
      },
      title: {
        display: true,
        text: "Tokenomics",
      },
    },
  };

  const unlockedTokens =
    Number(convertToETHs(presaleData.totalSupply)) -
    Number(
      presaleData.participationCriteria.tokensForSale
        .add(
          presaleData.participationCriteria.tokensForSale
            .mul(presaleData.participationCriteria.tokensPCForLP)
            .div(BigNumber.from(100))
        )
        .add(
          presaleData.teamVesting?.vestingTokens
            ? presaleData.teamVesting?.vestingTokens
            : BigNumber.from("0")
        )
    );

  const data = {
    labels: [
      "Tokens For Sale",
      "Tokens For Liquidity",
      "Tokens for Locker",
      "Unlocked Tokens",
    ],
    datasets: [
      {
        label: "Tokenomics",
        data: [
          Number(presaleData.participationCriteria.tokensForSale),
          Number(
            presaleData.participationCriteria.tokensForSale
              .mul(presaleData.participationCriteria.tokensPCForLP)
              .div(BigNumber.from(100))
          ),
          Number(presaleData.teamVesting?.vestingTokens),
          unlockedTokens,
        ],
        backgroundColor: [
          "rgb(255, 64, 105)",
          "rgba(89, 241, 102, 0.979)",
          "rgba(43, 46, 216, 0.979)",
          "rgba(199, 216, 43, 0.979)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(54, 162, 235, 1)",
          "#dffd72",
        ],
        borderWidth: 0,
      },
    ],
  };

  Chart.register(
    ...registerables,
    PieController,
    ArcElement,
    Title,
    Legend,
    Tooltip
  );

  const decimalFactor = BigNumber.from(
    String(10 ** presaleData.tokenInfo.decimals)
  );

  // console.log("xxxxxx ", (presaleData?.totalSupply).toString() )
  // console.log("xxxxxx ", (presaleData.tokenInfo.decimals).toString() )

  // console.log("xxxxxx ", (presaleData.totalSupply.div(decimalFactor)).toString() )

  return (
    <>
      <div className="product-detail-page">
        <div className="wrapWidth wrapper flex flex-col">
          <div className="filters-block">
            <div className="hdr flex aic">
              <div className="left flex aic">
                <div className="img flex aic">
                  <img
                    src={presaleData.generalInfo?.logoURL}
                    className="icon"
                    // height="50px"
                    // width="50px"
                  />
                </div>
                <div className="meta flex flex-col">
                  <div className="lbl font s14 c000">
                    {presaleData?.tokenInfo.name}
                  </div>
                  <div className="font s13 b3 ccc">
                    {presaleData?.tokenInfo.symbol}
                  </div>
                </div>

                <div className="links flex aic">
                  {presaleData.generalInfo &&
                    presaleData.generalInfo.websiteURL !== "" && (
                      <a
                        href={presaleData.generalInfo?.websiteURL}
                        className="link"
                        target="_blank"
                      >
                        <ShareIcon />
                      </a>
                    )}

                  {presaleData.generalInfo &&
                    presaleData.generalInfo.discordURL !== "" && (
                      <a
                        href={presaleData.generalInfo?.discordURL}
                        className="link"
                        target="_blank"
                      >
                        <DiscordIcon />
                      </a>
                    )}

                  {presaleData.generalInfo &&
                    presaleData.generalInfo.twitterURL !== "" && (
                      <a
                        href={presaleData.generalInfo?.twitterURL}
                        className="link"
                        target="_blank"
                      >
                        <TwitterIcon />
                      </a>
                    )}

                  {presaleData.generalInfo &&
                    presaleData.generalInfo.telegramURL !== "" && (
                      <a
                        href={presaleData.generalInfo?.telegramURL}
                        className="link"
                        target="_blank"
                      >
                        <SendIcon />
                      </a>
                    )}
                </div>
              </div>

              {isOwner && (
                <div className="right flex aic">
                  <button
                    className="cleanbtn edit-btn"
                    onClick={handleGeneralInfoUpdate}
                  >
                    <EditIcon />
                  </button>
                </div>
              )}
            </div>
            {presaleData.generalInfo && presaleData.generalInfo.description && (
              <div className="text font s14">
                {presaleData.generalInfo?.description}
              </div>
            )}
          </div>

          <div className="stamp-block flex flex-col aic">
            <div className="title font s14 c000">
              {getCountDownStatus(
                presaleData,
                presaleData.presaleTimes.startedAt,
                presaleData.presaleTimes.expiredAt
              )}
            </div>
            <div className="timestamp cleanbtn font s18 cfff">
              {getCountDown(
                presaleData,
                presaleData.presaleTimes.startedAt,
                presaleData.presaleTimes.expiredAt
              )}
            </div>
          </div>

          {/* Contianer */}
          <div className="container flex">
            <div className="left-side">
              <div className="section flex flex-col">
                <div className="item flex aic">
                  <div className="lbl font">Presale Address</div>
                  <HREFComponent
                    HREF={presaleData?.hrefLinks?.saleHREF}
                    address={saleID}
                  />
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Token Name</div>
                  <div className={`val font`}>
                    {presaleData?.tokenInfo.name}
                  </div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Token Symbol</div>
                  <div className={`val font `}>
                    {presaleData?.tokenInfo.symbol}
                  </div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Token Decimals</div>
                  <div className={`val font`}>
                    {presaleData?.tokenInfo.decimals}
                  </div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Token Address</div>
                  <HREFComponent
                    HREF={presaleData?.hrefLinks?.tokenHREF}
                    address={presaleData?.tokenInfo.preSaleToken}
                  />
                </div>

                {presaleData?.totalSupply && presaleData.tokenInfo.decimals && (
                  <div className="item flex aic">
                    <div className="lbl font">Total Supply</div>
                    <div className={`val font`}>
                      {/* {`${convertToETHs(presaleData?.totalSupply, presaleData?.tokenInfo.decimals)} ${presaleData?.tokenInfo.symbol}`} */}
                      {`${presaleData.totalSupply
                        .div(decimalFactor)
                        .toString()} ${presaleData?.tokenInfo.symbol}`}
                    </div>
                  </div>
                )}

                <div className="item flex aic">
                  <div className="lbl font">Tokens For Presale</div>
                  <div
                    className={`val font`}
                  >{`${presaleData?.participationCriteria.tokensForSale} ${presaleData?.tokenInfo.symbol}`}</div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Tokens For Liquidity</div>
                  <div className={`val font`}>
                    {`${presaleData?.participationCriteria.tokensPCForLP
                      .mul(
                        presaleData?.participationCriteria.tokensForSale.div(
                          BigNumber.from(100)
                        )
                      )
                      .toString()} ${presaleData?.tokenInfo.symbol}`}
                  </div>
                </div>

                {getSaleType(
                  presaleData.participationCriteria.typeOfPresale
                ) === "TOKENHOLDERS" && (
                  <>
                    <div className="item flex aic">
                      <div className="lbl font">Criteria Token Address</div>
                      <HREFComponent
                        HREF={presaleData?.hrefLinks?.criteriaTokenHREF}
                        address={
                          presaleData.participationCriteria.criteriaToken
                        }
                      />
                    </div>

                    <div className="item flex aic">
                      <div className="lbl font">Criteria Token Name/Symbol</div>
                      <div
                        className={`val font`}
                      >{`${presaleData.participationCriteria.criteriaTokenName} / ${presaleData.participationCriteria.criteriaTokenSymbol}`}</div>
                    </div>

                    <div className="item flex aic">
                      <div className="lbl font">
                        Minimum Tokens for participation
                      </div>
                      <div className={`val font`}>
                        {`${convertToETHs(
                          presaleData.participationCriteria
                            .minTokensForParticipation
                          // presaleData?.tokenInfo.decimals
                        )} ${
                          presaleData.participationCriteria.criteriaTokenSymbol
                        }`}
                      </div>
                    </div>
                  </>
                )}

                {presaleData.participationCriteria.priceOfEachToken && (
                  <div className="item flex aic">
                    <div className="lbl font">Presale Rate</div>
                    <div className={`val font`}>
                      {`1 BNB = ${
                        1 /
                        Number(
                          convertToETHs(
                            presaleData.participationCriteria.priceOfEachToken
                            // presaleData?.tokenInfo.decimals
                            // 18
                          )
                        )
                      } ${presaleData.tokenInfo.symbol}`}
                    </div>
                  </div>
                )}

                <div className="item flex aic">
                  <div className="lbl font">Minimum Purchase</div>
                  <div className={`val font`}>{`${convertToETHs(
                    presaleData?.participationCriteria.priceOfEachToken.mul(
                      presaleData?.reqestedTokens.minTokensReq
                    )
                    // presaleData?.tokenInfo.decimals
                  )} BNB`}</div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Maximum Purchase</div>
                  <div className={`val font`}>{`${convertToETHs(
                    presaleData?.participationCriteria.priceOfEachToken.mul(
                      presaleData?.reqestedTokens.maxTokensReq
                    )
                    // presaleData?.tokenInfo.decimals
                  )} BNB`}</div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Soft Cap</div>
                  <div className={`val font`}>{`${convertToETHs(
                    presaleData?.participationCriteria.priceOfEachToken.mul(
                      presaleData?.reqestedTokens.softCap
                    )
                    // presaleData?.tokenInfo.decimals
                  )} BNB`}</div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Hard Cap</div>
                  <div className={`val font`}>{`${convertToETHs(
                    presaleData?.participationCriteria.priceOfEachToken.mul(
                      presaleData?.participationCriteria.tokensForSale
                    )
                    // presaleData?.tokenInfo.decimals
                  )} BNB`}</div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font">Unsold Tokens</div>
                  <div className={`val font`}>
                    {getRefundType(
                      presaleData?.participationCriteria.refundType
                    )}
                  </div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font"> Presale Start Time </div>
                  <div className={`val font`}>
                    {`${new Date(presaleData.presaleTimes.startedAt * 1000)
                      .toISOString()
                      .slice(0, 10)}  ${new Date(
                      presaleData.presaleTimes.startedAt * 1000
                    )
                      .toISOString()
                      .slice(11, 19)} UTC`}
                  </div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font"> Presale End Time </div>
                  <div className={`val font`}>{`${new Date(
                    presaleData.presaleTimes.expiredAt * 1000
                  )
                    .toISOString()
                    .slice(0, 10)}  ${new Date(
                    presaleData.presaleTimes.expiredAt * 1000
                  )
                    .toISOString()
                    .slice(11, 19)} UTC`}</div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font"> Listing On </div>
                  <HREFComponent
                    HREF="https://pancakeswap.finance/swap"
                    address="PancakeSwap"
                  />
                </div>

                <div className="item flex aic">
                  <div className="lbl font"> Liquidity Percent </div>
                  <div
                    className={`val font`}
                  >{`${presaleData?.participationCriteria.tokensPCForLP} %`}</div>
                </div>

                <div className="item flex aic">
                  <div className="lbl font"> Liquidity Lockup Time </div>
                  <div
                    className={`val font`}
                  >{`${presaleData?.presaleTimes.lpLockupDuration} minutes after pool ends`}</div>
                </div>
              </div>

              {presaleData.presaleInfo.preSaleStatus === 2 &&
                presaleData.contributorsVesting?.isEnabled && (
                  <div className="section whitelisted flex flex-col">
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
                            <div className="tit font">tokens %</div>
                          </div>

                          <div className="col">
                            <div className="tit font">Release status</div>
                          </div>
                        </div>
                        <div className="table-list">
                          {presaleData.contributorsVesting.contributorsVestingSchedule?.map(
                            (item) => (
                              <div key={item.cycle} className="table-row">
                                <div className="col">
                                  <div className="txt font">
                                    {item.cycle + 1}
                                  </div>
                                </div>

                                <div className="col">
                                  <div className="txt font">{`${new Date(
                                    item.releaseTime * 1000
                                  )
                                    .toISOString()
                                    .slice(0, 10)}  ${new Date(
                                    item.releaseTime * 1000
                                  )
                                    .toISOString()
                                    .slice(11, 19)}`}</div>
                                </div>

                                {
                                  <div className="col">
                                    <div className="txt font">{`${item.percentageToRelease} % `}</div>
                                  </div>
                                }

                                {item.releaseStatus !== undefined && (
                                  <div className="col">
                                    <div className="txt font">{`${getTokensReleaseStatus(
                                      item.releaseTime,
                                      item.releaseStatus
                                    )}`}</div>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                        <div className="table-ftr">
                          <button
                            className="cleanbtn ftr-btn font s14 cfff"
                            onClick={handleClaim}
                          >
                            Claim
                          </button>
                        </div>
                      </div>
                    </SettingCard>
                  </div>
                )}

              {presaleData.presaleInfo.preSaleStatus === 2 &&
                presaleData.teamVesting?.isEnabled && (
                  <div className="section whitelisted flex flex-col">
                    <SettingCard title="Locked tokens release schedule">
                      <div className="vesting-table">
                        <div className="table-hdr">
                          <div className="col">
                            <div className="tit font">Unlock #</div>
                          </div>

                          <div className="col">
                            <div className="tit font">Time (UTC)</div>
                          </div>

                          <div className="col">
                            <div className="tit font">tokens</div>
                          </div>

                          <div className="col">
                            <div className="tit font">Status</div>
                          </div>
                        </div>

                        <div className="table-list">
                          {presaleData.teamVesting?.teamVestingSchedule?.map(
                            (item) => (
                              <div key={item.cycle} className="table-row">
                                <div className="col">
                                  <div className="txt font">
                                    {item.cycle + 1}
                                  </div>
                                </div>

                                <div className="col">
                                  <div className="txt font">{`${new Date(
                                    item.releaseTime * 1000
                                  )
                                    .toISOString()
                                    .slice(0, 10)}  ${new Date(
                                    item.releaseTime * 1000
                                  )
                                    .toISOString()
                                    .slice(11, 19)}`}</div>
                                </div>

                                {presaleData?.teamVesting?.vestingTokens && (
                                  <>
                                    <div className="col">
                                      <div className="txt font">{`${presaleData.teamVesting.vestingTokens
                                        .mul(
                                          BigNumber.from(
                                            item.percentageToRelease
                                          ).mul(BigNumber.from(item.tokensPC))
                                        )
                                        .div(BigNumber.from(10000))}`}</div>
                                    </div>

                                    <div className="col">
                                      <div className="txt font">{`${getTokensReleaseStatus(
                                        item.releaseTime,
                                        item.releaseStatus
                                      )}`}</div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )
                          )}
                        </div>
                        <div className="table-ftr">
                          <button
                            className="cleanbtn ftr-btn font s14 cfff"
                            onClick={unlockTokens}
                          >
                            Unlock Tokens
                          </button>
                        </div>
                      </div>
                    </SettingCard>
                  </div>
                )}

              {isOwner &&
                getSaleType(presaleData.participationCriteria.typeOfPresale) ===
                  "WHITELISTED" && (
                  <div className="section whitelisted flex flex-col">
                    <SettingCard title="White List Accounts">
                      <>
                        <textarea
                          onChange={(e) => setWhitelist(e.target.value)}
                          placeholder="Enter all the addresses and separate them with a comma. e.g. 0xE813dxxxxxxxxxxxxxxxxxxxx3D4C32, 0xE8xxxxxxxxxxxxxxxxxxxxfgdd0, 0xE813d7xxxxxxxxxxxxxxxxxxxx4423D4Csf"
                          className="iput area font s14 c000"
                        />
                        <div className="actions flex aic">
                          <button
                            className="button font s14 cfff"
                            onClick={() => handleWhitelList("INCLUDE")}
                          >
                            Add to whitelist
                          </button>
                          <button
                            className="button font s14 cfff"
                            onClick={() => handleWhitelList("REMOVE")}
                          >
                            Remove from whitelist
                          </button>
                        </div>
                      </>
                    </SettingCard>
                  </div>
                )}

              {getSaleType(presaleData.participationCriteria.typeOfPresale) ===
                "WHITELISTED" && (
                <div className="section whitelisted flex flex-col">
                  <SettingCard title="Whitelisted Accounts">
                    {presaleData?.whitelistedUsers?.map((user, index) => (
                      <div className="item flex aic">
                        {/* <div className="lbl font"> {user} </div> */}
                        <div className="lbl font"> {index + 1} </div>
                        <div className={`val font wordwrap`}>{user}</div>
                      </div>
                    ))}
                  </SettingCard>
                </div>
              )}

              <div className="filters-block chart-blk">
                <div className="chart">
                  <Doughnut data={data} options={option} />
                </div>
              </div>
            </div>

            <div className="right-side">
              <div className="buy-form flex flex-col">
                <div className="progress-blk flex aic">
                  <div className="progress-meta flex aic">
                    <div className="lit txt font">
                      Progress (
                      {getProgress(
                        presaleData.participationCriteria.tokensForSale,
                        presaleData.presalectCounts.remainingTokensForSale
                      )}
                      %)
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="bar"
                      style={{
                        width: `${getProgress(
                          presaleData.participationCriteria.tokensForSale,
                          presaleData.presalectCounts.remainingTokensForSale
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="item">
                  <div className="lbl font">Purchase amount</div>
                  <div className="field flex aic">
                    <input
                      type="number"
                      value={purchase ? Number(purchase) : undefined}
                      onChange={(e) => handlePurchase(e.target.value)}
                      className="cleanbtn iput font p-r"
                      placeholder="0.00"
                    />
                    <button
                      onClick={handleMax}
                      className="button font s13 cfff"
                    >
                      Max
                    </button>
                  </div>
                </div>
                {presaleData.presaleInfo.preSaleStatus === 0 ||
                presaleData.presaleInfo.preSaleStatus === 1 ? (
                  <button
                    className="cleanbtn buy-btn font s14 cfff"
                    onClick={handleBuy}
                  >
                    Buy
                  </button>
                ) : null}
              </div>

              <div className="summary-form share-form flex flex-col">
                <div className="block flex flex-col">
                  <div className="hdr flex aic">
                    <div className="lbl font">Your Share</div>
                  </div>

                  <div className="item flex aic">
                    <div className="lbl font">BNBs</div>
                    {
                      // presaleData.participant && (
                      <div className={`val font`}>
                        {" "}
                        {convertToETHs(presaleData.participant?.value)}{" "}
                      </div>
                      // )
                    }
                  </div>

                  <div className="item flex aic">
                    <div className="lbl font">
                      {" "}
                      {`${presaleData.tokenInfo.symbol}`}{" "}
                    </div>
                    {presaleData.participant && (
                      <div className={`val font`}>
                        {presaleData.participant.tokens.toString()}
                      </div>
                    )}
                  </div>

                  <div className="item flex aic">
                    {presaleData.presaleInfo.preSaleStatus === 0 ||
                    presaleData.presaleInfo.preSaleStatus === 1 ? (
                      <button
                        className="cleanbtn buy-btn withdraw font s14 cfff"
                        onClick={emergencyWithdraw}
                      >
                        Emergency Withdraw
                        {/* <Loader
                          size={22}
                          thin={2}
                          backgroundColor={"#fff"}
                          color={"#f65f1f"}
                        /> */}
                      </button>
                    ) : (
                      <button
                        className="cleanbtn buy-btn withdraw font s14 cfff"
                        onClick={handleClaim}
                      >
                        Claim
                        {/* <Loader
                          size={22}
                          thin={2}
                          backgroundColor={"#fff"}
                          color={"#f65f1f"}
                        /> */}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {presaleData.participationCriteria.typeOfPresale ===
                SaleType.TOKENHOLDERS && (
                <div className="summary-form share-form flex flex-col">
                  <div className="block flex flex-col">
                    <div className="hdr flex aic">
                      <div className="lbl font">Criteria Token Balance</div>
                    </div>
                    <div className="item flex aic">
                      <div className="lbl font">
                        {" "}
                        {`${presaleData.participationCriteria.criteriaTokenSymbol}`}{" "}
                      </div>
                      {presaleData.participant && (
                        <div className={`val font`}>
                          {convertToETHs(
                            presaleData.participationCriteria
                              .criteriaTokenBalance
                            // presaleData.tokenInfo.decimals
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="summary-form flex flex-col">
                <div className="block flex flex-col">
                  <div className="item flex aic">
                    <div className="lbl font">Status</div>
                    <div className={`val font`}>
                      {getSaleStatus(presaleData)}
                    </div>
                  </div>

                  <div className="item flex aic">
                    <div className="lbl font">Presale Type</div>
                    <div className={`val font`}>{`${getSaleType(
                      presaleData.participationCriteria.typeOfPresale
                    )}`}</div>
                  </div>

                  <div className="item flex aic">
                    <div className="lbl font">Raised Funds</div>
                    <div className={`val font`}>{getFundsRaised()}</div>
                  </div>

                  <div className="item flex aic">
                    <div className="lbl font">Tokens remaining</div>
                    <div className={`val font`}>{getRemainingTokens()}</div>
                  </div>

                  <div className="item flex aic">
                    <div className="lbl font">Contributors</div>
                    <div className={`val font`}>{getContributors()}</div>
                  </div>

                  <div className="item flex aic">
                    <div className="lbl font">Claims</div>
                    <div className={`val font`}>{getClaimees()}</div>
                  </div>
                </div>
              </div>

              {isOwner && (
                <div className="owner-zone">
                  <div className="hdr flex aic">
                    <div className="title font">Owner Zone</div>
                  </div>
                  <div className="owner-content">
                    <div className="warning-msg font">
                      Make sure there will be no issues during the presale time,
                      please don't send tokens to wallets before you finalize
                      the presale pool.
                    </div>
                    <div className="sale-blk">
                      <div className="label font">Type of Sale</div>

                      <div className="row">
                        <div
                          className="item"
                          onClick={() => handleSaleType(SaleType.PUBLIC)}
                        >
                          <div
                            className={`checkbox ${
                              saleType === SaleType.PUBLIC ? "active" : ""
                            }`}
                          />
                          <div className="lbl font">Public</div>
                        </div>

                        <div
                          className="item"
                          onClick={() => handleSaleType(SaleType.WHITELISTED)}
                        >
                          <div
                            className={`checkbox ${
                              saleType === SaleType.WHITELISTED ? "active" : ""
                            }`}
                          />
                          <div className="lbl font">WhiteListed</div>
                        </div>

                        <div
                          className="item"
                          onClick={() => handleSaleType(SaleType.TOKENHOLDERS)}
                        >
                          <div
                            className={`checkbox ${
                              saleType === SaleType.TOKENHOLDERS ? "active" : ""
                            }`}
                          />
                          <div className="lbl font">Token Holders</div>
                        </div>
                      </div>

                      {saleType === SaleType.TOKENHOLDERS && (
                        <div className="sale-type-form">
                          <div className="field">
                            <input
                              type="text"
                              className="iput font"
                              placeholder="Enter Criteria token address"
                              value={tokenHolderTypeInfo.address}
                              onChange={(e) =>
                                handleTokenInoInput(e.target.value, "ADDRESS")
                              }
                            />
                          </div>
                          <div className="field">
                            <input
                              type="number"
                              className="iput font"
                              placeholder="Enter address"
                              value={tokenHolderTypeInfo.minTokens}
                              onChange={(e) =>
                                handleTokenInoInput(
                                  Number(e.target.value),
                                  "MINTOKENS"
                                )
                              }
                            />
                          </div>
                          <div className="field">
                            <button
                              className="submit-btn font"
                              onClick={() =>
                                handleTokenHolderType(
                                  SaleType.TOKENHOLDERS,
                                  tokenHolderTypeInfo.address,
                                  tokenHolderTypeInfo.minTokens
                                )
                              }
                            >
                              {" "}
                              Submit{" "}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="divider"></div>
                      <div className="pool-actions">
                        <div className="lbl font">Pool Actions</div>
                        <button className="btn font" onClick={finalizePool}>
                          {" "}
                          Finalize Pool{" "}
                        </button>
                        <button className="btn font" onClick={cancelPool}>
                          Cancel Pool
                        </button>
                        {presaleData?.teamVesting?.isEnabled && (
                          <button className="btn font" onClick={unlockTokens}>
                            {" "}
                            Unlock Tokens{" "}
                          </button>
                        )}
                        <button className="btn font" onClick={unlockLPTokens}>
                          {" "}
                          Unlock LP Tokens{" "}
                        </button>
                      </div>
                      <div className="msg font blue">
                        Make sure presale contract is excluded from fees and
                        rewards
                      </div>
                      {/* <div className="exclude-actions">
                        <button className="btn font">Exclude from Fee</button>
                        <button className="btn font">Exclude from Reward</button>
                      </div> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={openEditDailog} onClose={() => setOpenEditDialog(false)}>
        <div className="edit-launchpad-info-modal">
          <button
            className="close-btn font cleanbtn"
            onClick={() => setOpenEditDialog(false)}
          >
            &times;
          </button>
          <ProductDetailModel {...defaulModelData} />
        </div>
      </Modal>
    </>
  );
};

export default ProductDetail;

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
          {}
        </button>
      </div>
      <div className={`form flex flex-col anim ${openSetting ? "sho" : "hid"}`}>
        {children}
      </div>
    </div>
  );
};
