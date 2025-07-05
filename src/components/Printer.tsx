import React from "react";
import { Document, Page, View, Text, pdf } from "@react-pdf/renderer";
import type { Resource } from "../types/types";

interface PrinterProps {
  resources: Resource[];
}

export const Printer: React.FC<PrinterProps> = ({ resources }) => {
  const handlePrint = async () => {
    let message = window.prompt(
      "Add a custom message to include in the printout..."
    );
    if (message === null) message = "";
    const blob = await pdf(
      <PDF resources={resources} message={message} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) {
      win.onload = () => {
        win.focus();
        win.print();
      };
    }
  };

  return (
    <button onClick={handlePrint} disabled={resources.length === 0}>
      Print Selected Resources
    </button>
  );
};

interface PDFProps {
  resources: Resource[];
  message: string;
}

const PDF: React.FC<PDFProps> = ({ resources }) => {
  return (
    <Document>
      <Page size="A4">
        {resources.map((resource) => (
          <View>
            <Text>{resource.name}</Text>
            <Text>{resource.description}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default Printer;
