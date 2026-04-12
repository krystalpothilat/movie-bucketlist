import React from 'react';
import './styles/WheelSlice.css';

const HUB_R = 20;
const RIM_PAD = 5;
const HUB_PAD = 5;

const WheelSlice = ({ index, total, radius, movie, fontSize, color }) => {
  const angle = (2 * Math.PI) / total;
  const midAngle = index * angle - Math.PI / 2 + angle / 2;
  const rotateDeg = (midAngle * 180) / Math.PI + 180;

  // Slice path
  const buildPath = () => {
    if (total === 1) {
      return `M0,0 m-${radius},0 a${radius},${radius} 0 1,0 ${radius * 2},0 a${radius},${radius} 0 1,0 -${radius * 2},0`;
    }
    const startAngle = index * angle - Math.PI / 2;
    const endAngle = startAngle + angle;
    const x1 = radius * Math.cos(startAngle);
    const y1 = radius * Math.sin(startAngle);
    const x2 = radius * Math.cos(endAngle);
    const y2 = radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return `M0,0 L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
  };

  // Text box: always from (HUB_R + HUB_PAD) to (radius - RIM_PAD)
  const boxW = radius - RIM_PAD - HUB_R - HUB_PAD; // e.g. 145-5-20-5 = 115
  const boxH = fontSize + 4;

  const OUTER_R = radius - 5; // rim padding
  // Anchor point: midpoint of the text box along the radius
  const anchorR = OUTER_R;
  const anchorX = anchorR * Math.cos(midAngle);
  const anchorY = anchorR * Math.sin(midAngle);

  return (
    <g>
      <path d={buildPath()} fill={color.bg} stroke="white" strokeWidth="2" />
      <foreignObject
        x={anchorX}
        y={anchorY - boxH / 2}
        width={boxW}
        height={boxH}
        transform={`rotate(${rotateDeg}, ${anchorX}, ${anchorY})`}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          className="wheel-slice-label"
          style={{
            fontSize: `${fontSize}px`,
            color: color.text,
            justifyContent: 'flex-start',
            textAlign: 'left',
          }}
        >
          {movie.title}
        </div>
      </foreignObject>
    </g>
  );
};

export default WheelSlice;
