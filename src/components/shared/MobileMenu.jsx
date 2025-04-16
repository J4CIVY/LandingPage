import {
  RiUser3Line,
  RiAddLine,
  RiPieChartLine,
  RiMenu3Fill,
  RiCloseLine,
} from "react-icons/ri";

const MobileMenu = ({ showMenu, toggleMenu, toggleOrders }) => {
  return (
    <nav
      className={`bg-[#000031] lg:hidden fixed bottom-0 left-0 w-full text-3xl text-[#ffffff] py-2 px-8 flex items-center justify-between z-40 transition-all duration-300 ${
        showMenu ? "pl-36" : "pl-10"
      }`}
    >
      <button className="p-2">
        <RiUser3Line />
      </button>
      <button className="p-2">
        <RiAddLine />
      </button>
      <button onClick={toggleOrders} className="p-2">
        <RiPieChartLine />
      </button>
      <button onClick={toggleMenu} className="text-white p-2">
        {showMenu ? <RiCloseLine /> : <RiMenu3Fill />}
      </button>
    </nav>
  );
};

export default MobileMenu;