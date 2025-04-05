import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Icon,
  InputGroup,
  InputLeftElement,
  Box,
} from '@chakra-ui/react';
import { FiDollarSign, FiFileText, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddExpense() {
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/expenses', expense);
      toast({
        title: 'Expense added.',
        description: "We've added your expense successfully.",
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error adding expense.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="full">
      <Heading size="lg" mb={6} color="blue.600">Add New Expense</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiFileText} color="gray.300" />
              </InputLeftElement>
              <Input
                pl="40px"
                value={expense.description}
                onChange={(e) => setExpense({...expense, description: e.target.value})}
                placeholder="Enter expense description"
                bg="white"
                border="1px"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
              />
            </InputGroup>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Amount</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiDollarSign} color="gray.300" />
              </InputLeftElement>
              <Input
                pl="40px"
                type="number"
                step="0.01"
                value={expense.amount}
                onChange={(e) => setExpense({...expense, amount: e.target.value})}
                placeholder="Enter amount"
                bg="white"
                border="1px"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiCalendar} color="gray.300" />
              </InputLeftElement>
              <Input
                pl="40px"
                type="date"
                value={expense.date}
                onChange={(e) => setExpense({...expense, date: e.target.value})}
                bg="white"
                border="1px"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
              />
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={isLoading}
            loadingText="Adding..."
            w="full"
            mt={4}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            Add Expense
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default AddExpense;