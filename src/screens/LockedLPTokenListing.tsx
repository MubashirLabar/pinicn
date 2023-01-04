import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, ArrowLeftIcon, ArrowRightIcon } from "../assets/icons";
import ComingSoon from "../components/ComingSoon";

const LockedLPTokensListing = () => {
  const [filter, setFilter] = useState("all");

  const filters = [
    { label: "All", value: "all" },
    { label: "My lock", value: "my-lock" },
  ];

  const [tokenListing, setTokenListing] = useState([
    {
      token: "ABC",
      tokenUnit: "$ABC",
      amount: "10 000.00 $ABC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "ABC",
      tokenUnit: "$ABC",
      amount: "10 000.00 $ABC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "ABC",
      tokenUnit: "$ABC",
      amount: "10 000.00 $ABC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "ABC",
      tokenUnit: "$ABC",
      amount: "10 000.00 $ABC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "ABC",
      tokenUnit: "$ABC",
      amount: "10 000.00 $ABC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "ABC",
      tokenUnit: "$ABC",
      amount: "10 000.00 $ABC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "ABC",
      tokenUnit: "$ABC",
      amount: "10 000.00 $ABC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
    {
      token: "ABC",
      tokenUnit: "$ABC",
      amount: "10 000.00 $ABC",
      locked: "2021/12/21 23:40 UTC",
      unlocked: "2021/01/21 20:00 UTC",
    },
  ]);

  return <ComingSoon />;

  return (
    <div className="locked-token-listing-p">
      <div className="wrapper wrapWidth flex flex-col">
        <div className="filters-block">
          <div className="hdr flex aic">
            <div className="label font s18 b6 c000">
              <span className="color">Locked</span>&nbsp;LP Tokens
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
                  to="/locked-lp-tokens/detail"
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

export default LockedLPTokensListing;
