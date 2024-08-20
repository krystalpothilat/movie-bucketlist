import React, { useState, useEffect } from 'react';
import "./styles/ScrollButton.css";
import upscroll from './imgs/upscroll.png';
import downscroll from './imgs/downscroll.png';

const ScrollButton = () => {
  const [showUpScroll, setShowUpScroll] = useState(false);
  const [showDownScroll, setShowDownScroll] = useState(false);

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if we are within the top 80% of the page for the downscroll button
    const isWithinTop80Percent = scrollY  > (documentHeight - windowHeight) * 0.2;
    setShowDownScroll(isWithinTop80Percent);

    // Check if we are within the bottom 80% of the page for the upscroll button
    const isWithinBottom80Percent = scrollY < (documentHeight - windowHeight) * 0.8;
    setShowUpScroll(isWithinBottom80Percent);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    };

  return (
    <>
      {showDownScroll && (
        <img src = {upscroll} alt = "Scroll Up" className = "scroll-button" id = "upscroll" onClick={scrollToTop}/>
      )}
      {showUpScroll && (
        <img src = {downscroll} alt = "Scroll Down" className = "scroll-button" id = "downscroll" onClick={scrollToBottom}/>
      )}
    </>
  );
};

export default ScrollButton;
