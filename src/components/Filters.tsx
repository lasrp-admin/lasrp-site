import React, { useEffect, useState, type SetStateAction } from "react";
import Select, { type ActionMeta } from "react-select";

import makeAnimated from "react-select/animated";

import {
  ALL_AUDIENCE_TYPES,
  ALL_LANGUAGE_TYPES,
  ALL_RESOURCE_TYPES,
  type FilterSet,
  type ResourceType,
  type AudienceType,
  type LanguageType,
} from "../types/types";
import styles from "../styles/Filters.module.css";

type Option = {
  label: string;
  value: ResourceType | AudienceType | LanguageType;
};

interface FiltersProps {
  setFilterSet: React.Dispatch<SetStateAction<FilterSet>>;
}

const Filters: React.FC<FiltersProps> = ({ setFilterSet }) => {
  /*----------------
  States & Constants
  ----------------*/
  const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<AudienceType[]>(
    []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageType[]>(
    []
  );

  const animated = makeAnimated();

  const resourceOptions: Option[] = ALL_RESOURCE_TYPES.map((resource) => ({
    value: resource,
    label: resource,
  }));
  const audienceOptions: Option[] = ALL_AUDIENCE_TYPES.map((audience) => ({
    value: audience,
    label: audience,
  }));
  const languageOptions: Option[] = ALL_LANGUAGE_TYPES.map((language) => ({
    value: language,
    label:
      language !== "Request Other Interpretation"
        ? language
        : "Accepts Interpreter Requests",
  }));

  /*-----
  Effects
  -----*/
  useEffect(() => {
    setFilterSet((prev) => ({
      ...prev,
      resourceTypes: new Set(selectedTypes),
    }));
    console.log("new types:", selectedTypes);
  }, [selectedTypes]);

  useEffect(() => {
    setFilterSet((prev) => ({
      ...prev,
      resourceAudiences: new Set(selectedAudiences),
    }));
  }, [selectedAudiences]);

  useEffect(() => {
    setFilterSet((prev) => ({
      ...prev,
      resourceLanguages: new Set(selectedLanguages),
    }));
  }, [selectedLanguages]);

  function handleChange(
    selected: readonly Option[],
    filter: "type" | "audience" | "language"
  ) {
    if (filter === "type") {
      setSelectedTypes(selected.map((option) => option.value as ResourceType));
    } else if (filter === "audience") {
      setSelectedAudiences(
        selected.map((option) => option.value as AudienceType)
      );
    } else if (filter === "language") {
      setSelectedLanguages(
        selected.map((option) => option.value as LanguageType)
      );
    }
  }

  return (
    <div className={styles.filtersContainer}>
      <Select
        placeholder="Filter by resource types..."
        options={resourceOptions}
        isSearchable
        isMulti
        components={animated}
        className={styles.bar}
        onChange={(selected: readonly Option[], _: ActionMeta<Option>) =>
          handleChange(selected, "type")
        }
      />
      <Select
        placeholder="Filter by audience types..."
        options={audienceOptions}
        isSearchable
        isMulti
        components={animated}
        className={styles.bar}
        onChange={(selected: readonly Option[], _: ActionMeta<Option>) =>
          handleChange(selected, "audience")
        }
      />
      <Select
        placeholder="Filter by supported languages..."
        options={languageOptions}
        isSearchable
        isMulti
        components={animated}
        className={styles.bar}
        onChange={(selected: readonly Option[], _: ActionMeta<Option>) =>
          handleChange(selected, "language")
        }
      />
    </div>
  );
};

export default Filters;
