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

export function FilterButton({ users, selectedUser, onSelectUser }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-[#0a0a0a] py-1 shadow-xl z-20">
          <div className="px-3 py-2 text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">
            Filter by Author
          </div>
          <div className="max-h-64 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  setIsOpen(false);
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
