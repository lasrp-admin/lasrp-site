import React, { useEffect, useState, type SetStateAction } from "react";
import Select, { type ActionMeta } from "react-select";

import makeAnimated from "react-select/animated";

import {
  ALL_AUDIENCE_TYPES,
  ALL_LANGUAGE_TYPES,
  ALL_RESOURCE_TYPES,
  ALL_NEIGHBORHOOD_TYPES,
  ALL_OTHER_TYPES,
} from "../types/types";

import type {
  FilterSet,
  ResourceType,
  ResourceAudience,
  ResourceLanguage,
  ResourceNeighborhood,
  ResourceOther,
} from "../types/types";

import styles from "../styles/Filters.module.css";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import ReactDOM from "react-dom";
import { IoMdClose } from "react-icons/io";

type Option = {
  label: string;
  value:
    | ResourceType
    | ResourceAudience
    | ResourceLanguage
    | ResourceNeighborhood
    | ResourceOther;
};

interface FiltersProps {
  setFilterSet: React.Dispatch<SetStateAction<FilterSet>>;
}

const Filters: React.FC<FiltersProps> = ({ setFilterSet }) => {
  /*----------------
  States & Constants
  ----------------*/
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<
    ResourceAudience[]
  >([]);
  const [selectedLanguages, setSelectedLanguages] = useState<
    ResourceLanguage[]
  >([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<
    ResourceNeighborhood[]
  >([]);
  const [selectedOthers, setSelectedOthers] = useState<ResourceOther[]>([]);

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
  const neighborhoodOptions: Option[] = ALL_NEIGHBORHOOD_TYPES.map(
    (neighborhood) => ({
      value: neighborhood,
      label: neighborhood,
    })
  );
  const otherOptions: Option[] = ALL_OTHER_TYPES.map((other) => ({
    value: other,
    label: other,
  }));

  /*-----
  Effects
  -----*/
  useEffect(() => {
    setFilterSet((prev) => ({
      ...prev,
      resourceTypes: new Set(selectedTypes),
    }));
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

  useEffect(() => {
    setFilterSet((prev) => ({
      ...prev,
      resourceNeighborhoods: new Set(selectedNeighborhoods),
    }));
  }, [selectedNeighborhoods]);

  useEffect(() => {
    setFilterSet((prev) => ({
      ...prev,
      resourceOthers: new Set(selectedOthers),
    }));
  }, [selectedOthers]);

  function handleChange(
    selected: readonly Option[],
    filter: "type" | "audience" | "language" | "neighborhood" | "other"
  ) {
    if (filter === "type") {
      setSelectedTypes(selected.map((option) => option.value as ResourceType));
    } else if (filter === "audience") {
      setSelectedAudiences(
        selected.map((option) => option.value as ResourceAudience)
      );
    } else if (filter === "language") {
      setSelectedLanguages(
        selected.map((option) => option.value as ResourceLanguage)
      );
    } else if (filter === "neighborhood") {
      setSelectedNeighborhoods(
        selected.map(
          (neighborhood) => neighborhood.value as ResourceNeighborhood
        )
      );
    } else if (filter === "other") {
      setSelectedOthers(selected.map((other) => other.value as ResourceOther));
    }
  }

  return (
    <div>
      <div className={styles.filtersContainer}>
        <div className={styles.headerRow}>
          <AiOutlineQuestionCircle
            className={styles.helpIcon}
            onClick={() => setShowHelp((prev) => !prev)}
            title="Help"
          />
          <span className={styles.label}>Filters</span>
        </div>
        {showHelp &&
          ReactDOM.createPortal(
            <div className={styles.overlay}>
              <div className={styles.infoBox}>
                <IoMdClose
                  onClick={() => setShowHelp(false)}
                  className={styles.toggle}
                  size={30}
                />
                <span className={styles.text}>
                  Select one of the drop down menus to add filters!
                </span>
                <span className={styles.text}>
                  You can use multiple filter categories at once, and also use
                  multiple options within each category. Filters are additive,
                  so you will only see resources that match ALL your selected
                  filters.
                </span>
              </div>
            </div>,
            document.body
          )}
        <Select
          placeholder="Category"
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
          placeholder="Audience"
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
          placeholder="Language"
          options={languageOptions}
          isSearchable
          isMulti
          components={animated}
          className={styles.bar}
          onChange={(selected: readonly Option[], _: ActionMeta<Option>) =>
            handleChange(selected, "language")
          }
        />
        <Select
          placeholder="Neighborhood"
          options={neighborhoodOptions}
          isSearchable
          isMulti
          components={animated}
          className={styles.bar}
          onChange={(selected: readonly Option[], _: ActionMeta<Option>) =>
            handleChange(selected, "neighborhood")
          }
        />
        <Select
          placeholder="Other"
          options={otherOptions}
          isSearchable
          isMulti
          components={animated}
          className={styles.bar}
          onChange={(selected: readonly Option[], _: ActionMeta<Option>) =>
            handleChange(selected, "other")
          }
        />
      </div>
    </div>
  );
};

export default Filters;
