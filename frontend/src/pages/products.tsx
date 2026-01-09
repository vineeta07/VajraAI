import React, { useState } from 'react';

import { CONFIG } from 'src/config-global';

import {ProductsView} from 'src/sections/product/view/products-view';

// ----------------------------------------------------------------------

export default function Page() {
  const [savings, setSavings] = useState({ blocked: 0, ghosts: 0, firs: 0 });

  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>

      <ProductsView darkMode={false} />
    </>
  );
}
