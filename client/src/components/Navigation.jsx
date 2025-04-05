import { Box, Flex, Button, Stack, Text } from '@chakra-ui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    navigate('/auth');
  };

  // If we're on the auth page, don't show the navigation
  if (location.pathname === '/auth') return null;

  return (
    <Box bg="white" px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Box fontWeight="bold">Finance Coach</Box>
        <Stack direction="row" spacing={4} align="center">
          {userEmail ? (
            <>
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
              <Text color="gray.600">{userEmail}</Text>
              <Button onClick={handleLogout} colorScheme="red" variant="ghost">
                Logout
              </Button>
            </>
          ) : (
            <Button
              as={Link}
              to="/auth"
              colorScheme="blue"
            >
              Login / Register
            </Button>
          )}
        </Stack>
      </Flex>
    </Box>
  );
}

export default Navigation;