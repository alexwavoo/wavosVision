import React, { useEffect } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';

const CollectionList = ({ calculatedHeight, collections }) => {
    useEffect(() => {
        const setOverflow = (element, value) => {
            if (element) element.style.overflow = value;
        };

        setOverflow(document.body, 'hidden');
        setOverflow(document.getElementById('app'), 'hidden');

        return () => {
            setOverflow(document.body, 'unset');
            setOverflow(document.getElementById('app'), 'unset');
        };
    }, []);

    if (!collections) return null;

    return (
        <div className="collection-wrapper">
            <div className='menu-wrapper' style={{ height: `${calculatedHeight - 60}px` }}>
                <div className="collections">
                    {collections.map(({ sys, title }) => (
                        <Link
                            key={sys.id}
                            to={`/collection/${sys.id}/projects`}
                            className="collection"
                            id={`collection-item-${sys.id}`}
                        >
                            <p>{title}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CollectionList;
