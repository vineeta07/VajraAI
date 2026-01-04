import React, { useState } from 'react';

import { CONFIG } from 'src/config-global';

import { ProductsView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  // Provide a default value for savings
  const [savings, setSavings] = useState({ blocked: 0, ghosts: 0, firs: 0 });

  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>

      <ProductsView
        darkMode={false}
      />
    </>
  );
}
