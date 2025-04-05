import {
  Box,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await api.post(endpoint, { email, password });
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userEmail', email);
      navigate('/');
      toast({
        title: isLogin ? 'Logged in successfully' : 'Registered successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={8}>
      <VStack spacing={6}>
        <Heading>{isLogin ? 'Login' : 'Register'}</Heading>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button type="submit" colorScheme="blue" w="full">
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </VStack>
        </form>
        <Text>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Button
            variant="link"
            colorScheme="blue"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </Button>
        </Text>
      </VStack>
    </Box>
  );
}

export default Auth; 