import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import LinearProgress from '@mui/material/LinearProgress';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  aadhaar?: string;
  scheme?: string;
  district?: string;
  riskFlag?: string;
  riskScore?: number;
  amount?: number;
  status: string;
  avatarUrl: string;
  isVerified: boolean;
  company: string;
  role: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
};

export function UserTableRow({ row, selected, onSelectRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const getRiskColor = (score: number) => {
    if (score > 70) return 'error';
    if (score > 50) return 'warning';
    return 'success';
  };

  const getStatusColor = (status: string) => {
    if (status === 'flagged') return 'error';
    if (status === 'review') return 'warning';
    return 'success';
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar alt={row.name} src={row.avatarUrl} />
            <Box>
              <Box sx={{ fontWeight: 600 }}>{row.name}</Box>
            </Box>
          </Box>
        </TableCell>

        <TableCell sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {row.aadhaar || 'N/A'}
        </TableCell>

        <TableCell>
          <Label color="info" variant="soft">
            {row.scheme || row.role}
          </Label>
        </TableCell>

        <TableCell>{row.district || row.company}</TableCell>

        <TableCell>
          <Label color="error" variant="soft">
            {row.riskFlag || 'None'}
          </Label>
        </TableCell>

        <TableCell align="center">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ fontWeight: 700, color: getRiskColor(row.riskScore || 0) === 'error' ? '#ef4444' : getRiskColor(row.riskScore || 0) === 'warning' ? '#f59e0b' : '#22c55e' }}>
              {row.riskScore || 0}%
            </Box>
            <LinearProgress
              variant="determinate"
              value={row.riskScore || 0}
              color={getRiskColor(row.riskScore || 0)}
              sx={{ width: 60, height: 6, borderRadius: 3 }}
            />
          </Box>
        </TableCell>

        <TableCell sx={{ fontWeight: 600 }}>
          ₹{(row.amount || 0).toLocaleString('en-IN')}
        </TableCell>

        <TableCell>
          <Label color={getStatusColor(row.status)}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 160,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleClosePopover} sx={{ color: 'primary.main' }}>
            <Iconify icon="mdi:eye" />
            View Details
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'warning.main' }}>
            <Iconify icon="mdi:file-document" />
            Investigate
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'success.main' }}>
            <Iconify icon="mdi:check-circle" />
            Mark Cleared
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="mdi:block-helper" />
            Block Payment
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
