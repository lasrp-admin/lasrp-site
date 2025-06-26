import React from "react";
import type { Resource } from "../types/types";

interface ResultsProps {
  data: Resource[];
}

const Results: React.FC<ResultsProps> = ({ data }) => {
  console.log("Data: ", data);
  return (
    <div>
      <span>{data.length}</span>
    </div>
  );
};

export default Results;
