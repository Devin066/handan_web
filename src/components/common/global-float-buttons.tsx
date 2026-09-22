import { QuestionCircleOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import React from 'react';
import brand from '@/config/brand';

/**
 * Global float button component
 * includes: Help, Back to Top
 */
const GlobalFloatButtons: React.FC = () => {
  return (
    <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
      {/* Help docs button */}
      <FloatButton
        icon={<QuestionCircleOutlined />}
        tooltip="Help"
        onClick={() => window.open(brand.helpUrl, '_blank')}
      />

      {/* Back-to-top button */}
      <FloatButton.BackTop tooltip="Back to Top" visibilityHeight={300} />
    </FloatButton.Group>
  );
};

export default GlobalFloatButtons;
