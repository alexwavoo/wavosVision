import React, { useEffect, useState } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';


const CollectionList = ({ calculatedHeight, collections, featuredImages }) => {
    const [modal, setModal] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [modalText, setModalText] = useState(null);
    const [modalLoaded, setModalLoaded] = useState(false);

    const openModal = (image) => () => {
        setModal(true);
        setModalImage(image.fields.file.url);
        setModalText([image.fields.title, image.fields.description]);
        setModalLoaded(false);
    };

    const closeModal = () => {
        setModal(false);
        setModalImage(null);
        setModalText(null);
        setModalLoaded(false);
    };

    const handleImageLoaded = () => {
        setModalLoaded(true);
    };

    if (!collections) return null;

    return (
        <>
        <div className="collection-wrapper">
                {/* list of featured images */}

                <div className="featured-images-grid">
                    {featuredImages.map((image, index) => (
                        <div key={index} className="featured-image-item" onClick={openModal(image)}>
                            <img 
                                src={`${image.fields.file.url}?w=650`} 
                                alt={image.fields.title} 
                                className="featured-image"
                            />
                            <h3 className="featured-image-title">{image.fields.title}</h3>
                            <p className="featured-image-description">{image.fields.description}</p>
                        </div>
                    ))}
                </div>

            <div className='menu-wrapper' >

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
        {modal ? (
        <div onClick={closeModal} className='modal-wrapper' style={{ height: `${calculatedHeight}px` }}>
        {modalLoaded ? (
            <img  src={`${modalImage}?w=2560`} width="80%" alt="" />
        ) : (
            <>
            <span class="loader"></span>
            <img onLoad={handleImageLoaded}  src={`${modalImage}?w=2560`} style={{ display: 'none' }}  alt="" />
            </>
        )}
            <div className='modal-text'>
            <div className='modal-title'>{modalText[0]}</div>
            <div className='modal-subtitle'>{modalText[1]}</div>
            </div>
        </div>
        ) : null
            }
        </>
    );
};

export default CollectionList;
