
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CollectionList from './pages/CollectionList';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';

export default function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<CollectionList />} />
        <Route path="/collection/:collectionId/projects" element={<ProjectsList />} />
        <Route path="/collection/:collectionId/projects/:projectId" element={<ProjectDetail />} />
      </Routes>
    </Router>
  );
}
