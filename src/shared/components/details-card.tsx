import type React from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Divider } from '@mui/material';

interface DetailsCardProps {
  title: string;
  children: React.ReactNode;
  minWidth?: string;
}

export const DetailsCard = ({
  title,
  children,
  minWidth = '20%'
}: DetailsCardProps) => (
  <Card sx={{
    minWidth,
    boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
    height: '100%',
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
      transform: 'translateY(-2px)'
    }
  }}>
    <CardHeader
      title={
        <Typography
          variant="overline"
          sx={{
            padding: '4px 8px',
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: '#2a3f5f'
          }}
        >
          {title}
        </Typography>
      }
      sx={{
        background: 'linear-gradient(to right, #f8f9fa, #edf2f7)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '4px 16px',
        height: '40px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
      }}
    />
    <CardContent
      sx={{
        backgroundColor: '#ffffff',
        py: 2,
        px: 3,
        '&:last-child': {
          paddingBottom: 3
        },
        borderRadius: '0 0 12px 12px'
      }}
    >
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

interface DetailsCardItemProps {
  label: string;
  value?: React.ReactNode;
}

export const DetailsCardItem = ({ label, value }: DetailsCardItemProps) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {label}:
      </Typography>
      <Box sx={{ flexGrow: 1 }}>{value}</Box>
    </Box>
    <Divider sx={{ mt: 1 }} />
  </Box>
);
