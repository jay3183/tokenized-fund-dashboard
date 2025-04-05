import { useRole } from '../App';
import { useEffect, useRef } from 'react';

export default function Header({ onToggleTheme }) {
  const { role, setRole } = useRole();
  const themeButtonRef = useRef(null);

  // Save role to localStorage
  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#003057] text-white shadow-md border-b border-[#0072CE]/30 print:hidden">
      <div className="flex items-center gap-2">
        {/* Logo placeholder - using a styled div instead of an image */}
        <div className="h-8 w-10 bg-white rounded-sm flex items-center justify-center text-[#003057] font-bold text-xs">FT</div>
        <h1 className="text-2xl font-bold text-white">Franklin Templeton Fund Dashboard</h1>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        <span className="text-sm hidden sm:inline">Logged in as:</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-white/30 rounded px-2 py-1 text-sm bg-[#003057] text-white focus:ring focus:ring-[#0072CE]/30 outline-none"
        >
          <option value="INVESTOR">Investor</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          onClick={handlePrint}
          className="text-xs bg-[#0072CE] hover:bg-[#0061B0] transition-all duration-300 text-white px-3 py-1 rounded"
          aria-label="Print Report"
        >
          Print Report
        </button>
        {/* Replace button with div to avoid focus issues completely */}
        <div
          onClick={onToggleTheme}
          className="text-xs bg-[#0072CE] hover:bg-[#0061B0] transition-all duration-300 text-white px-3 py-1 rounded cursor-pointer select-none"
          aria-label="Toggle Theme"
          role="button"
        >
          Toggle Theme
        </div>
      </div>
    </header>
  );
} 