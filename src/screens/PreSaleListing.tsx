import { ethers } from "@usedapp/core/node_modules/ethers";
import React, { useEffect, useState } from "react";
import { SearchIcon } from "../assets/icons";
import { Loader, ProjectCard } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { DataType, getSaleStatus, SalesDataType, setSalesData, setSalesDataLoading, setSalesDataTotalSales, setSalesShowing, getLaunchPadAddress, getPresaleData, checkNetwork } from "../store";
import { Launchpadv2 } from "../typechain"
import InfiniteScroll from "react-infinite-scroll-component";
const Launchpadv2ABI = require("../abis/Launchpadv2.json");

const PreSaleListing = () => {

  const { salesData } = useSelector((state: DataType) => state);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "INPROGRESS" | "ENDED">("ALL");
  const [searchedSale, setSearchedSale] = useState<SalesDataType[] | []>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const pageLimit = 9;
  const fetchLimit = 6;
  const filters: { label: string, value: "ALL" | "PENDING" | "INPROGRESS" | "ENDED" }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "INPROGRESS" },
    { label: "Ended", value: "ENDED" },
  ];

  const fetchData = async () => {

    await checkNetwork();

    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let launchPadAddress = await getLaunchPadAddress(provider)

    const launchpadContract = new ethers.Contract(
      launchPadAddress,
      Launchpadv2ABI.abi,
      provider
    ) as Launchpadv2;

    console.log("launchpadContract ", launchpadContract)

    try {

      const counts = Number(await launchpadContract?.presaleCount());
      dispatch(setSalesDataTotalSales(counts));
      dispatch(setSalesDataLoading(true));
      dispatch(setSalesShowing(pageLimit));
      let sales: SalesDataType[] = [];
      let start = counts;
      let end = counts - pageLimit;

      if (end < 0) {
        end = 0;
      }

      while (start > end) {
        const presaleAddr = await launchpadContract.presaleRecordByID(start);
        const sale = await getPresaleData(presaleAddr);
        sales = [...sales, sale];
        start--
      }

      dispatch(setSalesData(sales));
      dispatch(setSalesDataLoading(false));
    }
    catch (e) {
      console.log(e)
    }

  };

  const fetchMoreData = async () => {

    if (!salesData.totalSales) { return; }

    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let launchPadAddress = await getLaunchPadAddress(provider)


    const launchpadContract = new ethers.Contract(
      launchPadAddress,
      Launchpadv2ABI.abi,
      provider
    ) as Launchpadv2;


    dispatch(setSalesDataLoading(true));

    let sales: SalesDataType[] = [];
    let start = salesData.totalSales - salesData.salesShowing;   // 13-9 = 4
    let end = salesData.totalSales - salesData.salesShowing - fetchLimit // 1
    if (end < 0) {
      end = 0;
    }

    while (start > end) {

      const presaleAddr = await launchpadContract.presaleRecordByID(start);

      if (!presaleAddr) return;
      // console.log("presaleAddr ", presaleAddr);
      const sale = await getPresaleData(presaleAddr);

      sales = [...sales, sale]
      start--

    }

    dispatch(setSalesShowing(salesData.salesShowing + fetchLimit));
    dispatch(setSalesData(sales));
    dispatch(setSalesDataLoading(false));


  }

  const handleSearchedSale = async (address: string) => {

    setSearchedSale([]);

    if (!ethers.utils.isAddress(address)) {
      return;
    }

    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let launchPadAddress = await getLaunchPadAddress(provider)

    const launchpadContract = new ethers.Contract(
      launchPadAddress,
      Launchpadv2ABI.abi,
      provider
    ) as Launchpadv2;

    const presaleAddressByAddress = await launchpadContract.getPresaleRecordsByToken(address);

    if (presaleAddressByAddress.length === 0) {
      alert("This contract address do not exist");
      return;
    }

    setLoading(true)

    presaleAddressByAddress.map(async (presaleAddress: string) => {

      const sale = await getPresaleData(presaleAddress);
      setSearchedSale(pre => ([...pre, sale]));
      setLoading(false)

    })

  }

  useEffect(() => {
    if (salesData.data.length === 0) {
      // dispatch(resetSaleData())
      fetchData();
    }
  }, [])

  return (
    <div className="pre-sale-listing-page">
      <div className="wrapper wrapWidth flex flex-col">

        <div className="filters-block">
          <div className="hdr flex aic">
            <div className="label font s18 b6 c000">
              <span className="color">Pre-Sale</span>&nbsp;Listing
            </div>
            <div className="actions flex aic">
              {filters.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setFilter(item.value)}
                  className={`btn font s14 anim c000 ${item.value === filter ? "active" : ""
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
              onChange={(e) => handleSearchedSale(e.target.value)}
              placeholder="Search by token address..."
              className="cleanbtn iput font s14"
            />
          </div>
        </div>

        {
          loading ?
            <div className="loader">
              <br />
              <Loader />
              <br />
            </div>
            :
            searchedSale.length > 0 ?
              <div className="content flex">
                {
                  searchedSale.map((sale) => {
                    return (
                      < ProjectCard {...sale} key={sale.saleAddress} />
                    )
                  }
                  )}
              </div>
              :
              <>
                <InfiniteScroll
                  dataLength={salesData.data.length}
                  next={fetchMoreData}
                  hasMore={salesData.salesShowing < salesData.totalSales}
                  loader={
                    <div className="loader">
                      {/* <br />
                        <Loader />
                      <br /> */}
                    </div>}
                >
                  <div className="content flex">
                    {
                      salesData.data && salesData.data.map((sale) => {
                        if (filter === "ALL") {
                          return (
                            < ProjectCard {...sale} key={sale.saleAddress} />
                          )
                        }

                        else if (filter === "PENDING" && getSaleStatus(sale) === "PENDING") {
                          return (
                            < ProjectCard {...sale} key={sale.saleAddress} />
                          )
                        }

                        else if (filter === "INPROGRESS" && getSaleStatus(sale) === "INPROGRESS") {
                          return (
                            < ProjectCard {...sale} key={sale.saleAddress} />
                          )
                        }

                        else if (filter === "ENDED") {
                          if (getSaleStatus(sale) === "SUCCEED" || getSaleStatus(sale) === "FAILED" || getSaleStatus(sale) === "CANCELED") {
                            return (
                              < ProjectCard {...sale} key={sale.saleAddress} />
                            )
                          }
                        }

                      })
                    }
                  </div>
                </InfiniteScroll>

                {
                  salesData.loading && (
                    <div className="loader">
                      <br />
                      <Loader />
                      <br />
                    </div>
                  )
                }

                <br />
                <br />
              </>
        }



      </div>
    </div>
  );


};

export default PreSaleListing;
