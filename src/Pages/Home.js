import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
} from "recharts";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import "./Home.css";

const Home = () => {
  const [data, setData] = useState([]);
  const [academicData, setAcademicData] = useState([]);
  const [socioEconomicData, setSocioEconomicData] = useState([]);
  const [schoolTypeData, setSchoolTypeData] = useState([]);
  const [socioCategories, setSocioCategories] = useState([]); // Move socioCategories to state

  useEffect(() => {
    const natCollection = collection(db, "natData");
    const unsubscribe = onSnapshot(natCollection, (snapshot) => {
      const chartData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          academic_performance: Number(data.academic_performance || 0),
          NAT_Results: Number(data.NAT_Results || 0),
        };
      });
      setData(chartData);
  
      // Normalize "academic_description" categories
      const normalizePerformance = (description) => {
        switch (description) {
          case "Poor":
          case "Needs Improvement":
            return "Poor";
          case "Fairly Satisfactory":
          case "Satisfactory":
            return "Average";
          case "Very Satisfactory":
            return "Good";
          case "Outstanding":
            return "Excellent";
          default:
            return "Unknown";
        }
      };
  
      // Prepare Academic Performance Data
      const performanceCategories = ["Poor", "Average", "Good", "Excellent"];
      const performanceData = performanceCategories.map((category) => ({
        performance: category,
        count: chartData.filter(
          (item) => normalizePerformance(item.academic_description) === category
        ).length,
      }));
      setAcademicData(performanceData);
  
      // Prepare Socio-economic Status Data for Grouped Bar Chart
      const socioCategoriesTemp = [...new Set(chartData.map((item) => item.socio_economic_status))];
      setSocioCategories(socioCategoriesTemp);
      const socioData = socioCategoriesTemp.map((category) => {
        const filteredData = chartData.filter((item) => item.socio_economic_status === category);
        const averagePerformance =
          filteredData.reduce((acc, item) => acc + item.academic_performance, 0) /
          (filteredData.length || 1); // Avoid division by zero
        return {
          socioStatus: category,
          averagePerformance: averagePerformance.toFixed(2), // Format to 2 decimal places
        };
      });
      setSocioEconomicData(socioData);
  
      // Prepare School Type Data
      const schoolData = ["Public", "Private"].map((type) => ({
        schoolType: type,
        avgNatResult:
          chartData
            .filter((item) => item.type_school === type)
            .reduce((acc, item) => acc + item.NAT_Results, 0) /
          chartData.filter((item) => item.type_school === type).length,
      }));
      setSchoolTypeData(schoolData);
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <div className="dashboard-container">
      <div className="charts-container">
        {/* Academic Performance Bar Chart */}
        <div className="chart-section">
          <h3>Academic Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={academicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="performance" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Socio-economic Status vs. Academic Performance Grouped Bar Chart */}
<div className="chart-section">
  <h3>Socio-economic Status vs. Academic Performance</h3>
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={socioEconomicData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="socioStatus" tickFormatter={(index) => socioCategories[index]} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="averagePerformance" name="Average Performance" fill="#82ca9d" />
    </BarChart>
  </ResponsiveContainer>
</div>


        {/* School Type vs. NAT Results Bar Chart */}
        <div className="chart-section">
          <h3>Type of School vs. NAT Results</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={schoolTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="schoolType" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgNatResult" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Home;
