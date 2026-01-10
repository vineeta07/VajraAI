import { SvgColor } from "src/components/svg-color";
const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;
export const navData = [
  {
    title: "Dashboard",
    path: "/",
    icon: icon("ic-analytics")
  },
  {
    title: "Investigation Portal",
    path: "/investigation",
    icon: icon("ic-lock")
  },
  {
    title: "Citizens List",
    path: "/citizens",
    icon: icon("ic-user")
  },
  {
    title: "Fraud Alerts",
    path: "/fraud-alerts",
    icon: icon("ic-blog")
  }
];
