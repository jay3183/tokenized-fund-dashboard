import { useEffect, useRef, useState } from 'react';

export default function Header({ role, toggleRole, darkMode, toggleDarkMode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };
  
  // Prevent default link behavior
  const handleThemeToggle = (e) => {
    e.preventDefault();
    toggleDarkMode();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#003057] text-white shadow-md border-b border-[#0072CE]/30 print:hidden">
      <div className="flex items-center gap-2">
        {/* Logo placeholder - using a styled div instead of an image */}
        <div className="h-8 w-10 bg-white rounded-sm flex items-center justify-center text-[#003057] font-bold text-xs">FT</div>
        <h1 className="text-2xl font-bold text-white">Franklin Templeton Fund Dashboard</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="text-sm hidden sm:inline">Logged in as:</span>
        
        {/* Role dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="border border-white/30 rounded px-3 py-1 text-sm bg-[#003057] text-white cursor-pointer flex items-center min-w-[95px] justify-between"
          >
            <span>{role}</span>
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-[#003057] border border-white/30 rounded shadow-lg z-10 w-full">
              <div 
                className={`px-3 py-1.5 hover:bg-[#0072CE] cursor-pointer ${role === 'INVESTOR' ? 'bg-[#0072CE]/30 font-medium' : ''}`}
                onClick={() => { toggleRole(); setDropdownOpen(false); }}
              >
                Investor
              </div>
              <div 
                className={`px-3 py-1.5 hover:bg-[#0072CE] cursor-pointer ${role === 'ADMIN' ? 'bg-[#0072CE]/30 font-medium' : ''}`}
                onClick={() => { toggleRole(); setDropdownOpen(false); }}
              >
                Admin
              </div>
            </div>
          )}
        </div>
        
        <nav className="flex items-center gap-3">
          {/* Using plain a elements instead of buttons or divs */}
          <a 
            href="#" 
            onClick={handlePrint}
            className="inline-block text-xs bg-[#0072CE] hover:bg-[#0061B0] px-3 py-1 rounded no-underline text-white"
          >
            Print Report
          </a>
          
          <a 
            href="#" 
            onClick={handleThemeToggle}
            className="inline-block text-xs bg-[#0072CE] hover:bg-[#0061B0] px-3 py-1 rounded no-underline text-white"
          >
            Toggle Theme
          </a>
        </nav>
      </div>
    </header>
  );
} 