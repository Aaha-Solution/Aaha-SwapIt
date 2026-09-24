import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, ChevronDown, Clock, ArrowRight, Tag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setSearchQuery, setSelectedCity, setSelectedCategory, openProductDetails } from '../../store/slices/userSlice';
import { CITIES } from '../../utils/constants';
import { productApi } from '../../api/product.api';
import { SearchSuggestionResult } from '../../types/product.types';

interface SearchBarProps {
  onSearchSubmit?: () => void;
}

const RECENT_SEARCHES_KEY = 'swapit_recent_searches';

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchSubmit }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchQuery, selectedCity } = useSelector((state: RootState) => state.user);
  
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionResult>({ products: [], categories: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['iPhone 13', 'MacBook', 'Bicycle', 'Royal Enfield'];
    } catch {
      return ['iPhone 13', 'MacBook', 'Bicycle'];
    }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const fetchSuggestions = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (query.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }
    debounceTimerRef.current = setTimeout(async () => {
      const res = await productApi.getSuggestions(query);
      if (res.success && res.data) {
        setSuggestions(res.data);
      }
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    dispatch(setSearchQuery(val));
    setIsSuggestionsOpen(true);
    fetchSuggestions(val);
  };

  const handleClear = () => {
    setLocalQuery('');
    dispatch(setSearchQuery(''));
    setSuggestions({ products: [], categories: [] });
  };

  const handleCitySelect = (city: string) => {
    dispatch(setSelectedCity(city));
    setIsCityDropdownOpen(false);
  };

  const handleSearchExecute = (queryText: string) => {
    const q = queryText.trim();
    setLocalQuery(q);
    dispatch(setSearchQuery(q));
    saveRecentSearch(q);
    setIsSuggestionsOpen(false);
    navigate('/products');
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchExecute(localQuery);
    } else if (e.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  };

  const handleSelectProductSuggestion = (prodId: string) => {
    setIsSuggestionsOpen(false);
    dispatch(openProductDetails(prodId));
    navigate(`/products/${prodId}`);
  };

  const handleSelectCategorySuggestion = (catSlug: string) => {
    setIsSuggestionsOpen(false);
    dispatch(setSelectedCategory(catSlug));
    navigate('/products');
  };

  const hasSuggestions = suggestions.products.length > 0 || suggestions.categories.length > 0;

  return (
    <div className="search-container" ref={containerRef} style={{ position: 'relative' }}>
      {/* Search Input Box */}
      <div className="search-input-box">
        <Search className="search-icon" />
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onFocus={() => setIsSuggestionsOpen(true)}
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
        ref={cityDropdownRef}
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

      {/* Live Suggestions Dropdown Popover */}
      {isSuggestionsOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.06)',
            padding: '12px',
            zIndex: 1100,
            maxHeight: '440px',
            overflowY: 'auto',
          }}
        >
          {/* If there is active search query with suggestions */}
          {localQuery.trim().length >= 2 && hasSuggestions ? (
            <div>
              {/* Matching Categories */}
              {suggestions.categories.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px' }}>
                    Categories
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px 8px' }}>
                    {suggestions.categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategorySuggestion(cat.slug)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          background: '#f1f5f9',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      >
                        <Tag style={{ width: '12px', height: '12px', color: '#6366f1' }} />
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Products */}
              {suggestions.products.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px' }}>
                    Matching Listings
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {suggestions.products.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProductSuggestion(prod.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.title}
                          </p>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                            in {prod.categoryName}
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search for exact query button */}
              <div
                onClick={() => handleSearchExecute(localQuery)}
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '12.5px', color: '#4f46e5', fontWeight: 600 }}>
                  Search for "{localQuery}" in all products
                </span>
                <ArrowRight style={{ width: '15px', height: '15px', color: '#4f46e5' }} />
              </div>
            </div>
          ) : localQuery.trim().length >= 2 && !hasSuggestions ? (
            <div style={{ padding: '16px 8px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#64748b' }}>
                No direct matches for "{localQuery}"
              </p>
              <button
                type="button"
                onClick={() => handleSearchExecute(localQuery)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  background: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Search all listings
              </button>
            </div>
          ) : (
            /* Default Recent Searches & Quick Ideas */
            <div>
              {recentSearches.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      style={{ fontSize: '11px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 8px 10px' }}>
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleSearchExecute(term)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          color: '#475569',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        <Clock style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ borderTop: recentSearches.length > 0 ? '1px solid #f1f5f9' : 'none', paddingTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px 8px' }}>
                  Popular Searches
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 8px' }}>
                  {['Laptops', 'Gaming PC', 'Honda Activa', 'Sofa Set', 'Sony PS5'].map((popular) => (
                    <button
                      key={popular}
                      type="button"
                      onClick={() => handleSearchExecute(popular)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        background: '#eef2ff',
                        border: 'none',
                        fontSize: '12px',
                        color: '#4f46e5',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {popular}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

