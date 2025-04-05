import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

function Layout() {
  return (
    <Box minH="100vh" bg="gray.50" overflowY="auto">
      <Navigation />
      <Container maxW="container.xl" py={8} px={4}>
        <Box
          maxW="1200px"
          mx="auto"
          w="full"
          bg="white"
          borderRadius="xl"
          shadow="sm"
          p={6}
        >
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
}

export default Layout; 