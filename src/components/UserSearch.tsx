import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';
import debounce from 'lodash/debounce';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
}

interface UserSearchProps {
  onUserSelect: (user: User) => void;
}

export default function UserSearch({ onUserSelect }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const searchUsers = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    setLoading(true);
    searchUsers(query);
  }, [query, searchUsers]);

  const handleUserClick = (user: User) => {
    onUserSelect(user);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search users..."
          className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-purple-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-800 text-white placeholder-purple-300"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300 animate-spin" />
        )}
      </div>

      {showResults && (query.trim() || users.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-purple-900 border border-purple-400/30 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {users.length > 0 ? (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="w-full px-4 py-2 text-left hover:bg-purple-800 flex items-center gap-3 transition-colors"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {user.photo ? (
                    <Image
                      src={user.photo}
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-700 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">
                    {user.firstName} {user.lastName}
                  </h3>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-purple-300">
              {loading ? 'Searching...' : 'No users found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 