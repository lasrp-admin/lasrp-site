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
        {resources.map((resource, i) => (
          <View key={`view-${i}`}>
            <Text key={`title-${i}`} style={pdfStyles.titleText}>
              {resource.name}
            </Text>
            <Text key={`descr-${i}`} style={pdfStyles.text}>
              {resource.description}
            </Text>
            <Text key={`web-${i}`} style={pdfStyles.text}>
              {resource.website}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default Printer;

const pdfStyles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  titleText: {
    fontSize: 24,
    fontFamily: "Times-Roman",
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    margin: 12,
    fontFamily: "Oswald",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});
