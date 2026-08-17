'use client';

import React from 'react';

interface EshaniLogoProps {
  className?: string;
  width?: number;
  height?: number;
  /** SVG fill — defaults to white */
  fill?: string;
}

/**
 * Official ESHANI logo — exported from the brand SVG.
 * Uses currentColor so you can tint it via Tailwind text-* classes.
 */
const EshaniLogo: React.FC<EshaniLogoProps> = ({
  className = '',
  width,
  height,
  fill = 'currentColor',
}) => (
  <svg
    viewBox="225 218 912 238"
    width={width}
    height={height}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="ESHANI"
    role="img"
    style={!width && !height ? { width: '100%', height: '100%' } : undefined}
  >
    {/* E — top & middle bars */}
    <rect fill={fill} x="227.6" y="255.8" width="130.1" height="32.4" />
    <rect fill={fill} x="227.6" y="337.4" width="130.1" height="32.4" />

    {/* S — complex shape (includes bottom-of-E bar) */}
    <path
      fill={fill}
      d="M495.3,337.4h0c-18.7,0-37.4.2-56-.5-7.7-.3-10.7,1.1-17.7-3.2-15.7-9.6-16.8-32.8.4-41.5,1.3-.6,6.3-2.7,7.5-2.7h106.4v-33.3c-21.5,0-43.1.2-64.6.1-30.6-.2-58.9-6.2-81.7,19-14.3,15.8-16.8,37.1-10,57,5.9,17.1,14.5,35,41.1,37,26.6,2,55.5-2,82.2.4,17,1.4,37.3-5.6,48.6,10.9,7.5,10.9,4.3,25.1-5.7,33.2-5.6,4.5-8.3,3.5-14.9,3.8-56.6,2.7-115-.7-171.8,0-43.8.3-87.6-.4-131.3.5v32.4h312.5c3.8,0,15.4-5.1,19-7.2,30.3-17.6,38.5-56.9,17.5-85.2-19.5-26.4-52.6-20.9-81.4-20.7Z"
    />

    {/* H + A — combined letterform */}
    <path
      fill={fill}
      d="M750.3,409.7v-152.1h-32.4v80.3h-80.4v-80.3h-32.4v192.9h32.4v-80.3h80.4v80.3h40c.3-.4.6-.7.9-1.1,32.6-39.2,63.3-79.9,95.9-119.1v120.2h32.4v-208.9l-136.8,168.1h0Z"
    />

    {/* N — diagonal letterform */}
    <path
      fill={fill}
      d="M1064,320.7h-31.4c-.2,0-.9.6-1.1,1.2-.2.6.4,1,.4,1.2v76.5l-1.5-.5c-40.1-50.5-81.1-100.3-121.5-150.6-1.6-2-3.2-4.8-4.9-6.6-.5-.5-.8-.3-1.4-.3h.2v209.5h32.9v-119.8c0,0,.2,0,.2-.1,1.7,2.2,3.8,4.8,6.3,7.9,28.3,35.3,57.2,70.4,85.2,106,1.1,1.4,2.5,3.1,3.5,4.5.4.5.5,1.5.5,1.5h33.3v-129.7c0-.1-.7-.7-.7-.7Z"
    />

    {/* I — vertical bar */}
    <rect fill={fill} x="1083.4" y="320.6" width="32.9" height="130" />

    {/* Brand mark — snowflake / asterisk above I */}
    <path fill={fill} d="M1115.6,278.1h0c4.9-7.4,5.4-8.4,1.7-22-3.7-13.6-10.9-25.7-18.1-37.6-.6-.4-1.7,1.1-7.5,11.4-5.8,10.3-16.9,26.4-12.2,42.6s26.6,19.6,36,5.6Z" />
    <path fill={fill} d="M1097.9,294.9c-7.4,1.2-7.9,12.7,1.1,12.6,9-.1,8.1-14.1-1.1-12.6Z" />
    <path fill={fill} d="M1088.5,302.7h0c4.5-4.6-.6-12.3-6.1-10.8s-6.2,9.4-1.2,11.9c2.3,1.1,5.5.7,7.3-1.1Z" />
    <path fill={fill} d="M1115.8,292h0c-6.2-1.7-10.6,6.2-6.1,10.7,1.8,1.9,2.3,3.7,7.3,1.2s5-10.2-1.2-11.9Z" />
    <path fill={fill} d="M1065.3,262.9c10.7,1.2,9-14.2-.3-12.3-6.4,1.3-10.4,11.1.3,12.3Z" />
    <path fill={fill} d="M1130.3,262.9c10.6,1.6,9.7-14.1,0-12.3-6.1,1.1-10.6,10.7,0,12.3Z" />
    <path fill={fill} d="M1066.4,266.6c-6.1,1.1-6.5,11.3,0,12.3,10.6,1.6,9.7-14.1,0-12.3Z" />
    <path fill={fill} d="M1129,266.6c-6.4,1.3-10.4,11.1.3,12.3,10.7,1.2,9-14.2-.3-12.3Z" />
    <path fill={fill} d="M1071.3,280.8c-4.6,1.1-6,7.2-2.9,10.5,2.2,2.3,6.8,2.5,9,.3,4.6-4.7.4-12.3-6.1-10.8Z" />
    <path fill={fill} d="M1126.9,280.9c-6.5-1.6-10.7,6.1-6.1,10.7,2.2,2.3,5.9,3.1,9-.2,3.1-3.3,3.6-8.9-2.9-10.5Z" />
  </svg>
);

export default EshaniLogo;
