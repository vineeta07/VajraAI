import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Investigation Portal',
    path: '/investigation',
    icon: icon('ic-lock'),
  },
  {
    title: 'Citizens List',
    path: '/citizens',
    icon: icon('ic-user'),
  },
  {
    title: 'Fraud Alerts',
    path: '/fraud-alerts',
    icon: icon('ic-blog'),
  }
];
