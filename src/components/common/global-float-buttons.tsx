import { GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import React from 'react';

/**
 * Global float button component
 * includes: GitHub, Help, Back to Top
 */
const GlobalFloatButtons: React.FC = () => {
  return (
    <FloatButton.Group shape="circle" style={{ right: 24, bottom: 24 }}>
      {/* GitHub button */}
      <FloatButton
        icon={<GithubOutlined />}
        tooltip="GitHub Project"
        onClick={() => window.open('https://github.com/zven21/handan', '_blank')}
      />

      {/* Help docs button */}
      <FloatButton
        icon={<QuestionCircleOutlined />}
        tooltip="Help"
        onClick={() => window.open('https://github.com/zven21/handan/blob/master/README.md', '_blank')}
      />

      {/* Back-to-top button */}
      <FloatButton.BackTop tooltip="Back to Top" visibilityHeight={300} />
    </FloatButton.Group>
  );
};

export default GlobalFloatButtons;
