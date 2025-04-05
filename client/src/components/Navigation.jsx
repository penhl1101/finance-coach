import { Box, Flex, Button, Stack } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  return (
    <Box bg="white" px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Box fontWeight="bold">Finance Coach</Box>
        <Stack direction="row" spacing={4}>
          <Button
            as={Link}
            to="/"
            variant={location.pathname === "/" ? "solid" : "ghost"}
            colorScheme="blue"
          >
            Expenses
          </Button>
          <Button
            as={Link}
            to="/add-expense"
            variant={location.pathname === "/add-expense" ? "solid" : "ghost"}
            colorScheme="blue"
          >
            Add Expense
          </Button>
          <Button
            as={Link}
            to="/net-worth"
            variant={location.pathname === "/net-worth" ? "solid" : "ghost"}
            colorScheme="blue"
          >
            Net Worth
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
}

export default Navigation;