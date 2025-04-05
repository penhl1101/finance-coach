import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  VStack,
  Button,
  Select,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  Progress,
  Text
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import api from '../api';

const ASSET_CATEGORIES = {
  realEstate: {
    name: 'Real Estate',
    examples: ['Primary Home', 'Rental Property', 'Land', 'Commercial Property'],
    type: 'physical'
  },
  business: {
    name: 'Business',
    examples: ['Online Store', 'Consulting Practice', 'Franchise', 'Startup'],
    type: 'active'
  },
  investments: {
    name: 'Paper Assets',
    examples: ['Stocks', 'Bonds', 'Mutual Funds', 'ETFs', 'Cryptocurrencies'],
    type: 'paper'
  },
  cashFlow: {
    name: 'Cash Flow Assets',
    examples: ['Rental Income', 'Dividend Stocks', 'Royalties', 'Online Courses'],
    type: 'passive'
  },
  intellectual: {
    name: 'Intellectual Property',
    examples: ['Patents', 'Trademarks', 'Copyrights', 'Brand Names'],
    type: 'intellectual'
  }
};

const LIABILITY_CATEGORIES = {
  shortTerm: {
    name: 'Short-term Debt',
    examples: ['Credit Card Debt', 'Personal Loans', 'Medical Bills'],
    priority: 'high'
  },
  longTerm: {
    name: 'Long-term Debt',
    examples: ['Mortgage', 'Student Loans', 'Business Loans'],
    priority: 'medium'
  },
  consumer: {
    name: 'Consumer Debt',
    examples: ['Car Loans', 'Appliance Financing', 'Electronics Payment Plans'],
    priority: 'high'
  },
  recurring: {
    name: 'Recurring Liabilities',
    examples: ['Subscriptions', 'Memberships', 'Insurance Premiums'],
    priority: 'medium'
  }
};

function NetWorthDashboard() {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const { isOpen: isAssetOpen, onOpen: onAssetOpen, onClose: onAssetClose } = useDisclosure();
  const { isOpen: isLiabilityOpen, onOpen: onLiabilityOpen, onClose: onLiabilityClose } = useDisclosure();

  const [newAsset, setNewAsset] = useState({
    name: '',
    category: '',
    value: '',
    monthlyIncome: ''
  });

  const [newLiability, setNewLiability] = useState({
    name: '',
    category: '',
    amount: '',
    interestRate: ''
  });

  // Calculate net worth and other metrics
  const totalAssets = assets.reduce((sum, asset) => sum + Number(asset.value), 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + Number(liability.amount), 0);
  const netWorth = totalAssets - totalLiabilities;
  const monthlyPassiveIncome = assets.reduce((sum, asset) => sum + Number(asset.monthlyIncome || 0), 0);

  // Add asset/liability handlers
  const handleAddAsset = async () => {
    try {
      await api.post('/api/assets', newAsset);
      // Refresh assets
      fetchAssets();
      onAssetClose();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleAddLiability = async () => {
    try {
      await api.post('/api/liabilities', newLiability);
      // Refresh liabilities
      fetchLiabilities();
      onLiabilityClose();
    } catch (error) {
      console.error('Error adding liability:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchLiabilities();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/api/assets');
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchLiabilities = async () => {
    try {
      const response = await api.get('/api/liabilities');
      setLiabilities(response.data);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
    }
  };

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Assets</Heading>
              <Button colorScheme="green" onClick={onAssetOpen}>Add Asset</Button>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Category</Th>
                    <Th isNumeric>Value</Th>
                    <Th isNumeric>Monthly Income</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {assets.map((asset, index) => (
                    <Tr key={index}>
                      <Td>{asset.name}</Td>
                      <Td>{ASSET_CATEGORIES[asset.category]?.name}</Td>
                      <Td isNumeric>${asset.value}</Td>
                      <Td isNumeric>${asset.monthlyIncome || 0}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Liabilities</Heading>
              <Button colorScheme="red" onClick={onLiabilityOpen}>Add Liability</Button>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Category</Th>
                    <Th isNumeric>Amount</Th>
                    <Th isNumeric>Interest Rate</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {liabilities.map((liability, index) => (
                    <Tr key={index}>
                      <Td>{liability.name}</Td>
                      <Td>{LIABILITY_CATEGORIES[liability.category]?.name}</Td>
                      <Td isNumeric>${liability.amount}</Td>
                      <Td isNumeric>{liability.interestRate}%</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Add Asset Modal */}
      <Modal isOpen={isAssetOpen} onClose={onAssetClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Asset</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Asset Name</FormLabel>
                <Input
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                >
                  {Object.entries(ASSET_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Value</FormLabel>
                <Input
                  type="number"
                  value={newAsset.value}
                  onChange={(e) => setNewAsset({...newAsset, value: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Monthly Income (if any)</FormLabel>
                <Input
                  type="number"
                  value={newAsset.monthlyIncome}
                  onChange={(e) => setNewAsset({...newAsset, monthlyIncome: e.target.value})}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddAsset}>
              Add Asset
            </Button>
            <Button onClick={onAssetClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Liability Modal */}
      <Modal isOpen={isLiabilityOpen} onClose={onLiabilityClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Liability</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Liability Name</FormLabel>
                <Input
                  value={newLiability.name}
                  onChange={(e) => setNewLiability({...newLiability, name: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={newLiability.category}
                  onChange={(e) => setNewLiability({...newLiability, category: e.target.value})}
                >
                  {Object.entries(LIABILITY_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  value={newLiability.amount}
                  onChange={(e) => setNewLiability({...newLiability, amount: e.target.value})}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Interest Rate (%)</FormLabel>
                <Input
                  type="number"
                  value={newLiability.interestRate}
                  onChange={(e) => setNewLiability({...newLiability, interestRate: e.target.value})}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddLiability}>
              Add Liability
            </Button>
            <Button onClick={onLiabilityClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default NetWorthDashboard; 