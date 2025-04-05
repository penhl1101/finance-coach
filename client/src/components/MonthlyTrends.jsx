import { Card, CardBody, Heading, Box } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MonthlyTrends({ monthlyData }) {
  const data = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.values(monthlyData),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Expense Trends'
      }
    }
  };

  return (
    <Card bg="white" shadow="xl" borderRadius="xl">
      <CardBody>
        <Heading size="md" mb={4}>Monthly Trends</Heading>
        <Box h="300px">
          <Line data={data} options={options} />
        </Box>
      </CardBody>
    </Card>
  );
}

export default MonthlyTrends; 