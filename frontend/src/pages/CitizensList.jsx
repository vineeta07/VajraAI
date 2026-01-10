import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { UserView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function CitizensList() {
  return (
    <>
      <Helmet>
        <title> {`Citizens List - ${CONFIG.appName}`}</title>
      </Helmet>

      <UserView />
    </>
  );
}
