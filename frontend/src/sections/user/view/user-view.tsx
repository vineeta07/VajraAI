import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';

import { Scrollbar } from 'src/components/scrollbar';

import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { UserTableToolbar } from '../user-table-toolbar';

// ----------------------------------------------------------------------

// Citizen fraud data
const citizenData = [
  {
    id: 'CIT-001',
    name: 'John Doe',
    riskScore: 92,
    reason: 'Multiple Aadhaar linked to same bank account',
    district: 'Adarsh Nagar',
    scheme: 'Welfare',
    status: 'Blocked',
  },
  {
    id: 'CIT-002',
    name: 'Jane Smith',
    riskScore: 87,
    reason: 'Ghost beneficiary - deceased individual',
    district: 'Narela',
    scheme: 'Welfare',
    status: 'Investigation',
  },
  {
    id: 'CIT-003',
    name: 'Alice Johnson',
    riskScore: 78,
    reason: 'Duplicate scholarship claims across schemes',
    district: 'Model Town',
    scheme: 'Welfare',
    status: 'Investigation',
  },
  {
    id: 'CIT-004',
    name: 'Bob Brown',
    riskScore: 95,
    reason: 'Shell company director - bid rigging suspected',
    district: 'Rohini',
    scheme: 'Procurement',
    status: 'Blocked',
  },
  {
    id: 'CIT-005',
    name: 'Charlie White',
    riskScore: 65,
    reason: 'Unusual payment timing pattern',
    district: 'Dwarka',
    scheme: 'Spending',
    status: 'Approved',
  },
  {
    id: 'CIT-006',
    name: 'Emily Davis',
    riskScore: 88,
    reason: 'Same address as 12 registered contractors',
    district: 'Shahdara',
    scheme: 'Procurement',
    status: 'Investigation',
  },
  {
    id: 'CIT-007',
    name: 'Frank Miller',
    riskScore: 72,
    reason: 'Inflated invoice claims detected',
    district: 'South Delhi',
    scheme: 'Spending',
    status: 'Investigation',
  },
  {
    id: 'CIT-008',
    name: 'Grace Lee',
    riskScore: 91,
    reason: 'Non-existent beneficiary address',
    district: 'East Delhi',
    scheme: 'Welfare',
    status: 'Blocked',
  },
];

// ----------------------------------------------------------------------

export function UserView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterName, setFilterName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('id');

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleFilterByName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
    setPage(0);
  }, []);

  const handleSort = (id: string) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSelectAllClick = (checked: boolean) => {
    if (checked) {
      const newSelected = filteredData.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectRow = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const filteredData = citizenData.filter((row) =>
    row.id.toLowerCase().includes(filterName.toLowerCase()) ||
    row.reason.toLowerCase().includes(filterName.toLowerCase()) ||
    row.district.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <DashboardContent>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4">Citizens Risk List</Typography>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                onSort={handleSort}
                rowCount={filteredData.length}
                numSelected={selected.length}
                onSelectAllRows={handleSelectAllClick}
                headLabel={[
                  { id: 'id', label: 'ID' },
                  { id: 'riskScore', label: 'Risk Score' },
                  { id: 'reason', label: 'Reason' },
                  { id: 'district', label: 'District' },
                  { id: 'scheme', label: 'Scheme' },
                  { id: 'status', label: 'Status' },
                  { id: 'actions', label: 'Actions', align: 'right' },
                ]}
              />
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => handleSelectRow(row.id)}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={page}
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}
