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
  Container,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
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
    <Container maxW="container.xl" h="100vh" centerContent>
      <Box 
        w="full" 
        h="full" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bgGradient="linear(to-r, blue.50, purple.50)"
      >
        <Card 
          maxW="md" 
          w="full" 
          mx={4}
          boxShadow="2xl"
          borderRadius="2xl"
          overflow="hidden"
          bg="white"
          _hover={{
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <Box textAlign="center">
                <Heading 
                  size="2xl" 
                  mb={6}
                  fontWeight="extrabold"
                  bgGradient="linear(to-r, blue.500, purple.500, pink.500)"
                  bgClip="text"
                  letterSpacing="tight"
                  textShadow="0 2px 10px rgba(0,0,0,0.1)"
                >
                  Finance Coach
                </Heading>
                <Heading 
                  size="md" 
                  color="gray.700" 
                  mb={3}
                  fontWeight="medium"
                >
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </Heading>
                <Text 
                  color="gray.500"
                  fontSize="lg"
                  maxW="sm"
                  mx="auto"
                >
                  {isLogin 
                    ? 'Track your expenses and build wealth' 
                    : 'Join us and start your financial journey'}
                </Text>
              </Box>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiMail} color="gray.300" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        bg="white"
                        borderRadius="lg"
                        _hover={{ borderColor: 'blue.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiLock} color="gray.300" />
                      </InputLeftElement>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg="white"
                        borderRadius="lg"
                        _hover={{ borderColor: 'blue.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
                      />
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    borderRadius="lg"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </VStack>
              </form>

              <Divider />

              <Box textAlign="center">
                <Text color="gray.600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Button
                    variant="link"
                    colorScheme="blue"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Button>
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
}

export default Auth; 