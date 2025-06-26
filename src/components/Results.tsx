import React from "react";
import type { Resource } from "../types/types";
import ResourceCard from "./ResourceCard";

interface ResultsProps {
  data: Resource[];
}

const Results: React.FC<ResultsProps> = ({ data }) => {
  console.log("Data: ", data);
  return (
    <div>
      {data.map((entry) => (
        <ResourceCard resource={entry} />
      ))}
    </div>
  );
};

export default Results;
