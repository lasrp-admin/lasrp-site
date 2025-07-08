import type { ResourceDatabase, Resource } from "../types/types";
import { create } from "zustand";

interface DatabaseStore {
  database: ResourceDatabase;
  setDatabase: (db: ResourceDatabase) => void;
  databaseSize: number;
  selectedResources: Set<string>;
  addSelectedResource: (name: string) => void;
  delSelectedResource: (name: string) => void;
  areAllSelected: (resources: Resource[]) => boolean;
  selectAll: (data: Resource[]) => void;
  deselectAll: (data: Resource[]) => void;
}

const useDatabaseStore = create<DatabaseStore>((set, get) => ({
  database: {},
  setDatabase: (db: ResourceDatabase) => {
    set({ database: db, databaseSize: Object.keys(db).length });
  },
  databaseSize: 0,
  selectedResources: new Set(),
  selectAll: (data: Resource[]) => {
    const newSelected = new Set(get().selectedResources);
    data.forEach((resource) => newSelected.add(resource.name));
    set({
      selectedResources: newSelected,
    });
  },
  addSelectedResource: (name: string) => {
    const newSelected = new Set(get().selectedResources);
    newSelected.add(name);
    set({
      selectedResources: newSelected,
    });
  },
  delSelectedResource: (name: string) => {
    const newSelected = new Set(get().selectedResources);
    newSelected.delete(name);
    set({
      selectedResources: newSelected,
    });
  },
  areAllSelected: (resources: Resource[]) => {
    const selected = get().selectedResources;
    return resources.every((resource) => selected.has(resource.name));
  },
  deselectAll: (data: Resource[]) => {
    const newSelected = new Set(get().selectedResources);
    data.forEach((resource) => newSelected.delete(resource.name));
    set({
      selectedResources: newSelected,
    });
  },
}));

export default useDatabaseStore;
