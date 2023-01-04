import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { NavLink, Link } from "react-router-dom";

import {
  AuditIcon,
  DiscordIcon,
  ProductsIcon,
  LinkIcon,
  SendIcon,
  TwitterIcon,
  MediumIcon
} from "../assets/icons";

interface SidebarProps {
  openSidebar: boolean;
  setOpenSidebar: Dispatch<SetStateAction<boolean>>;
}

const Sidebar = (props: SidebarProps): JSX.Element => {
  const { openSidebar, setOpenSidebar } = props;

  const [homeNav, setHomeNav] = useState([
    {
      title: "— Presale",
      links: [
        { label: "Launchpad", slug: "/launchpad", status: "live" },
        { label: "Presale Listing", slug: "/pre-sale-listing", status: "live" },
      ],
    },
    {
      title: "— BEP20 Tokens",
      links: [
        { label: "Token Locker", slug: "/lock-token", status: "coming soon" },
        {
          label: "Lockers Listing",
          slug: "/locked-token-listing",
          status: "coming soon",
        },
      ],
    },
    {
      title: "— Liquidity Tokens",
      links: [
        { label: "LP Locker", slug: "/lock-lp-tokens", status: "coming soon" },
        {
          label: "LP Lockers Listing",
          slug: "/locked-lp-tokens",
          status: "coming soon",
        },
      ],
    },
  ]);

  const socialLinks = [
    { icon: <SendIcon />, slug: "https://t.me/Cheems_Pad" },
    { icon: <TwitterIcon />, slug: "https://twitter.com/CheemsPad" },
    { icon: <MediumIcon />, slug: "https://memetech.medium.com/cheemspad-e264fe44ba1d" },
    // { icon: <DiscordIcon />, slug: "https://Discord.gg/newblockcity" },
  ];

  useEffect(() => {
    window.addEventListener("click", () => {
      setOpenSidebar(false);
    });
  }, [openSidebar]);

  return (
    <>
      {openSidebar && <div className="sidebar_overlay" />}
      <div
        className={`sidebar-cmp flex flex-col ${
          openSidebar ? "open" : "close"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="cross-btn font"
          onClick={() => setOpenSidebar(false)}
        >
          &times;
        </button>
        <div className="sidebar-hdr">
          <Link to="/" className="logo" onClick={() => setOpenSidebar(false)}>
            <img className="img" src={require("../assets/logo3.png").default} />
          </Link>
        </div>
        <div className="wrap">
          <div className="meta flex aic">
            <div className="ico">
              <ProductsIcon />
            </div>
            <div className="lbl font s17 c000">Products</div>
          </div>
          <div className="nav flex flex-col">
            {homeNav.map((item, index) => (
              <>
                <div className="title font blue s15 amim">{item.title}</div>
                {item.links.map((link, key) => (
                  <NavLink
                    key={key}
                    to={link.slug}
                    className="link flex aic anim"
                    onClick={() => setOpenSidebar(false)}
                  >
                    <div className="lbl font c000 s15 anim">{link.label} </div>
                  </NavLink>
                ))}
              </>
            ))}
          </div>
        </div>
        <div className="social-links flex aic">
          {socialLinks.map((item, index) => (
            <a
              key={index}
              href={item.slug}
              className="icon"
              target="_blank"
              // onClick={() => setOpenSidebar(false)}
            >
              {item.icon}
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
