// stores/searchStore.ts

import { Store } from '@tanstack/react-store';

interface SearchState {
  searchQuery: string;
}

export const store  = new Store<SearchState>({ searchQuery: '' });

export const useSearchStore = store;
