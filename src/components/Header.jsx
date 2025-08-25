import React from "react";
import Logo from '../images/marq_logo.png';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon} from 'react-icons/fa';


const Header = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header className="fixed top-0 left-0 bg-[#b0142c] text-white flex justify-between items-center w-full h-16 md:h-[70px] px-3 md:px-4 shadow-lg z-[11000]">
      <div className="flex items-center gap-2 md:gap-3">
        <img src={Logo} alt="Marquette Logo" className="h-8 md:h-12 object-contain" />
        <div className="flex items-center gap-1 md:gap-2">
          <span className="text-lg md:text-xl font-heavy">Orientation Assessment</span>
        </div>
      </div>
      <button
        onClick={toggleDarkMode}
        className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <FaSun size={24} color="white" />
        ) : (
          <FaMoon size={24} color="white" />
        )}
      </button>
    </header>
  );
};

export default Header;