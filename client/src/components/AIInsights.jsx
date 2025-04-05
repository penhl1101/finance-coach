import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Progress,
  Button,
  Icon,
  Flex,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { FiTrendingUp, FiAlertCircle, FiTarget, FiAward } from 'react-icons/fi';

function AIInsights({ insights }) {
  const toast = useToast();

  const acceptChallenge = (challenge) => {
    // TODO: Implement challenge acceptance logic
    toast({
      title: "Challenge Accepted!",
      description: `You've started the ${challenge.name} challenge`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>Key Financial Insights</Heading>
          <VStack align="stretch" spacing={3}>
            {insights?.keyInsights?.map((insight, index) => (
              <Flex key={index} align="center" gap={2}>
                <Icon as={FiTrendingUp} color="blue.500" />
                <Text>{insight}</Text>
              </Flex>
            ))}
          </VStack>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {insights?.recommendations?.map((rec, index) => (
          <Card key={index}>
            <CardBody>
              <Badge colorScheme={rec.priority === 'high' ? 'red' : 'blue'} mb={2}>
                {rec.priority}
              </Badge>
              <Heading size="sm" mb={2}>{rec.title}</Heading>
              <Text>{rec.description}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>Investment Opportunities</Heading>
          <VStack align="stretch" spacing={4}>
            {insights?.investmentIdeas?.map((idea, index) => (
              <Box key={index} p={4} bg="gray.50" borderRadius="md">
                <Heading size="sm" mb={2}>{idea.type}</Heading>
                <Text mb={2}>{idea.description}</Text>
                <Tooltip label="Potential Return">
                  <Progress
                    value={parseFloat(idea.potentialReturn)}
                    colorScheme="green"
                    size="sm"
                  />
                </Tooltip>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Heading size="md" mb={4}>Financial Challenges</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {insights?.challenges?.map((challenge, index) => (
              <Box key={index} p={4} borderWidth={1} borderRadius="md">
                <Flex justify="space-between" align="center" mb={2}>
                  <Heading size="sm">{challenge.name}</Heading>
                  <Icon as={FiAward} color="yellow.500" />
                </Flex>
                <Text mb={2}>Duration: {challenge.duration}</Text>
                <Text mb={4}>Target: {challenge.target}</Text>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => acceptChallenge(challenge)}
                >
                  Accept Challenge
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </VStack>
  );
}

export default AIInsights; 