import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { Search, Menu, X, Home, MapPin, ChevronDown, Video, Image as ImageIcon, Folder } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenMobileMenu }) => {
  const { categories, districts, navigateToHome, navigateToCategory, navigateToDistrict, navigateToLibrary, currentView, selectedCategorySlug, selectedDistrictSlug } = useNews();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Main featured categories to show directly in nav bar
  const mainCats = categories.slice(0, 9);
  const moreCats = categories.slice(9);

  return (
    <nav className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        
        {/* Home Button */}
        <div className="flex items-center">
          <button 
            onClick={navigateToHome}
            className={`flex items-center gap-1.5 px-3.5 py-3 font-semibold text-sm hover:bg-emerald-700 transition ${currentView === 'home' ? 'bg-emerald-900 border-b-2 border-amber-400' : ''}`}
            aria-label="হোম"
          >
            <Home className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">হোম</span>
          </button>
        </div>

        {/* Desktop Category Navigation */}
        <div className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
          {mainCats.map(cat => {
            const isActive = currentView === 'category' && selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => navigateToCategory(cat.slug)}
                className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap rounded hover:bg-emerald-700 transition ${isActive ? 'bg-emerald-900 text-amber-300 font-bold border-b-2 border-amber-400' : 'text-slate-100'}`}
              >
                {cat.name}
              </button>
            );
          })}

          {/* More Categories Dropdown */}
          {moreCats.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-slate-100 hover:bg-emerald-700 rounded transition"
              >
                <span>আরও</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-white text-slate-800 rounded-md shadow-xl py-2 z-50 border border-slate-200">
                  {moreCats.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        navigateToCategory(cat.slug);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-800 transition font-medium"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons (Search & Mobile Menu) */}
        <div className="flex items-center gap-2 py-2">
          {/* District Quick Badges */}
          <div className="hidden md:flex items-center gap-1 bg-emerald-900/80 px-2 py-1 rounded text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-slate-300 mr-1">জেলা:</span>
            {districts.map(d => (
              <button 
                key={d.id}
                onClick={() => navigateToDistrict(d.slug)}
                className={`px-2 py-0.5 rounded hover:bg-emerald-700 transition ${selectedDistrictSlug === d.slug ? 'bg-amber-400 text-slate-900 font-bold' : 'text-slate-200'}`}
              >
                {d.name}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-full hover:bg-emerald-700 text-slate-100 hover:text-white transition flex items-center gap-1.5 text-sm font-medium"
            title="খুঁজুন"
            aria-label="খুঁজুন"
          >
            <Search className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">অনুসন্ধান</span>
          </button>

          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-emerald-700 text-slate-100 transition"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

      </div>
    </nav>
  );
};
