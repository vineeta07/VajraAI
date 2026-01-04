import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { PostItem } from '../post-item';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';

import type { IPostItem } from '../post-item';

// ----------------------------------------------------------------------

// Fraud-related mock data
const fraudPosts: IPostItem[] = [
  {
    id: 'fraud-1',
    title: '₹28 Cr Ghost Beneficiary Scam Detected in PM-KISAN Scheme - Adarsh Nagar District',
    description: 'AI system flagged 1,247 non-existent beneficiaries receiving monthly payments. Multiple Aadhaar IDs linked to same bank accounts detected.',
    coverUrl: '/assets/images/cover/cover-1.webp',
    totalViews: 12420,
    totalComments: 342,
    totalShares: 1856,
    totalFavorites: 2870,
    postedAt: new Date().toISOString(),
    author: { name: 'ML Fraud Engine', avatarUrl: '/assets/images/avatar/avatar-1.webp' },
  },
  {
    id: 'fraud-2',
    title: 'Bid Rigging Cartel Exposed: 5 Shell Companies Won 89% of PWD Road Contracts',
    description: 'Pattern analysis revealed interconnected ownership structures. Same directors appearing across multiple bidding companies.',
    coverUrl: '/assets/images/cover/cover-2.webp',
    totalViews: 9832,
    totalComments: 256,
    totalShares: 1423,
    totalFavorites: 1950,
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    author: { name: 'Procurement AI', avatarUrl: '/assets/images/avatar/avatar-2.webp' },
  },
  {
    id: 'fraud-3',
    title: 'After-Hours Payment Anomaly: ₹4.2 Cr Transferred at 2 AM from Education Ministry',
    description: 'Unusual transaction timing detected. 47 payments processed outside working hours to newly created vendor accounts.',
    coverUrl: '/assets/images/cover/cover-3.webp',
    totalViews: 7654,
    totalComments: 189,
    totalShares: 892,
    totalFavorites: 1340,
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    author: { name: 'Spending Monitor', avatarUrl: '/assets/images/avatar/avatar-3.webp' },
  },
  {
    id: 'fraud-4',
    title: 'Same Bank Account Linked to 156 Pension Beneficiaries in Narela',
    description: 'Welfare fraud pattern identified. Deceased individuals and duplicate entries receiving monthly pension payments.',
    coverUrl: '/assets/images/cover/cover-4.webp',
    totalViews: 11205,
    totalComments: 423,
    totalShares: 1678,
    totalFavorites: 2150,
    postedAt: new Date(Date.now() - 259200000).toISOString(),
    author: { name: 'Pattern Detector', avatarUrl: '/assets/images/avatar/avatar-4.webp' },
  },
  {
    id: 'fraud-5',
    title: 'Contract Price Inflation Alert: Delhi Jal Board Project 340% Above Market Rate',
    description: 'Price anomaly flagged in water pipeline contract. Similar projects in other districts cost 70% less.',
    coverUrl: '/assets/images/cover/cover-5.webp',
    totalViews: 8340,
    totalComments: 267,
    totalShares: 1234,
    totalFavorites: 1780,
    postedAt: new Date(Date.now() - 345600000).toISOString(),
    author: { name: 'Price Validator', avatarUrl: '/assets/images/avatar/avatar-5.webp' },
  },
  {
    id: 'fraud-6',
    title: 'Spending Spike Detected: Health Department 10x Budget Utilization in Single Week',
    description: 'Unusual expenditure pattern flagged. Emergency procurement without proper documentation.',
    coverUrl: '/assets/images/cover/cover-6.webp',
    totalViews: 6789,
    totalComments: 156,
    totalShares: 723,
    totalFavorites: 1120,
    postedAt: new Date(Date.now() - 432000000).toISOString(),
    author: { name: 'Budget AI', avatarUrl: '/assets/images/avatar/avatar-6.webp' },
  },
  {
    id: 'fraud-7',
    title: 'Duplicate Scholarship Payments: 892 Students Received Benefits from 3 Schemes',
    description: 'Cross-scheme analysis revealed multiple benefit fraud. Same students enrolled in mutually exclusive programs.',
    coverUrl: '/assets/images/cover/cover-7.webp',
    totalViews: 5432,
    totalComments: 134,
    totalShares: 567,
    totalFavorites: 890,
    postedAt: new Date(Date.now() - 518400000).toISOString(),
    author: { name: 'Welfare Monitor', avatarUrl: '/assets/images/avatar/avatar-7.webp' },
  },
  {
    id: 'fraud-8',
    title: 'Phantom Contractor Network: 12 Firms With Same Address Won ₹67 Cr in Contracts',
    description: 'Shell company detection algorithm identified fictitious contractors. All registered at same location with shared directors.',
    coverUrl: '/assets/images/cover/cover-8.webp',
    totalViews: 9123,
    totalComments: 312,
    totalShares: 1456,
    totalFavorites: 2010,
    postedAt: new Date(Date.now() - 604800000).toISOString(),
    author: { name: 'Entity Analyzer', avatarUrl: '/assets/images/avatar/avatar-8.webp' },
  },
  {
    id: 'fraud-9',
    title: 'Incomplete Work Certified 100%: Flyover Project in Model Town Flagged',
    description: 'Physical verification mismatch detected. Contractor received full payment for 60% completed work.',
    coverUrl: '/assets/images/cover/cover-9.webp',
    totalViews: 7890,
    totalComments: 245,
    totalShares: 1089,
    totalFavorites: 1560,
    postedAt: new Date(Date.now() - 691200000).toISOString(),
    author: { name: 'Quality Control AI', avatarUrl: '/assets/images/avatar/avatar-9.webp' },
  },
  {
    id: 'fraud-10',
    title: 'GST Evasion Suspected: ₹50 Cr Invoice Fraud Uncovered in ITC Claims',
    description: 'Duplicate invoices and inflated values detected in GST reimbursement claims. Potential revenue loss of ₹10 Cr identified.',
    coverUrl: '/assets/images/cover/cover-10.webp',
    totalViews: 8901,
    totalComments: 267,
    totalShares: 1345,
    totalFavorites: 1789,
    postedAt: new Date(Date.now() - 777600000).toISOString(),
    author: { name: 'Tax Fraud Detector', avatarUrl: '/assets/images/avatar/avatar-10.webp' },
  },
];

// ----------------------------------------------------------------------

export function BlogView() {
  const [sortBy, setSortBy] = useState('latest');

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Fraud Alerts / News 
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<Iconify icon="mingcute:alert-line" />}
        >
          Report Fraud
        </Button>
      </Box>

      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <PostSearch posts={fraudPosts} />
        <PostSort
          sortBy={sortBy}
          onSort={handleSort}
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'severity', label: 'High Severity' },
            { value: 'amount', label: 'Highest Amount' },
          ]}
        />
      </Box>

      <Grid container spacing={3}>
        {fraudPosts.map((post, index) => {
          const latestPostLarge = index === 0;
          const latestPost = index === 1 || index === 2;

          return (
            <Grid
              key={post.id}
              size={{
                xs: 12,
                sm: latestPostLarge ? 12 : 6,
                md: latestPostLarge ? 6 : 3,
              }}
            >
              <PostItem post={post} latestPost={latestPost} latestPostLarge={latestPostLarge} />
            </Grid>
          );
        })}
      </Grid>

      <Pagination count={5} color="primary" sx={{ mt: 8, mx: 'auto' }} />
    </DashboardContent>
  );
}
