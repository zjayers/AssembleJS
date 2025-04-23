import React from 'react';
import DocsSidebar from '../components/docs/DocsSidebar';
import DocsContent from '../components/docs/DocsContent';
import { Helmet } from 'react-helmet';

const DocsPage = () => {
  return (
    <>
      <Helmet>
        <title>Documentation | AssembleJS</title>
        <meta name="description" content="AssembleJS documentation - learn how to build modern micro-frontend applications." />
      </Helmet>
      <div className="docs-container" role="main">
        <DocsSidebar />
        <DocsContent />
      </div>
    </>
  );
};

export default DocsPage;