import { Link } from "react-router-dom";
import {
  MdOutlineHome,
  MdOutlineCalendarMonth,
  MdOutlineSchool,
  MdQuestionMark,
  MdCloudySnowing,
  MdSos,
  MdPowerSettingsNew,
} from "react-icons/md";

const Sidebar = ({ showMenu }) => {
  return (
    <div
      className={`bg-[#000031] fixed top-0 h-full w-28 flex flex-col justify-between py-6 z-50 transition-all duration-300 ease-in-out ${
        showMenu ? "left-0" : "-left-full lg:left-0"
      }`}
    >
      {/* Sección superior del Sidebar */}
      <div className="overflow-y-auto">
        <ul className="space-y-2 px-2">
          {/* Logo */}
          <li className="mb-6 flex justify-center">
            <img 
              src="/Logo_Motoclub_BSK_Motorcycle_Team_SVG_500X500_white.svg" 
              alt="Logo BSK" 
              className="w-20 h-20 object-contain"
            />
          </li>

          {/* Elementos del menú */}
          {[
            { icon: <MdOutlineHome />, path: "/", active: true },
            { icon: <MdOutlineCalendarMonth />, path: "/events" },
            { icon: <MdOutlineSchool />, path: "/courses" },
            { icon: <MdQuestionMark />, path: "/faq" },
            { icon: <MdCloudySnowing />, path: "/weather" },
            { icon: <MdSos />, path: "/emergency" },
          ].map((item, index) => (
            <li key={index} className="group">
              <Link
                to={item.path}
                state={{ showMenu: true }}
                className={`flex justify-center p-4 rounded-xl transition-colors duration-200 ${
                  item.active 
                    ? "bg-[#00ff99] text-white" 
                    : "text-[#ffffff] hover:bg-[#00ff99] hover:text-white"
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Sección inferior del Sidebar */}
      <div className="px-2">
        <ul>
          <li className="group">
            <a
              href="#"
              className="flex justify-center p-4 rounded-xl text-[#ff0000] hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
            >
              <MdPowerSettingsNew className="text-2xl" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;