import { createContext, useContext, useEffect, useState } from "react";

const premiumFonts = {
  inter:       { key: "inter",       label: "Inter",           css: `"Inter", sans-serif`,       google: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",       family: "Inter, sans-serif" },
  poppins:     { key: "poppins",     label: "Poppins",         css: `"Poppins", sans-serif`,     google: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",     family: "Poppins, sans-serif" },
  montserrat:  { key: "montserrat",  label: "Montserrat",      css: `"Montserrat", sans-serif`,  google: "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",  family: "Montserrat, sans-serif" },
  system:      { key: "system",      label: "System UI",       css: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`, google: null, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
};

const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [fontKey, setFontKey] = useState(() => localStorage.getItem("appFont") || "inter");

  useEffect(() => {
    const font = premiumFonts[fontKey] || premiumFonts.inter;
    document.documentElement.style.setProperty("--app-font", font.css);
    const prev = document.getElementById("app-font-link");
    if (prev) prev.remove();
    if (font.google) {
      const link = document.createElement("link");
      link.id = "app-font-link"; link.rel = "stylesheet"; link.href = font.google;
      document.head.appendChild(link);
    }
    localStorage.setItem("appFont", fontKey);
  }, [fontKey]);

  const changeFont = (key) => { if (premiumFonts[key]) setFontKey(key); };

  return (
    <FontContext.Provider value={{ currentFont: premiumFonts[fontKey], fontKey, premiumFonts, changeFont }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => useContext(FontContext);
