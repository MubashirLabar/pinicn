import React, { useEffect, useState } from "react";
import { BagIcon, CartIcon, LockIcon } from "../assets/icons";
import { Loader, ProjectCard } from "../components";
import { Link } from "react-router-dom";
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
} from "../store";
import { ethers } from "@usedapp/core/node_modules/ethers";
import { Launchpadv2, BEP20, Presale } from "../typechain";
import { useNavigate } from "react-router-dom";
const Launchpadv2ABI = require("../abis/Launchpadv2.json");

const Home = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [projectCount, setProjectCount] = useState<number>();
  const [homePageSales, setHomePageSales] = useState<SalesDataType[] | []>([]);
  const saleCardsToShow = 3;
  const navigate = useNavigate();

  const fetchData = async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let launchPadAddress = await getLaunchPadAddress(provider);

    setLoading(true);

    try {
      const launchpadContract = new ethers.Contract(
        launchPadAddress,
        Launchpadv2ABI.abi,
        provider
      ) as Launchpadv2;

      const counts = Number(await launchpadContract?.presaleCount());
      setProjectCount(counts);
      let sales: SalesDataType[] = [];
      let start = counts; //10
      let end = counts - saleCardsToShow; //7
      if (end < 0) {
        end = 0;
      }

      while (start > end) {
        const presaleAddr = await launchpadContract.presaleRecordByID(start);
        if (presaleAddr !== "0x0000000000000000000000000000000000000000") {
          const sale = await getPresaleData(presaleAddr);
          sales = [...sales, sale];
        }
        start--;

      }
      
      setHomePageSales(sales);

    }
    catch (e) {
      console.log(e);
    }

    setLoading(false);

  };

  const directToPage = (to: "launchpad" | "presale") => {
    if (to === "launchpad") {
      navigate("/launchpad", { replace: true });
    } else {
      navigate("/pre-sale-listing", { replace: true });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Intro section */}
      <div className="intro-section">
        <div className="wrapWidth flex flex-col">
          <div className="intro flex flex-col aic">
            <div className="tag font s36 b5 color">CHEEMSPAD</div>
            <div className="slogn font s34 b6 c000">
              Token Sale Launchpad for Everyone
            </div>
            <div className="text font s15">
              CHEEMSPAD is the home of safe coin launches.
            </div>
          </div>
          <div className="actions flex aic">
            <button
              className="button font s14 cfff"
              onClick={() => directToPage("presale")}
            >
              Presale Listings
            </button>

            <button
              className="button blue-bg font s14 cfff"
              onClick={() => directToPage("launchpad")}
            >
              Create Presale
            </button>
          </div>
        </div>
      </div>

      {/* Statics section */}
      <div className="statics-section">
        <div className="wrapWidth flex flex-col">
          <div className="wrap flex aic">
            
            {
              projectCount !== undefined && (
                <div className="item">
                  <div className="num font">{projectCount}</div>
                  <div className="lbl font">Launches</div>
                </div>
              )
            }

            {/* <div className="item">
              <div className="num font">1512$</div>
              <div className="lbl font">Total Values Locked</div>
            </div>
            <div className="item">
              <div className="num font">7 800</div>
              <div className="lbl font">Total Projects</div>
            </div>
            <div className="item">
              <div className="num font">13 867</div>
              <div className="lbl font">Total Liquidity</div>
            </div> */}
          </div>
          <div className="supports flex aic">
            <div className="lbl font s15 b5 c000">We Currently Support:</div>
            <div className="logos flex aic">
              {/* <img
                src={require("../assets/images/pic-logo.png").default}
                className="img"
              /> */}
              <img
                src={require("../assets/images/bnb-logo.png").default}
                className="img"
              />
              {/* <img
                src={require("../assets/images/eth-logo.svg").default}
                className="img"
              /> */}
            </div>
          </div>
        </div>
      </div>

      {/* Road Map Section */}
      <div className="roadmap-section">
        <div className="wrapper wrapWidth flex flex-col aic">
          <div className="meta ">
            <div className="title font s30 b6 c000 flex flex-col aic">
              <span className="color">Tools </span>
              <span>for Token Sales</span>
            </div>
            <div className="disc font s14">
              We will help you create and manage your token
            </div>
          </div>

          <section className="ps-timeline-sec">
            <div className="container">
              <ol className="ps-timeline">
                <li>
                  <div className="img-handler-top">
                    <div className="item flex flex-col aic">
                      <div className="icon">
                        <CartIcon />
                      </div>
                      <div className="lbl font s13 c000">
                        CHEEMSPAD <span className="blue">LaunchPad</span>
                      </div>
                    </div>
                  </div>
                  <span className="ps-sp">
                    <div className="small-circle font s14 b5 c000">01</div>
                  </span>
                </li>
                <li>
                  <div className="img-handler-bot">
                    <div className="item flex flex-col aic">
                      <div className="lbl font s13 c000">
                        CHEEMSPAD <span className="blue">Presale</span>
                      </div>
                      <div className="icon">
                        <LockIcon />
                      </div>
                    </div>
                  </div>
                  <span className="ps-sp">
                    <div className="small-circle font s14 b5 c000">02</div>
                  </span>
                </li>

                <li>
                  <div className="img-handler-top third">
                    <div className="item flex flex-col aic">
                      <div className="icon">
                        <BagIcon />
                      </div>
                      <div className="lbl font s13 c000">
                        CHEEMSPAD <span className="blue">Locker</span>
                      </div>
                    </div>
                  </div>
                  <span className="ps-sp">
                    <div className="small-circle font s14 b5 c000">03</div>
                  </span>
                </li>
              </ol>
            </div>
          </section>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        <div className="wrapper wrapWidth flex flex-col">
          <div className="title font s30 b6 c000">
            <span className="color">Last Projects </span>Pre-Sale on CHEEMSPAD
          </div>
          {loading ? (
            <div className="loader">
              <Loader />
            </div>
          ) : homePageSales.length > 0 ? (
            <div className="projects flex aic">
              <div className="content flex">
                {homePageSales.map((sale) => {
                  return <ProjectCard {...sale} key={sale.saleAddress} />;
                })}
              </div>
            </div>
          ) : null}
          <div className="ftr flex aic">
            <Link to="/pre-sale-listing" className="show-all-btn font anim">
              Show All Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Join section */}
      <div className="join-section">
        <div className="wrapper wrapWidth flex flex-col aic">
          {/* <div className="tag font s15">Pre-Sale</div> */}

          <div className="title font s30 b6 c000">
            <span className="color">Join</span> our latest presale today
          </div>

          {/* <Link to="/" className="pre-sale-btn font anim">
            Go To Pre-Sale Selection
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
