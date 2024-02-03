// import React from 'react';
// import './style.css';
// import { useState, useEffect } from 'react';

// const query = `
// query collectionQuery {
//   collectionCollection {
//     items {
//       sys {
//         id
//       }
//       title
//       thumbnail{
//         url
//       }
//     }
//   }
// }
// `;

// function App() {
//   const [collections, setCollections] = useState(null);

//   useEffect(() => {
//     window
//       .fetch(`https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
//         },
//         body: JSON.stringify({ query }),
//       })
//       .then((response) => response.json())
//       .then(({ data, errors }) => {
//         if (errors) {
//           console.error(errors);
//         }

//         setCollections(data.collectionCollection.items);
//       });
//   }, []);

//   if (!collections) {
//     return 'Loading...';
//   }


//   return (
//     <>
//         <div className='menu-wrapper'>
//           <div className="menu">
//             {collections.map((collection) => (
//               <div key={collection.sys.id} className="collection-item">
//                 <img src={collection.thumbnail.url} alt={collection.title} />
//                 <p>{collection.title}</p>
//               </div>
//             ))}
//           </div>
//       </div>
//       <div class="logo">star</div>
//     </>
//   );
// }

// export default App;

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
