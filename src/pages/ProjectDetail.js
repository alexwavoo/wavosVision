// ProjectDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    // Fetch project details based on the projectId
    // Use Contentful API to get the details for the selected project
    // Update the project state
  }, [projectId]);

  if (!project) {
    return 'Loading...';
  }

  return (
    <div className="wrapper">
      <div className="header">{project.title}</div>
      <div className="description">{project.description}</div>
      <div className="flex-container">
        {/* Display other details of the project */}
      </div>
    </div>
  );
}

export default ProjectDetail;
