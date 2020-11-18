import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { ProjectData } from "./types";
import { fetchProjectData } from "./api";

function App() {
  const [projectData, setProjectData] = useState<ProjectData | undefined>(
    undefined
  );
  useEffect(() => {
    fetchProjectData()
      .then((_) => _.json())
      .then((response) => setProjectData(response));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{projectData ? "Got project data" : "Loading"}</p>
      </header>
    </div>
  );
}

export default App;
