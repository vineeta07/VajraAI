import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  riskScore: number;
  reason: string;
  district: string;
  scheme: string;
  status: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
};

export function UserTableRow({ row, selected, onSelectRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

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
    if (status === 'Blocked') return 'error';
    if (status === 'Investigation') return 'warning';
    return 'success';
  };

  const getSchemeColor = (scheme: string) => {
    if (scheme === 'Welfare') return 'info';
    if (scheme === 'Procurement') return 'secondary';
    return 'warning';
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
          {row.id}
        </TableCell>

        <TableCell align="center">
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ 
              fontWeight: 700, 
              color: getRiskColor(row.riskScore) === 'error' ? '#ef4444' : 
                     getRiskColor(row.riskScore) === 'warning' ? '#f59e0b' : '#22c55e' 
            }}>
              {row.riskScore}%
            </Box>
            <LinearProgress
              variant="determinate"
              value={row.riskScore}
              color={getRiskColor(row.riskScore)}
              sx={{ width: 60, height: 6, borderRadius: 3 }}
            />
          </Box>
        </TableCell>

        <TableCell sx={{ maxWidth: 250 }}>
          {row.reason}
        </TableCell>

        <TableCell>{row.district}</TableCell>

        <TableCell>
          <Label color={getSchemeColor(row.scheme)} variant="soft">
            {row.scheme}
          </Label>
        </TableCell>

        <TableCell>
          <Label color={getStatusColor(row.status)}>
            {row.status}
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
          <MenuItem
            onClick={() => {
              handleClosePopover();
              navigate('/fraud-news-alerts');
            }}
            sx={{ color: 'primary.main' }}
          >
            <Iconify icon="solar:eye-bold" />
            Fraud Alert
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'warning.main' }}>
            <Iconify icon="solar:pen-bold" />
            Investigate
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'success.main' }}>
            <Iconify icon="solar:check-circle-bold" />
            Mark Cleared
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:restart-bold" />
            Block Cleared
          </MenuItem>
          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:restart-bold" />
            Block Payment
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
