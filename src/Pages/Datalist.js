import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import "./Datalist.css";

const DataList = () => {
  const [natData, setNatData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    Respondents: "",
    Age: "",
    sex: "",
    Ethnic: "",
    academic_performance: "",
    academic_description: "",
    IQ: "",
    type_school: "",
    socio_economic_status: "",
    Study_Habit: "",
    NAT_Results: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const natCollection = collection(db, "natData");
        const natSnapshot = await getDocs(natCollection);
        const dataList = natSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNatData(dataList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const parsedData = results.data;
            const natCollection = collection(db, "natData");
            const batch = writeBatch(db);

            parsedData.forEach((row) => {
              const docRef = doc(natCollection);
              batch.set(docRef, row);
            });

            await batch.commit();
            setNatData((prevData) => [...prevData, ...parsedData]);
            alert("CSV data uploaded successfully!");
          } catch (error) {
            console.error("Error uploading CSV: ", error);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV file: ", error);
        },
      });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = natData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(natData.length / itemsPerPage);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this data?");
    if (confirmed) {
      try {
        await deleteDoc(doc(db, "natData", id));
        setNatData(natData.filter((data) => data.id !== id));
        alert("Data deleted successfully!");
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const natCollection = collection(db, "natData");
      const docRef = await addDoc(natCollection, addForm);
      setNatData([...natData, { id: docRef.id, ...addForm }]);
      setAddForm({
        Respondents: "",
        Age: "",
        sex: "",
        Ethnic: "",
        academic_performance: "",
        academic_description: "",
        IQ: "",
        type_school: "",
        socio_economic_status: "",
        Study_Habit: "",
        NAT_Results: "",
      });
      setShowAddForm(false);
      alert("Data added successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleEdit = (id) => {
    const itemToEdit = natData.find((data) => data.id === id);
    setEditingId(id);
    setEditForm(itemToEdit);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "natData", editingId);
      await updateDoc(docRef, editForm);
      setNatData(
        natData.map((data) =>
          data.id === editingId ? { id: editingId, ...editForm } : data
        )
      );
      setEditingId(null);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="data-list-container">
      <h2 className="title">Data List</h2>

      <div className="csv-upload-container">
        <label htmlFor="csv-upload" className="btn csv-upload-btn">
          Upload CSV
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => handleCSVUpload(e)}
        />
        <button className="btn add-btn" onClick={() => setShowAddForm(true)}>
          Add New Data
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Data</h3>
            <form onSubmit={handleAdd} className="add-form">
              {Object.keys(addForm).map((field) => (
                <div className="input-group" key={field}>
                  <label htmlFor={field} className="input-label">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")}
                  </label>
                  <input
                    id={field}
                    type="text"
                    className="input-field"
                    placeholder={`Enter ${field}`}
                    value={addForm[field]}
                    onChange={(e) =>
                      setAddForm({ ...addForm, [field]: e.target.value })
                    }
                    required
                  />
                </div>
              ))}
              <div className="modal-actions">
                <button type="submit" className="btn add-btn">Add Data</button>
                <button type="button" className="btn cancel-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Data</h3>
            <form onSubmit={handleEditSubmit} className="edit-form">
              {Object.keys(editForm).map((field) => (
                <div className="input-group" key={field}>
                  <label htmlFor={field} className="input-label">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")}
                  </label>
                  <input
                    id={field}
                    type="text"
                    className="input-field"
                    placeholder={`Enter ${field}`}
                    value={editForm[field]}
                    onChange={(e) =>
                      setEditForm({ ...editForm, [field]: e.target.value })
                    }
                    required
                  />
                </div>
              ))}
              <div className="modal-actions">
                <button type="submit" className="btn edit-btn">Save Changes</button>
                <button type="button" className="btn cancel-btn" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Respondents</th>
            <th>Age</th>
            <th>Sex</th>
            <th>Ethnic</th>
            <th>Academic Performance</th>
            <th>Academic Description</th>
            <th>IQ</th>
            <th>Type of School</th>
            <th>Socio-Economic Status</th>
            <th>Study Habit</th>
            <th>NAT Results</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((data) => (
            <tr key={data.id}>
              <td>{data.Respondents}</td>
              <td>{data.Age}</td>
              <td>{data.sex}</td>
              <td>{data.Ethnic}</td>
              <td>{data.academic_performance}</td>
              <td>{data.academic_description}</td>
              <td>{data.IQ}</td>
              <td>{data.type_school}</td>
              <td>{data.socio_economic_status}</td>
              <td>{data.Study_Habit}</td>
              <td>{data.NAT_Results}</td>
              <td>
                <button onClick={() => handleEdit(data.id)} className="btn edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(data.id)} className="btn delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
  <button
    onClick={handlePrevPage}
    disabled={currentPage === 1}
    className="btn"
  >
    Previous
  </button>
  <span>
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={handleNextPage}
    disabled={currentPage === totalPages}
    className="btn"
  >
    Next
  </button>
</div>

    </div>
  );
};

export default DataList;
