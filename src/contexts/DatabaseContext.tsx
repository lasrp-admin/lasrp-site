import type { Resource, ResourceDatabase } from "../types/types";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type SetStateAction,
} from "react";

interface DatabaseContextType {
  database: ResourceDatabase;
  databaseSize: number;
  selectedResources: Set<string>;
  setSelectedResources: React.Dispatch<SetStateAction<Set<string>>>;
  selectAll: (data: Resource[]) => void;
  deselectAll: (data: Resource[]) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error(
      "useDatabaseContext must be used inside SelectedResourcesProvider"
    );
  }
  return context;
};

export const DatabaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [database, setDatabase] = useState<ResourceDatabase>({});
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set()
  );
  const [databaseSize, setDatabasesize] = useState<number>(0);

  useEffect(() => {
    const fetchJSON = async () => {
      try {
        const response = await fetch("/data/data.json");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json: ResourceDatabase = await response.json();
        const convertLists: ResourceDatabase = Object.fromEntries(
          Object.entries(json).map(([key, resource]) => [
            key,
            {
              ...resource,
              type: new Set(resource.type),
              audience: new Set(resource.audience),
              language: new Set(resource.language),
              other: new Set(resource.other),
            },
          ])
        );

        setDatabase(convertLists);
      } catch (err) {
        console.error("Failed to load JSON: ", err);
      }
    };
    fetchJSON();
  }, []);

  useEffect(() => {
    setDatabasesize(Object.keys(database).length);
  }, [database]);

  const value = useMemo(
    () => ({
      database,
      selectedResources,
      setSelectedResources,
      databaseSize,
      setDatabasesize,
      selectAll,
      deselectAll,
    }),
    [selectedResources, databaseSize]
  );

  function selectAll(data: Resource[]) {
    setSelectedResources(
      (prev) => new Set([...prev, ...data.map((resource) => resource.name)])
    );
  }

  function deselectAll(data: Resource[]) {
    const newSet = new Set(selectedResources);
    data.forEach((resource) => newSet.delete(resource.name));
    setSelectedResources(newSet);
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
