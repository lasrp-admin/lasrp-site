import {
  loadSelectedResources,
  saveSelectedResources,
} from "../utils/localStorage";
import type { ResourceDatabase } from "../types/types";
import { create } from "zustand";
import { readURL, updateURL } from "../utils/urlEncoding";

interface DatabaseStore {
  database: ResourceDatabase;
  setDatabase: (db: ResourceDatabase) => void;
  databaseSize: number;
  favoriteResources: Set<number>;
  addFavoriteResources: (resources?: number[]) => void;
  delFavoriteResources: (resources: number[]) => void;
  selectedResources: Set<number>;
  addSelectedResource: (id: number) => void;
  delSelectedResource: (id: number) => void;
  areAllSelected: (ids: number[]) => boolean;
  areAnySelected: () => boolean;
  selectAll: (ids: number[]) => void;
  deselectAll: (ids: number[]) => void;
}

const useDatabaseStore = create<DatabaseStore>((set, get) => ({
  database: {},
  setDatabase: (db: ResourceDatabase) => {
    set({ database: db, databaseSize: Object.keys(db).length });
  },
  databaseSize: 0,
  favoriteResources: readURL(),
  addFavoriteResources: (resources?: number[]) => {
    let newFavorites = new Set(get().favoriteResources);
    if (resources) {
      resources.forEach((resource) => newFavorites.add(resource));
    } else {
      const toBeAdded = get().selectedResources;
      newFavorites = new Set([...newFavorites, ...toBeAdded]);
    }
    updateURL(newFavorites);
    set({
      favoriteResources: newFavorites,
    });
  },
  delFavoriteResources: (resources: number[]) => {
    const newFavorites = new Set(get().favoriteResources);
    resources.forEach((resource) => newFavorites.delete(resource));
    updateURL(newFavorites);
    set({
      favoriteResources: newFavorites,
    });
  },
  selectedResources: loadSelectedResources(),
  selectAll: (ids: number[]) => {
    const newSelected = new Set(get().selectedResources);
    ids.forEach((id) => newSelected.add(id));
    saveSelectedResources(newSelected);
    set({
      selectedResources: newSelected,
    });
  },
  addSelectedResource: (id: number) => {
    const newSelected = new Set(get().selectedResources);
    newSelected.add(id);
    saveSelectedResources(newSelected);
    set({
      selectedResources: newSelected,
    });
  },
  delSelectedResource: (id: number) => {
    const newSelected = new Set(get().selectedResources);
    newSelected.delete(id);
    saveSelectedResources(newSelected);
    set({
      selectedResources: newSelected,
    });
  },
  areAllSelected: (ids: number[]) => {
    const selected = get().selectedResources;
    return ids.every((id) => selected.has(id));
  },
  areAnySelected: () => {
    return get().selectedResources.size > 0;
  },
  deselectAll: (ids: number[]) => {
    const newSelected = new Set(get().selectedResources);
    ids.forEach((id) => newSelected.delete(id));
    saveSelectedResources(newSelected);
    set({
      selectedResources: newSelected,
    });
  },
}));

export default useDatabaseStore;
