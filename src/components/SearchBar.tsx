/**
 * SearchBar Component
 * 
 * Reusable search input component with debounced search functionality.
 * Features:
 * - Debounced search input (300ms)
 * - Search icon
 * - Clear button
 * - Recent searches dropdown (optional)
 * - Accessible with proper ARIA labels
 */

'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks';
import { DEBOUNCE } from '@/constants';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showRecent?: boolean;
}

/**
 * SearchBar Component
 * 
 * Props:
 * - placeholder: Custom placeholder text
 * - onSearch: Callback function when search is performed
 * - className: Optional CSS classes
 * - showRecent: Show recent searches dropdown
 * 
 * Features:
 * - Debounced search input to prevent excessive API calls
 * - Clear button to reset search
 * - Animated icons
 * - Accessible with proper ARIA labels
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search songs, artists, playlists...',
  onSearch,
  className = '',
  showRecent = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Debounce the search query
  const debouncedQuery = useDebouncedValue(searchQuery, DEBOUNCE.search);

  // Execute search when debounced query changes
  React.useEffect(() => {
    if (onSearch && debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex items-center">
        {/* Search Icon */}
        <Search className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />

        {/* Input Field */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          aria-label="Search"
          className="w-full pl-10 pr-10 py-2 bg-muted rounded-lg border border-transparent hover:border-border focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 hover:bg-background rounded transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Recent Searches Dropdown (Optional) */}
      {showRecent && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-2 z-50">
          <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
            RECENT SEARCHES
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 hover:bg-muted rounded transition-colors text-sm">
              Drake - One Dance
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-muted rounded transition-colors text-sm">
              The Weeknd
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-muted rounded transition-colors text-sm">
              Indie Pop Mix
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
