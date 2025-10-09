import React from 'react';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import SearchBar from '@theme/SearchBar';

export default function ContentWrapper(props) {
  return (
    <div>
      <div style={{
        padding: '0.75rem 1rem 1rem',
        position: 'sticky',
        top: 0,
        background: 'var(--ifm-background-color)',
        zIndex: 1,
        borderBottom: '1px solid var(--ifm-toc-border-color)',
        marginBottom: '0.5rem'
      }}>
        <SearchBar />
      </div>
      <Content {...props} />
    </div>
  );
}
