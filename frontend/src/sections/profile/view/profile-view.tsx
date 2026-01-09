import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProfileView() {
  const [formData, setFormData] = useState({
    displayName: 'Admin User',
    email: 'admin@vajra.gov.in',
    phone: '+91 98765 43210',
    department: 'Fraud Investigation Unit',
    designation: 'Senior Analyst',
    employeeId: 'VAJ-2024-001',
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    alert('Profile updated successfully!');
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 4 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Avatar
              src="/assets/images/avatar/avatar-1.webp"
              alt={formData.displayName}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {formData.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {formData.designation}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formData.department}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:cart-3-bold" />}
                size="small"
              >
                Change Photo
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Edit Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Edit Profile Information
              </Typography>

              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Display Name"
                      value={formData.displayName}
                      onChange={handleChange('displayName')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Employee ID"
                      value={formData.employeeId}
                      onChange={handleChange('employeeId')}
                      disabled
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={formData.department}
                      onChange={handleChange('department')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Designation"
                      value={formData.designation}
                      onChange={handleChange('designation')}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button variant="outlined" color="inherit">
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    startIcon={<Iconify icon="solar:cart-3-bold" />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}