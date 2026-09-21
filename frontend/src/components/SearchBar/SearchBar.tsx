import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setSearchQuery, setSelectedCity } from '../../store/slices/userSlice';
import { CITIES } from '../../utils/constants';

interface SearchBarProps {
  onSearchSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchSubmit }) => {
  const dispatch = useDispatch();
  const { searchQuery, selectedCity } = useSelector((state: RootState) => state.user);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    dispatch(setSearchQuery(val));
  };

  const handleClear = () => {
    setLocalQuery('');
    dispatch(setSearchQuery(''));
  };

  const handleCitySelect = (city: string) => {
    dispatch(setSelectedCity(city));
    setIsCityDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <div className="search-container">
      {/* Search Input Box */}
      <div className="search-input-box">
        <Search className="search-icon" />
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for cars, bikes, phones, furniture and more..."
          autoComplete="off"
        />
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="clear-search-btn"
            aria-label="Clear search"
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        )}
      </div>

      {/* Location Picker Button */}
      <div
        className={`location-picker-btn ${isCityDropdownOpen ? 'open' : ''}`}
        ref={dropdownRef}
        onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
      >
        <MapPin className="location-icon" />
        <span>{selectedCity}</span>
        <ChevronDown className="chevron-icon" />

        {/* Dropdown Menu */}
        <div className="location-dropdown-menu">
          <div className="dropdown-header">Select Location</div>
          {CITIES.map((city) => (
            <div
              key={city}
              onClick={(e) => {
                e.stopPropagation();
                handleCitySelect(city);
              }}
              className={`dropdown-item ${selectedCity === city ? 'active' : ''}`}
            >
              {city}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
