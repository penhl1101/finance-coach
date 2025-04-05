import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Text,
  Circle,
  Flex,
  Icon,
  Button,
  Tooltip,
  Progress,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from '@chakra-ui/react';
import { Pie, Bar } from 'react-chartjs-2';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiMoreVertical, FiAlertCircle } from 'react-icons/fi';
import api from '../api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import MonthlyTrends from './MonthlyTrends';
import AIInsights from './AIInsights';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [editingExpense, setEditingExpense] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchMonthlyData();
    if (expenses.length > 0) {
      fetchAIInsights();
    }
  }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/expenses');
      setExpenses(response.data);
    } catch (error) {
      setError('Error fetching expenses. Please try again.');
      console.error('Error details:', error.response || error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      if (response.data) {
        setCategoryTotals(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await api.get('/api/summary/monthly');
      setMonthlyData(response.data);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const response = await api.post('/api/ai-insights', { expenses });
      setAiInsights(response.data.aiAdvice);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const averageExpense = expenses.length ? totalExpenses / expenses.length : 0;

  const getAiInsights = async () => {
    try {
      if (!expenses.length) {
        toast({
          title: "No Data",
          description: "Please add some expenses first",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
        return;
      }
      const response = await api.post('/api/analyze', {
        expenses: expenses
      });
      if (response.data && response.data.insights) {
        setAiInsights(response.data.insights);
        onOpen();
      }
    } catch (error) {
      console.error('Error getting insights:', error);
      toast({
        title: "Error",
        description: "Failed to get AI insights. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  const monthlyBudget = 2000;
  const budgetProgress = (totalExpenses / monthlyBudget) * 100;

  const pieChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };

  const showSuccessToast = (message) => {
    toast({
      title: "Success",
      description: message,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right"
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      showSuccessToast("Expense deleted successfully");
      fetchExpenses();
      fetchCategories();
      fetchMonthlyData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  const handleEdit = async (expense) => {
    setEditingExpense(expense);
    onEditOpen();
  };

  const handleUpdate = async (updatedExpense) => {
    try {
      await api.put(`/api/expenses/${editingExpense._id}`, updatedExpense);
      fetchExpenses();
      fetchCategories();
      fetchMonthlyData();
      onEditClose();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const onDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (expenseToDelete) {
      await handleDelete(expenseToDelete._id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Stack spacing={8}>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Center p={8}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <>
          <Card bg="white" shadow="xl" borderRadius="xl">
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="medium">Monthly Budget Progress</Text>
                <Text color={budgetProgress > 80 ? "red.500" : "green.500"}>
                  ${totalExpenses.toFixed(2)} / ${monthlyBudget}
                </Text>
              </Flex>
              <Progress 
                value={budgetProgress} 
                colorScheme={budgetProgress > 80 ? "red" : "green"}
                borderRadius="full"
                size="sm"
              />
            </CardBody>
          </Card>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg="white" shadow="xl" borderRadius="xl">
              <CardBody>
                <Flex align="center" mb={3}>
                  <Circle size="40px" bg="blue.50" color="blue.500" mr={3}>
                    <Icon as={FiDollarSign} w={5} h={5} />
                  </Circle>
                  <Text fontWeight="medium" color="gray.500">Total Expenses</Text>
                </Flex>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="blue.500">
                    ${totalExpenses.toFixed(2)}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" shadow="xl" borderRadius="xl">
              <CardBody>
                <Flex align="center" mb={3}>
                  <Circle size="40px" bg="green.50" color="green.500" mr={3}>
                    <Icon as={FiTrendingUp} w={5} h={5} />
                  </Circle>
                  <Text fontWeight="medium" color="gray.500">Average Expense</Text>
                </Flex>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">
                    ${averageExpense.toFixed(2)}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="white" shadow="xl" borderRadius="xl">
              <CardBody>
                <Flex align="center" mb={3}>
                  <Circle size="40px" bg="purple.50" color="purple.500" mr={3}>
                    <Icon as={FiCalendar} w={5} h={5} />
                  </Circle>
                  <Text fontWeight="medium" color="gray.500">Total Entries</Text>
                </Flex>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
                    {expenses.length}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <MonthlyTrends monthlyData={monthlyData} />
            <AIInsights insights={aiInsights} />
          </SimpleGrid>

          <Card bg="white" shadow="xl" borderRadius="xl">
            <CardBody>
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">Recent Expenses</Heading>
                <HStack>
                  <Tooltip label="Get AI Insights">
                    <Button
                      leftIcon={<Icon as={FiTrendingUp} />}
                      colorScheme="purple"
                      size="sm"
                      onClick={getAiInsights}
                    >
                      AI Insights
                    </Button>
                  </Tooltip>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => fetchExpenses()}
                  >
                    Refresh
                  </Button>
                </HStack>
              </Flex>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Description</Th>
                      <Th isNumeric>Amount</Th>
                      <Th width="50px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {expenses.map((expense, index) => (
                      <Tr key={index}>
                        <Td>{new Date(expense.date).toLocaleDateString()}</Td>
                        <Td>{expense.description}</Td>
                        <Td isNumeric color={Number(expense.amount) > 100 ? "red.500" : "green.500"}>
                          ${Number(expense.amount).toFixed(2)}
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem onClick={() => handleEdit(expense)}>
                                Edit
                              </MenuItem>
                              <MenuItem onClick={() => onDeleteClick(expense)}>
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>

          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>AI Insights</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                {aiInsights ? (
                  <Text>{aiInsights}</Text>
                ) : (
                  <Flex direction="column" align="center" py={8}>
                    <Icon as={FiAlertCircle} w={8} h={8} color="gray.400" mb={4} />
                    <Text color="gray.500">No insights available yet.</Text>
                  </Flex>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>

          <Modal isOpen={isEditOpen} onClose={onEditClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Expense</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Input
                      value={editingExpense?.description || ''}
                      onChange={(e) => setEditingExpense({
                        ...editingExpense,
                        description: e.target.value
                      })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Amount</FormLabel>
                    <Input
                      type="number"
                      value={editingExpense?.amount || ''}
                      onChange={(e) => setEditingExpense({
                        ...editingExpense,
                        amount: e.target.value
                      })}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      value={editingExpense?.date || ''}
                      onChange={(e) => setEditingExpense({
                        ...editingExpense,
                        date: e.target.value
                      })}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={() => handleUpdate(editingExpense)}>
                  Save
                </Button>
                <Button onClick={onEditClose}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <AlertDialog
            isOpen={isDeleteDialogOpen}
            leastDestructiveRef={cancelRef}
            onClose={() => setIsDeleteDialogOpen(false)}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader>Delete Expense</AlertDialogHeader>
                <AlertDialogBody>
                  Are you sure you want to delete this expense? This action cannot be undone.
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button colorScheme="red" ml={3} onClick={confirmDelete}>
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </>
      )}
    </Stack>
  );
}

export default Dashboard;