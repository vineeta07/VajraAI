import { useState } from "react";
import { CONFIG } from "src/config-global";
import { ProductsView } from "src/sections/product/view/products-view";
import { useTheme } from "src/hooks/useTheme";

export default function Page() {
  const { isDark } = useTheme();
  const [savings, setSavings] = useState({ blocked: 0, ghosts: 0, firs: 0 });

  return (
    <>
      <title>{`Investigation - ${CONFIG.appName}`}</title>
      <ProductsView darkMode={isDark} />
    </>
  );
}
