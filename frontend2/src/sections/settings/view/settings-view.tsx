import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SettingsView() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    darkMode: false,
    twoFactorAuth: true,
    autoLogout: true,
    dataSharing: false,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleToggle = (field: string) => () => {
    setSettings({ ...settings, [field]: !settings[field as keyof typeof settings] });
  };

  const handlePasswordChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [field]: event.target.value });
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const handleChangePassword = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Changing password...');
    alert('Password changed successfully!');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Settings
      </Typography>

      <Stack spacing={3}>
        {/* Notifications Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <Iconify icon="solar:pen-bold" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notifications
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleToggle('emailNotifications')}
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 6, mt: -1 }}>
                Receive fraud alerts and investigation updates via email
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsAlerts}
                    onChange={handleToggle('smsAlerts')}
                  />
                }
                label="SMS Alerts"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 6, mt: -1 }}>
                Get critical fraud alerts via SMS
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <Iconify icon="solar:shield-keyhole-bold-duotone" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Security
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorAuth}
                    onChange={handleToggle('twoFactorAuth')}
                  />
                }
                label="Two-Factor Authentication"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 6, mt: -1 }}>
                Add an extra layer of security to your account
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoLogout}
                    onChange={handleToggle('autoLogout')}
                  />
                }
                label="Auto Logout (30 min inactivity)"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 6, mt: -1 }}>
                Automatically logout after 30 minutes of inactivity
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <Iconify icon="solar:eye-bold" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2} sx={{ maxWidth: 400 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwords.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwords.newPassword}
                onChange={handlePasswordChange('newPassword')}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleChangePassword}
                sx={{ alignSelf: 'flex-start' }}
                startIcon={<Iconify icon="solar:eye-bold" />}
              >
                Update Password
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <Iconify icon="solar:eye-bold" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Privacy
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.dataSharing}
                    onChange={handleToggle('dataSharing')}
                  />
                }
                label="Data Sharing with Partner Agencies"
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 6, mt: -1 }}>
                Allow sharing of anonymized fraud patterns with partner agencies
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSaveSettings}
            startIcon={<Iconify icon="solar:eye-bold" />}
          >
            Save All Settings
          </Button>
        </Box>
      </Stack>
    </DashboardContent>
  );
}