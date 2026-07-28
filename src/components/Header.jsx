import { memo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { Bell } from "lucide-react";

const Header = memo(({ toggleSidebar, currentPageTitle }) => {
  const { themeColors } = useTheme();
  const { currentFont } = useFont();

  return (
    <header
      className="h-16 flex items-center justify-between px-4 border-b backdrop-blur-sm sticky top-0 z-40"
      style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}
    >
      <div className="flex items-center min-w-0 flex-1">
        <button
          onClick={toggleSidebar}
          className="lg:hidden mr-3 p-1.5 rounded-md hover:scale-110 transition-all duration-200"
          style={{ color: themeColors.text, backgroundColor: themeColors.background }}
          aria-label="Open sidebar"
        >
          <span className="text-base">☰</span>
        </button>
        <h2
          className="text-sm font-semibold truncate"
          style={{ color: themeColors.text, fontFamily: currentFont?.family }}
        >
          {currentPageTitle}
        </h2>
      </div>

      <div className="flex items-center space-x-2">
        <button
          className="relative p-2 rounded-lg transition-all hover:scale-110"
          style={{ color: themeColors.text, backgroundColor: themeColors.background }}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
});

Header.displayName = "Header";
export default Header;
