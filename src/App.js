import React from 'react';
import './style.css';
import { useState, useEffect } from 'react';

const query = `
{
  collectionCollection {
    items {
      sys {
        id
      }
      title
      thumbnail{
        url
      }
    }
  }
`;

function App() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    window
      .fetch(`https://graphql.contentful.com/content/v1/spaces/oen9jg6suzgv/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer DVunWPNQGTy0uUwexdTPIoUiShuoqOrcDGi9q8x6tXo',
        },
        body: JSON.stringify({ query }),
      })
      .then((response) => response.json())
      .then(({ data, errors }) => {
        if (errors) {
          console.error(errors);
        }

        setPage(data.collectionCollection.items[0]);
      });
  }, []);

  if (!page) {
    return 'Loading...';
  }

  // render the fetched Contentful data
  return (
    <div className="App">
      <header className="App-header">
        <img src={collection.thumbnail.url} className="App-logo" alt="logo" />
        <p>{collection.title}</p>
      </header>
    </div>
  );
}

export default App;
