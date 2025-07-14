import React, { useEffect, useState, type SetStateAction } from "react";
import { Document, Page, View, Text, PDFViewer } from "@react-pdf/renderer";
import type { Resource } from "../types/types";

import styles from "../styles/Printer.module.css";
import { IoMdClose } from "react-icons/io";
import { GrDocumentPdf } from "react-icons/gr";

import { StyleSheet } from "@react-pdf/renderer";
import useDatabaseStore from "../contexts/DatabaseStore";
interface PrinterProps {
  setPrinter: React.Dispatch<SetStateAction<boolean>>;
}

export const Printer: React.FC<PrinterProps> = ({ setPrinter }) => {
  const database = useDatabaseStore((state) => state.database);
  const selectedResources = useDatabaseStore(
    (state) => state.selectedResources
  );

  const [resources, setResources] = useState<Resource[]>([]);
  const [readyToRender, setReadyToRender] = useState<boolean>(false);

  useEffect(() => {
    if (selectedResources) {
      setReadyToRender(true);
      setResources(Array.from(selectedResources).map((name) => database[name]));
    }
  }, [selectedResources]);

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
                marginTop: 6,
                marginBottom: 6,
              }}
            >
              Resource contact information:
            </Text>
            <Text style={pdfStyles.phone}>
              {resource.phone1 &&
                resource.phone1
                  .split(",\n")
                  .map((phone) => <Text key={phone}>{phone}</Text>)}
            </Text>
            <Text style={pdfStyles.phone}>
              {resource.email1 &&
                resource.email1
                  .split(",\n")
                  .map((email) => <Text key={email}>{email}</Text>)}
            </Text>
            <Text style={pdfStyles.text}>{resource.website}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default Printer;

// const pdfStyles = StyleSheet.create({
//   resource: {
//     border: "2px solid black",
//     borderRadius: "10px",
//     margin: "10px",
//     padding: "15px",
//   },
//   body: {
//     paddingTop: 15,
//     paddingBottom: 15,
//     paddingHorizontal: 10,
//   },
//   titleText: {
//     fontSize: 18,
//     fontFamily: "Times-Roman",
//     marginBottom: 2,
//     fontWeight: "bold",
//   },
//   text: {
//     fontSize: 14,
//     fontFamily: "Times-Roman",
//     marginBottom: 6,
//   },
//   header: {
//     fontSize: 12,
//     marginBottom: 20,
//     textAlign: "center",
//     color: "grey",
//   },
// });
const pdfStyles = StyleSheet.create({
  body: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: "Helvetica",
    color: "#333333",
  },
  header: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#1a1a1a",
    borderBottom: "1px solid #ccc",
    paddingBottom: 10,
  },
  resource: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: "1px solid #e0e0e0",
  },
  titleText: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#222",
  },
  text: {
    fontSize: 11,
    color: "#444",
  },
  phone: {
    fontSize: 11,
    color: "#444",
    marginBottom: 5,
  },
});
