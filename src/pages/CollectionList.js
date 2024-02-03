import React from 'react';
import '../style.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const query = `
query collectionQuery {
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
}
`;

export default function CollectionList() {
  const [collections, setCollections] = useState(null);

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

        setCollections(data.collectionCollection.items);
      });
  }, []);

//   set body to overflow hidden
useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!collections) {
    return '';
  }


  return (
    <>
        <div className='menu-wrapper'>
        <div className="menu">
            {collections.map((collection) => (
            <Link key={collection.sys.id} to={`/collection/${collection.sys.id}/projects`} className="collection-item">
                <img src={collection.thumbnail.url} alt={collection.title} />
                <p>{collection.title}</p>
            </Link>
            ))}
        </div>
        </div>
        <Link to="/">
        <img className="logo" src="/stars.png" alt="" />
      </Link>
    </>
  );
}
