import { SvgColor } from "src/components/svg-color";
const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;
export const navData = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: icon("ic-analytics")
  },
  {
    title: "Analyzer",
    path: "/analyze",
    icon: icon("ic-cart")
  },
  {
    title: "Upload Data",
    path: "/upload",
    icon: icon("ic-blog")
  },
  {
    title: "Vendors",
    path: "/vendors",
    icon: icon("ic-user")
  },
  {
    title: "Risk Heatmap",
    path: "/heatmap",
    icon: icon("ic-cart")
  }
];
