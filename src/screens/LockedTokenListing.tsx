import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, ArrowLeftIcon, ArrowRightIcon } from "../assets/icons";
import { ethers } from "@usedapp/core/node_modules/ethers";
import { Loader, ProjectCard } from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  DataType,
  RefundType,
  SaleType,
  getSaleStatus,
  SalesDataType,
  setSalesData,
  setSalesDataLoading,
  setSalesDataTotalSales,
  setSalesShowing,
  getSaleType,
  getLaunchPadAddress,
  getPresaleData,
  resetSaleData,
  LockDataType,
} from "../store";

import { Launchpadv2, BEP20, Presale } from "../typechain";

import InfiniteScroll from "react-infinite-scroll-component";
import ComingSoon from "../components/ComingSoon";

// const PresaleABI = require("../abis/Presale.json");
const Launchpadv2ABI = require("../abis/Launchpadv2.json");

const LockedTokenListing = () => {
  // const { salesData } = useSelector((state: DataType) => state);
  // const [filter, setFilter] = useState<"ALL" | "PENDING" | "INPROGRESS" | "ENDED">("ALL");
  // console.log("filter ", filter)

  // const dispatch = useDispatch();
  // const pageLimit = 9;
  // const fetchLimit = 6;

  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("visit");

  const filters = [
    { label: "All", value: "all" },
    { label: "My lock", value: "my-lock" },
  ];

  const [tokenListing, setTokenListing] = useState([
    {
      token: "PICNIC",
      tokenUnit: "$PIC",
      amount: "10 000.00 $PIC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "PICNIC",
      tokenUnit: "$PIC",
      amount: "10 000.00 $PIC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "PICNIC",
      tokenUnit: "$PIC",
      amount: "10 000.00 $PIC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "PICNIC",
      tokenUnit: "$PIC",
      amount: "10 000.00 $PIC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "PICNIC",
      tokenUnit: "$PIC",
      amount: "10 000.00 $PIC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "PICNIC",
      tokenUnit: "$PIC",
      amount: "10 000.00 $PIC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "PICNIC",
      tokenUnit: "$PIC",
      amount: "10 000.00 $PIC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "PICNIC",
      tokenUnit: "$PIC",
      amount: "10 000.00 $PIC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
  ]);

  const [lockInfo, setLockInfo] = useState([
    { label: "Total Amount Locked", value: "2 000.00 $PIC" },
    { label: "Total Values Locked", value: "0$" },
    {
      label: "Token Address",
      value: "0xECB972692dceFc51e9B45e096C7A0b1411019e9b",
      type: "link",
    },
    { label: "Token Name", value: "PICNIC" },
    { label: "Token Symbol", value: "$PIC" },
    { label: "Token Decimals", value: "9" },
  ]);

  const [lockedRecord, setLockedRecord] = useState([
    {
      wallet_address: "0x4d4e...553e",
      amount: "10.98",
      unlocked: "2021/12/28 23:40 UTC",
    },
  ]);

  const fetchData = async () => {
    // let provider = new ethers.providers.Web3Provider(window.ethereum);
    // let launchPadAddress = await getLaunchPadAddress(provider)
    // const launchpadContract = new ethers.Contract(
    //   launchPadAddress,
    //   Launchpadv2ABI.abi,
    //   provider
    // ) as Launchpadv2;
    // const counts = Number(await launchpadContract?.presaleCount());
    // dispatch(setSalesDataTotalSales(counts));
    // dispatch(setSalesDataLoading(true));
    // dispatch(setSalesShowing(pageLimit));
    // let sales: LockDataType[] = [];
    // let start = counts;
    // let end = counts - pageLimit;
    // if (end < 0) {
    //   end = 0;
    // }
    // while (start > end) {
    //   const presaleAddr = await launchpadContract.presaleRecordByID(start);
    //   const sale = await getPresaleData(presaleAddr);
    //   sales = [...sales, sale];
    //   start--
    // }
    // dispatch(setSalesData(sales));
    // dispatch(setSalesDataLoading(false));
  };

  return <ComingSoon />;

  return (
    <div className="locked-token-listing-p">
      <div className="wrapper wrapWidth flex flex-col">
        <div className="filters-block">
          <div className="hdr flex aic">
            <div className="label font s18 b6 c000">
              <span className="color">Locked</span>&nbsp;Token Listing
            </div>
            <div className="actions flex aic">
              {filters.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setFilter(item.value)}
                  className={`btn font s14 anim c7d ${
                    item.value === filter ? "active" : ""
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="search-field flex aic">
            <div className="icon">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search by token address..."
              className="cleanbtn iput font s14"
            />
          </div>
        </div>
        <div className="table-content">
          <div className="hdr row flex aic">
            <div className="col">
              <div className="label font">Token</div>
            </div>
            <div className="col">
              <div className="label font">Amount</div>
            </div>
            <div className="col">
              <div className="label font">Locked</div>
            </div>
            <div className="col">
              <div className="label font">Unlocked</div>
            </div>
            <div className="col"></div>
          </div>
          {tokenListing.map((item, index) => (
            <div className="row">
              <div className="col">
                <div className="meta flex aic">
                  <div className="img flex aic">
                    <img
                      src={require("../assets/images/union.png").default}
                      className="icon"
                    />
                  </div>
                  <div className="name flex flex-col">
                    <div className="lbl font s14 c000">{item.token}</div>
                    <div className="font s13 b3 ccc">{item.tokenUnit}</div>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="text font">{item.token}</div>
              </div>
              <div className="col">
                <div className="text font">{item.locked}</div>
              </div>
              <div className="col">
                <div className="text font">{item.unlocked}</div>
              </div>
              <div className="col">
                <Link
                  to="/locked-token-listing/detail"
                  className="cleanbtn view-all-btn font s14 blue"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination flex aic">
          <button className="prev-btn">
            <ArrowLeftIcon />
          </button>
          <div className="pages flex aic">
            <button className="cleanbtn page-num font s14 active">1</button>
            <button className="cleanbtn page-num font s14">2</button>
            <button className="cleanbtn page-num font s14">3</button>
            <button className="cleanbtn page-num font s14">4</button>
            <button className="cleanbtn page-num font s14">5</button>
          </div>
          <button className="next-btn">
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockedTokenListing;
