import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';

interface PieChartComponentProps {
  score: number;
  total: number;
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ score, total }) => {
  const theme = useTheme();


  const data = [
    {
      id: 0,
      value: score,
      label: 'Correct',
      color: theme.palette.success.main,
    },
    {
      id: 1,
      value: total - score,
      label: 'Incorrect',
      color: theme.palette.error.main,
    },
  ];

  return (
    <PieChart
      series={[
        {
          data,
          innerRadius: 30,
          outerRadius: 100,
          paddingAngle: 5,
          cornerRadius: 5,
          arcLabel: () => '',
        },
      ]}
      width={250}
      height={300}
      slotProps={{
        legend: {
          direction: 'row' as any,
          position: {
            vertical: 'bottom',
            horizontal: 'middle' as any,
          },
        },
      }}
    />
  )
};

export default PieChartComponent;
