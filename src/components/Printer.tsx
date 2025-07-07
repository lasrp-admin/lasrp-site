import React, { useEffect, useState, type SetStateAction } from "react";
import { Document, Page, View, Text, PDFViewer } from "@react-pdf/renderer";
import type { Resource } from "../types/types";

import styles from "../styles/Printer.module.css";
import { IoMdClose } from "react-icons/io";
import { GrDocumentPdf } from "react-icons/gr";
import { useDatabaseContext } from "../contexts/DatabaseContext";

import { StyleSheet } from "@react-pdf/renderer";
interface PrinterProps {
  setPrinter: React.Dispatch<SetStateAction<boolean>>;
}

export const Printer: React.FC<PrinterProps> = ({ setPrinter }) => {
  const { database, selectedResources } = useDatabaseContext();
  const [resources, setResources] = useState<Resource[]>([]);
  const [readyToRender, setReadyToRender] = useState<boolean>(false);

  useEffect(() => {
    if (selectedResources) {
      setReadyToRender(true);
      setResources(Array.from(selectedResources).map((name) => database[name]));
    }
  }, [selectedResources]);

  // const handlePrint = async () => {
  //   let message = window.prompt(
  //     "Add a custom message to include in the printout..."
  //   );
  //   if (message === null) message = "";
  //   const blob = await pdf(
  //     <PDF resources={resources} message={message} />
  //   ).toBlob();
  //   const url = URL.createObjectURL(blob);
  //   const win = window.open(url);
  //   if (win) {
  //     win.onload = () => {
  //       win.focus();
  //       win.print();
  //     };
  //   }
  // };

  return readyToRender ? (
    <div className={styles.overlay}>
      <div className={styles.mainBox}>
        <div className={styles.toggle}>
          <IoMdClose onClick={() => setPrinter(false)} size={30} />
        </div>
        <div
          style={{
            position: "absolute",
            zIndex: 0,
            alignSelf: "center",
            top: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            alignItems: "center",
          }}
        >
          <GrDocumentPdf size={40} />
          <span>Generating PDF...</span>
        </div>
        <PDFViewer style={{ height: "100%", width: "97%", zIndex: 100 }}>
          <PDF resources={resources} message="Hi" />
        </PDFViewer>
      </div>
    </div>
  ) : (
    <span>Loading</span>
  );
};

interface PDFProps {
  resources: Resource[];
  message: string;
}

const PDF: React.FC<PDFProps> = ({ resources }) => {
  return (
    <Document title="lasrp_resource_sheet">
      <Page size="A4" style={pdfStyles.body}>
        <View>
          <Text style={pdfStyles.header}>
            This is a printout of {resources.length} resources selected from
            laresources.org{" "}
          </Text>
        </View>
        {resources.map((resource, i) => (
          <View key={`view-${i}`} wrap={false} style={pdfStyles.resource}>
            <Text key={`title-${i}`} style={pdfStyles.titleText}>
              {resource.name}
            </Text>
            <Text style={{ ...pdfStyles.text, marginBottom: 10 }}>
              {Array.from(resource.type).map((type, i) =>
                i === resource.type.size - 1 ? (
                  <Text style={pdfStyles.text}>{type}</Text>
                ) : (
                  <Text style={pdfStyles.text}>
                    {type}
                    {", "}
                  </Text>
                )
              )}
            </Text>
            <Text key={`descr-${i}`} style={pdfStyles.text}>
              {resource.description}
            </Text>
            <Text
              key={`web-${i}`}
              style={{
                ...pdfStyles.text,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Resource contact information:
            </Text>
            {resource.phone1 && (
              <Text style={pdfStyles.text}>{resource.phone1}</Text>
            )}
            {resource.phone2 && (
              <Text style={pdfStyles.text}>{resource.phone2}</Text>
            )}
            {resource.email1 && (
              <Text style={pdfStyles.text}>{resource.email1}</Text>
            )}
            {resource.email2 && (
              <Text style={pdfStyles.text}>{resource.email2}</Text>
            )}
            <Text style={pdfStyles.text}>{resource.website}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default Printer;

const pdfStyles = StyleSheet.create({
  resource: {
    border: "2px solid black",
    borderRadius: "10px",
    margin: "10px",
    padding: "15px",
  },
  body: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  titleText: {
    fontSize: 18,
    fontFamily: "Times-Roman",
    marginBottom: 2,
    fontWeight: "bold",
  },
  text: {
    fontSize: 14,
    fontFamily: "Times-Roman",
    marginBottom: 6,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
});
