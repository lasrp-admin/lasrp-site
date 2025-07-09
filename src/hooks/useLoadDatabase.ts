import { useEffect } from "react";
import useDatabaseStore from "../contexts/DatabaseStore";
import type { ResourceDatabase } from "../types/types";

export default function useLoadDatabase() {
  const setDatabase = useDatabaseStore((state) => state.setDatabase);
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
              neighborhood: new Set(resource.neighborhood),
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
}
