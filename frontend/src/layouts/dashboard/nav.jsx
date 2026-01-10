import { useEffect } from "react";
import { varAlpha } from "minimal-shared/utils";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import ListItemButton from "@mui/material/ListItemButton";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import { usePathname } from "src/routes/hooks";
import { RouterLink } from "src/routes/components";
import { Logo } from "src/components/logo";
import { Iconify } from "src/components/iconify";
import { Scrollbar } from "src/components/scrollbar";
export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery
}) {
  const theme = useTheme();
  return <Box
    sx={{
      px: 2,
      top: 0,
      left: 0,
      height: 1,
      display: "none",
      position: "fixed",
      flexDirection: "column",
      zIndex: "var(--layout-nav-zIndex)",
      width: "var(--layout-nav-vertical-width)",
      borderRight: `1px solid ${varAlpha(theme.vars.palette.grey["500Channel"], 0.12)}`,
      [theme.breakpoints.up(layoutQuery)]: {
        display: "flex"
      },
      ...sx
    }}
  >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>;
}
export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces
}) {
  const pathname = usePathname();
  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [pathname]);
  return <Drawer
    open={open}
    onClose={onClose}
    sx={{
      [`& .${drawerClasses.paper}`]: {
        pt: 2.5,
        px: 2.5,
        overflow: "unset",
        width: "var(--layout-nav-mobile-width)",
        ...sx
      }
    }}
  >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>;
}
const accountMenuItems = [
  {
    title: "Profile",
    path: "/profile",
    icon: <Iconify width={24} icon={"solar:user-circle-bold-duotone"} />
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <Iconify width={24} icon={"solar:settings-bold-duotone"} />
  },
  {
    title: "Logout",
    path: "/sign-in",
    icon: <Iconify width={24} icon={"solar:logout-2-bold-duotone"} />,
    isLogout: true
  }
];
export function NavContent({ data, slots, workspaces, sx }) {
  const pathname = usePathname();
  const handleLogout = () => {
    console.log("Logging out...");
    window.location.href = "/sign-in";
  };
  return <>
      {
    /* Logo centered and bigger */
  }
      <Box sx={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
        <Logo sx={{ width: 230, height: 200 }} />
      </Box>

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box
    component="nav"
    sx={[
      {
        display: "flex",
        flex: "1 1 auto",
        flexDirection: "column"
      },
      ...Array.isArray(sx) ? sx : [sx]
    ]}
  >
          <Box
    component="ul"
    sx={{
      gap: 0.5,
      display: "flex",
      flexDirection: "column"
    }}
  >
            {
    /* Main navigation items */
  }
            {data.map((item) => {
    const isActived = item.path === pathname;
    return <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
      disableGutters
      component={RouterLink}
      href={item.path}
      sx={[
        (theme) => ({
          pl: 2,
          py: 1,
          gap: 2,
          pr: 1.5,
          borderRadius: 0.75,
          typography: "body2",
          fontWeight: "fontWeightMedium",
          color: theme.vars.palette.text.secondary,
          minHeight: 44,
          ...isActived && {
            fontWeight: "fontWeightSemiBold",
            color: theme.vars.palette.primary.main,
            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            "&:hover": {
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16)
            }
          }
        })
      ]}
    >
                    <Box component="span" sx={{ width: 24, height: 24 }}>
                      {item.icon}
                    </Box>

                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>

                    {item.info && item.info}
                  </ListItemButton>
                </ListItem>;
  })}

            {
    /* Account items - Profile, Settings, Logout (right below main nav) */
  }
            {accountMenuItems.map((item) => {
    const isActived = item.path === pathname;
    if (item.isLogout) {
      return <ListItem disableGutters disablePadding key={item.title}>
                    <ListItemButton
        disableGutters
        onClick={handleLogout}
        sx={[
          (theme) => ({
            pl: 2,
            py: 1,
            gap: 2,
            pr: 1.5,
            borderRadius: 0.75,
            typography: "body2",
            fontWeight: "fontWeightMedium",
            color: theme.vars.palette.text.secondary,
            minHeight: 44,
            "&:hover": {
              bgcolor: varAlpha(theme.vars.palette.grey["500Channel"], 0.08)
            }
          })
        ]}
      >
                      <Box component="span" sx={{ width: 24, height: 24 }}>
                        {item.icon}
                      </Box>
                      <Box component="span" sx={{ flexGrow: 1 }}>
                        {item.title}
                      </Box>
                    </ListItemButton>
                  </ListItem>;
    }
    return <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
      disableGutters
      component={RouterLink}
      href={item.path}
      sx={[
        (theme) => ({
          pl: 2,
          py: 1,
          gap: 2,
          pr: 1.5,
          borderRadius: 0.75,
          typography: "body2",
          fontWeight: "fontWeightMedium",
          color: theme.vars.palette.text.secondary,
          minHeight: 44,
          ...isActived && {
            fontWeight: "fontWeightSemiBold",
            color: theme.vars.palette.primary.main,
            bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            "&:hover": {
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16)
            }
          }
        })
      ]}
    >
                    <Box component="span" sx={{ width: 24, height: 24 }}>
                      {item.icon}
                    </Box>
                    <Box component="span" sx={{ flexGrow: 1 }}>
                      {item.title}
                    </Box>
                  </ListItemButton>
                </ListItem>;
  })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}
    </>;
}
