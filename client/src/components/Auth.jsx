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
  Image,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import api from '../api';
import logo from '../assets/logo.png';

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
          boxShadow="xl"
          borderRadius="xl"
          overflow="hidden"
        >
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              <Box textAlign="center">
                <Image 
                  src={logo}
                  alt="Finance Coach Logo"
                  h="60px"
                  mx="auto"
                  mb={4}
                />
                <Heading 
                  size="2xl" 
                  color="blue.500" 
                  mb={6}
                  fontWeight="bold"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  bgClip="text"
                >
                  Finance Coach
                </Heading>
                <Heading size="lg" color="blue.600" mb={2}>
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </Heading>
                <Text color="gray.600">
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