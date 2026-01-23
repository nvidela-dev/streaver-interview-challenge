'use client';

import { useState, useRef, useEffect } from 'react';
import { FilterIcon, CloseIcon } from './IconButton';

interface User {
  id: number;
  name: string;
  username: string;
}

interface FilterButtonProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User | null) => void;
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function FilterButton({ users, selectedUser, onSelectUser }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  });

  const isExpanded = selectedUser !== null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center overflow-hidden rounded-full px-2.5 py-1.5 text-sm font-medium transition-all duration-300 ease-out bg-white/10 hover:bg-white/20 text-white ${
          isExpanded ? 'gap-2 px-3' : 'gap-0 hover:gap-2 hover:px-3'
        }`}
      >
        <span className="shrink-0">
          <FilterIcon />
        </span>
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${
            isExpanded
              ? 'max-w-32 opacity-100'
              : 'max-w-0 opacity-0 group-hover:max-w-24 group-hover:opacity-100'
          }`}
        >
          {isExpanded ? selectedUser.name : 'Filter by User'}
        </span>
        {isExpanded && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onSelectUser(null);
            }}
            className="shrink-0 rounded-full p-0.5 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <CloseIcon />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-[#0a0a0a] py-1 shadow-xl z-20 animate-modal-content">
          <div className="px-3 py-2 flex items-center justify-between">
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                searchOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}
            >
              <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap">
                Filter by Author
              </span>
            </div>
            <div
              className={`flex items-center gap-2 transition-all duration-300 ease-out ${
                searchOpen ? 'flex-1' : ''
              }`}
            >
              {searchOpen && (
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1 text-sm bg-white/5 border border-white/10 rounded text-white placeholder-[#9CA3AF]/50 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-transparent transition-all duration-300"
                />
              )}
              <button
                data-testid="search-toggle"
                onClick={() => {
                  if (searchOpen && search) {
                    setSearch('');
                  } else {
                    setSearchOpen(!searchOpen);
                  }
                }}
                className="shrink-0 p-1.5 rounded-md hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-colors"
              >
                {searchOpen ? <CloseIcon /> : <SearchIcon />}
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="px-3 py-4 text-sm text-[#9CA3AF] text-center">
                No authors found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    setIsOpen(false);
                    setSearch('');
                    setSearchOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                    selectedUser?.id === user.id
                      ? 'bg-[#2563EB]/20 text-[#2563EB]'
                      : 'text-white'
                  }`}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-[#9CA3AF]">@{user.username}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
