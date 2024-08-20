import React, { useState, useEffect } from 'react';
import "./styles/ScrollButton.css";
import upscroll from './imgs/upscroll.png';
import downscroll from './imgs/downscroll.png';

const ScrollButton = ({viewType}) => {
  const [showUpScroll, setShowUpScroll] = useState(false);
  const [showDownScroll, setShowDownScroll] = useState(false);

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const documentHeight = document.documentElement.scrollHeight;

    // % appearance based on window screen size
    const topThreshold = windowWidth < 1000 ? 0.05 : 0.2;
    const bottomThreshold = windowWidth < 1000 ? 0.95 : 0.8;

    // to bottom of page scroll only available for top % of page
    const isWithinTopPercent = scrollY  > (documentHeight - windowHeight) * topThreshold;
    setShowDownScroll(isWithinTopPercent);

    // to top of page scroll only available for bottom % of page
    const isWithinBottomPercent = scrollY < (documentHeight - windowHeight) * bottomThreshold;
    setShowUpScroll(isWithinBottomPercent);
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
      {showDownScroll && viewType === "grid" && (
        <img src = {upscroll} alt = "Scroll Up" className = "scroll-button" id = "upscroll" onClick={scrollToTop}/>
      )}
      {showUpScroll && viewType === "grid" && (
        <img src = {downscroll} alt = "Scroll Down" className = "scroll-button" id = "downscroll" onClick={scrollToBottom}/>
      )}
    </>
  );
};

export default ScrollButton;
