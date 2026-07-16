import React from 'react';
import Layout from '../../components/layout/Layout';
import ItemReport from '../../components/ItemReport';

function SingleItemReport({ id, branch_id }) {
  return (
    <Layout>
      <ItemReport id={id} branchId={branch_id} />
    </Layout>
  );
}

export default SingleItemReport;
