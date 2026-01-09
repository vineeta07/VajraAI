
import { CONFIG } from 'src/config-global';

import { BlogView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Fraud Alerts / News - ${CONFIG.appName}`}</title>

      <BlogView />
    </>
  );
}
