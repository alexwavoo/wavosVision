import React, { useEffect, useState } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';


const CollectionList = ({ calculatedHeight, collections, featuredImages }) => {
    const [modal, setModal] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [modalText, setModalText] = useState(null);
    const [modalLoaded, setModalLoaded] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

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

    if (!showContent) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: `${calculatedHeight}px` }}>
                <img src="/stars.png" alt="Stars" width='100px' />
            </div>
        );
    }

    return (
        <>
        <div className="collection-wrapper">
            <div className='menu-wrapper' >
                <div className="collections">
                    <p>WAVO'S VISION:</p> 
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
            <div className='featured-title'>Featured Work</div>
            <div className="featured-images-grid">
                {featuredImages.map((image, index) => (
                    <div key={index} className="featured-image-item" onClick={openModal(image)}>
                        <img 
                            src={`${image.fields.file.url}?w=650`} 
                            alt={image.fields.title} 
                            className="featured-image"
                        />
                    </div>
                ))}
            </div>
        </div>
        {modal ? (
        <div onClick={closeModal} className='modal-wrapper' style={{ height: `${calculatedHeight}px` }}>
        {modalLoaded ? (
            <img  src={`${modalImage}?w=2560`} width="80%" alt="" />
        ) : (
            <>
            <span className="loader"></span>
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
