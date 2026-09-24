import { FloatButton } from 'antd';
import React from 'react';

/**
 * Back-to-top only. Help lives in the header; a second floating Help button sat
 * over the table pagination on the right edge.
 */
const GlobalFloatButtons: React.FC = () => (
  <FloatButton.BackTop tooltip="Back to top" visibilityHeight={600} style={{ right: 24, bottom: 72 }} />
);

export default GlobalFloatButtons;
