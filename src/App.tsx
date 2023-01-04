import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// react toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// CSS
import "./css/App.scss";

// Screens & Components
import {
  Home,
  Launchpad,
  PreSaleListing,
  ProductDetail,
  LockToken,
  LockedTokenListing,
  LockLPToken,
  LockedLPTokensListing,
  LockedLPTokensDetails,
  LockedTokenDetails,
} from "./screens";
import { Header, Sidebar, CircleProgressLoader } from "./components";
import LockRecord from "./screens/LockRecord";
import LockedLPRecord from "./screens/LockedLPRecord";

function App() {
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);

  return (
    <div className="App">
      <ToastContainer />
      {/* <CircleProgressLoader /> */}
      <BrowserRouter>
        <Header openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        <div className="app-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>

          <Routes>
            <Route path="/launchpad" element={<Launchpad />} />
          </Routes>

          <Routes>
            <Route path="/pre-sale-listing" element={<PreSaleListing />} />
            <Route path="/presale">
              <Route path=":saleID" element={<ProductDetail />} />
            </Route>
          </Routes>

          <Routes>
            <Route path="/lock-token" element={<LockToken />} />
          </Routes>
          <Routes>
            <Route
              path="/locked-token-listing"
              element={<LockedTokenListing />}
            />
          </Routes>

          <Routes>
            <Route
              path="/locked-token-listing/:id"
              element={<LockedTokenDetails />}
            />
          </Routes>

          <Routes>
            <Route
              path="/locked-token-listing/:id/:record"
              element={<LockRecord />}
            />
          </Routes>

          <Routes>
            <Route path="/lock-lp-tokens" element={<LockLPToken />} />
          </Routes>
          <Routes>
            <Route
              path="/locked-lp-tokens"
              element={<LockedLPTokensListing />}
            />
          </Routes>

          <Routes>
            <Route
              path="/locked-lp-tokens/:id"
              element={<LockedLPTokensDetails />}
            />
          </Routes>
          <Routes>
            <Route
              path="/locked-lp-tokens/:id/:record"
              element={<LockedLPRecord />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
