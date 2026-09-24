import React from 'react';
import ProSkeleton from '@ant-design/pro-skeleton';

const Loading: React.FC = () => {
  return (
    <div
      style={{
        background: '#F1F5F9',
        padding: 24,
      }}
    >
      <ProSkeleton type="descriptions" />
    </div>
  );
};

export default Loading;
