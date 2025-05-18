// src/components/AdBanner.tsx
"use client";

import React, { useEffect } from 'react';
import { Megaphone } from 'lucide-react';

const AdBanner = () => {
  useEffect(() => {
    try {
      // Initialize the ad unit
      // Ensure adsbygoogle.js is loaded before pushing
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error in AdBanner:", e);
    }
  }, []);

  return (
    <footer className="w-full p-3 bg-muted border-t border-border text-center shadow-md print:hidden">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Megaphone className="h-6 w-6 text-primary" />
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Advertisement</p>
        </div>
        
        <div className="flex-grow flex items-center justify-center w-full sm:w-auto">
          {/* 
            AdSense Ad Unit.
            IMPORTANT: Replace YOUR_ADSENSE_PUBLISHER_ID with your AdSense Publisher ID
                       and YOUR_AD_SLOT_ID with your Ad Slot ID.
          */}
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '320px', height: '50px', textAlign: 'center' }} // Example style, adjust as needed
            data-ad-client="ca-pub-5758370819928488" // Replace with your Publisher ID
            data-ad-slot="ca-app-pub-5758370819928488/1614514709" // Replace with your Ad Slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>

        <a href="#" aria-label="Information about advertisements" className="text-xs text-muted-foreground/70 hover:underline hidden md:block flex-shrink-0">
          About Ads
        </a>
      </div>
    </footer>
  );
};

export default AdBanner;
