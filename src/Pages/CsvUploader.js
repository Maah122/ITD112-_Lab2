import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { db } from "./firebase"; // Ensure this imports the correct Firebase config for palanialab2
import { collection, addDoc } from "firebase/firestore"; // Firebase Firestore method
import "./style.css"; // Import the CSS file

function CsvUploader() {
  const [csvData, setCsvData] = useState(null);
  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
      },
      skipEmptyLines: true,
    });
  };

  const handleSubmit = async () => {
    if (!csvData) return;

    try {
      // Loop through the parsed CSV data and upload to Firestore's "natData" collection
      const promises = csvData.map((row) => addDoc(collection(db, "natData"), row));
      await Promise.all(promises); // Wait for all uploads to finish

      alert("Data successfully uploaded to Firebase!");

      // Reset the file input and CSV data after successful upload
      setCsvData(null);
      fileInputRef.current.value = ""; // Reset the file input field
    } catch (error) {
      console.error("Error uploading CSV data: ", error);
    }
  };

  return (
    <div className="csv-uploader">
      <h2>CSV Uploader</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        ref={fileInputRef} // Attach the ref to the file input
        className="file-input"
      />
      <button onClick={handleSubmit} className="upload-button">
        Upload to Firebase
      </button>
    </div>
  );
}

export default CsvUploader;
