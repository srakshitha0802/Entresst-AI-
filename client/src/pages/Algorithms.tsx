
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Code, 
  BookOpen,
  Lightbulb,
  ChevronRight,
  Search,
  ArrowUpDown,
  GitBranch,
  Clock,
  Cpu,
  Network,
  Layers,
  Sparkles,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AlgorithmStep {
  array: number[];
  highlight: number[];
  swap: number[];
  compare: number[];
  sorted: number[];
  description: string;
  currentIndex?: number;
  left?: number;
  right?: number;
  mid?: number;
}

interface Algorithm {
  id: string;
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  code: {
    javascript: string;
    python: string;
    java: string;
  };
  useCases: string[];
  interviewTips: string[];
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

interface GraphStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visited: string[];
  current: string[];
  path: string[];
  distances: Record<string, number>;
  description: string;
}

const ALGORITHMS: Algorithm[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Repeatedly swaps adjacent elements if they are in wrong order',
    code: {
      javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
      java: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`
    },
    useCases: ['Learning sorting fundamentals', 'Small datasets', 'Nearly sorted arrays'],
    interviewTips: ['Know the O(n²) time complexity', 'Understand best/average/worst cases', 'Mention optimization with flag']
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Finds minimum element and places it at the beginning',
    code: {
      javascript: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
      python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
      java: `public static void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}`
    },
    useCases: ['Memory write optimization', 'Small datasets', 'Teaching purposes'],
    interviewTips: ['Always O(n²) regardless of input', 'Minimizes writes compared to bubble sort']
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Builds sorted array one element at a time',
    code: {
      javascript: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
      java: `public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
    },
    useCases: ['Nearly sorted data', 'Online sorting', 'Small datasets'],
    interviewTips: ['O(n) for nearly sorted arrays', 'Stable sort', 'Adaptive algorithm']
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Divides array and merges sorted halves',
    code: {
      javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  while (left.length && right.length) {
    result.push(left[0] <= right[0] ? left.shift() : right.shift());
  }
  return [...result, ...left, ...right];
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    while left and right:
        result.append(left.pop(0) if left[0] <= right[0] else right.pop(0))
    return result + left + right`,
      java: `public static int[] mergeSort(int[] arr) {
    if (arr.length <= 1) return arr;
    int mid = arr.length / 2;
    int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
    int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));
    return merge(left, right);
}`
    },
    useCases: ['External sorting', 'Stable sorting needed', 'Guaranteed O(n log n)'],
    interviewTips: ['Stable sort', 'O(n log n) guaranteed', 'Requires O(n) extra space']
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Partitions around pivot and recursively sorts',
    code: {
      javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
      python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
      java: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}`
    },
    useCases: ['General purpose sorting', 'In-memory sorting', 'Average case performance'],
    interviewTips: ['Average O(n log n), worst O(n²)', 'In-place but not stable', 'Choose pivot wisely']
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'Searching',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Sequentially checks each element',
    code: {
      javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
      python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
      java: `public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
    },
    useCases: ['Unsorted data', 'Small datasets', 'Single search'],
    interviewTips: ['Simple but O(n)', 'Best when data is unsorted', 'Can stop early if found']
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Searches sorted array by dividing in half',
    code: {
      javascript: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      java: `public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
    },
    useCases: ['Sorted data', 'Large datasets', 'Repeated searches'],
    interviewTips: ['Requires sorted array', 'O(log n) performance', 'Watch for integer overflow']
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'Graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Explores all neighbors before moving to next level',
    code: {
      javascript: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  visited.add(start);
  
  while (queue.length > 0) {
    const node = queue.shift();
    console.log(node);
    
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}`,
      python: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    
    while queue:
        node = queue.popleft()
        print(node)
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
      java: `public static void bfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    queue.add(start);
    visited.add(start);
    
    while (!queue.isEmpty()) {
        int node = queue.poll();
        System.out.println(node);
        
        for (int neighbor : graph.getOrDefault(node, Collections.emptyList())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.add(neighbor);
            }
        }
    }
}`
    },
    useCases: ['Shortest path in unweighted graph', 'Level-order traversal', 'Finding connected components'],
    interviewTips: ['Uses queue data structure', 'Finds shortest path', 'O(V + E) time complexity']
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'Graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Explores as far as possible before backtracking',
    code: {
      javascript: `function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  
  for (const neighbor of graph[start] || []) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}`,
      python: `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    print(start)
    
    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            dfs(graph, neighbor, visited)`,
      java: `public static void dfs(Map<Integer, List<Integer>> graph, int start, Set<Integer> visited) {
    visited.add(start);
    System.out.println(start);
    
    for (int neighbor : graph.getOrDefault(start, Collections.emptyList())) {
        if (!visited.contains(neighbor)) {
            dfs(graph, neighbor, visited);
        }
    }
}`
    },
    useCases: ['Path finding', 'Cycle detection', 'Topological sorting'],
    interviewTips: ['Can use recursion or stack', 'Good for exploring all paths', 'O(V + E) time complexity']
  }
];

// Algorithm implementations that generate steps
function generateBubbleSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const array = [...arr];
  const sortedIndices: number[] = [];
  
  steps.push({
    array: [...array],
    highlight: [],
    swap: [],
    compare: [],
    sorted: [],
    description: 'Starting array'
  });

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      steps.push({
        array: [...array],
        highlight: [],
        swap: [],
        compare: [j, j + 1],
        sorted: [...sortedIndices],
        description: `Comparing elements at index ${j} and ${j + 1}`
      });

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        steps.push({
          array: [...array],
          highlight: [],
          swap: [j, j + 1],
          compare: [],
          sorted: [...sortedIndices],
          description: `Swapping ${arr[j]} and ${arr[j + 1]}`
        });
      }
    }
    sortedIndices.push(array.length - 1 - i);
    steps.push({
      array: [...array],
      highlight: Array.from({ length: i + 1 }, (_, k) => array.length - 1 - k),
      swap: [],
      compare: [],
      sorted: [...sortedIndices],
      description: `Element ${array[array.length - 1 - i]} is now sorted`
    });
  }

  return steps;
}

function generateSelectionSortSteps(arr: number[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const array = [...arr];
  const sortedIndices: number[] = [];
  
  steps.push({
    array: [...array],
    highlight: [],
    swap: [],
    compare: [],
    sorted: [],
    description: 'Starting array'
  });

  for (let i = 0; i < array.length; i++) {
    let minIdx = i;
    
    for (let j = i + 1; j < array.length; j++) {
      steps.push({
        array: [...array],
        highlight: [minIdx],
        swap: [],
        compare: [minIdx, j],
        sorted: [...sortedIndices],
        description: `Comparing minimum ${array[minIdx]} with ${array[j]}`
      });
      
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      steps.push({
        array: [...array],
        highlight: [],
        swap: [i, minIdx],
        compare: [],
        sorted: [...sortedIndices],
        description: `Swapping ${array[minIdx]} to position ${i}`
      });
    }

    sortedIndices.push(i);
    steps.push({
      array: [...array],
      highlight: Array.from({ length: i + 1 }, (_, k) => k),
      swap: [],
      compare: [],
      sorted: [...sortedIndices],
      description: `Element ${array[i]} is now sorted`
    });
  }

  return steps;
}

function generateLinearSearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  
  steps.push({
    array: [...arr],
    highlight: [],
    swap: [],
    compare: [],
    sorted: [],
    description: `Searching for ${target} in the array`
  });

  for (let i = 0; i < arr.length; i++) {
    steps.push({
      array: [...arr],
      highlight: [i],
      swap: [],
      compare: [i],
      sorted: [],
      description: `Checking element at index ${i}: ${arr[i]}`
    });

    if (arr[i] === target) {
      steps.push({
        array: [...arr],
        highlight: [i],
        swap: [],
        compare: [],
        sorted: [],
        description: `Found ${target} at index ${i}!`
      });
      return steps;
    }
  }

  steps.push({
    array: [...arr],
    highlight: [],
    swap: [],
    compare: [],
    sorted: [],
    description: `${target} not found in array`
  });

  return steps;
}

function generateBinarySearchSteps(arr: number[], target: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const sorted = [...arr].sort((a, b) => a - b);
  
  steps.push({
    array: sorted,
    highlight: [],
    swap: [],
    compare: [],
    sorted: [],
    description: `Sorted array. Searching for ${target}`
  });

  let left = 0;
  let right = sorted.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      array: sorted,
      highlight: Array.from({ length: right - left + 1 }, (_, k) => left + k),
      swap: [],
      compare: [mid],
      sorted: [],
      description: `Checking middle element: ${sorted[mid]} (left: ${left}, right: ${right}, mid: ${mid})`
    });

    if (sorted[mid] === target) {
      steps.push({
        array: sorted,
        highlight: [mid],
        swap: [],
        compare: [],
        sorted: [],
        description: `Found ${target} at index ${mid}!`
      });
      return steps;
    } else if (sorted[mid] < target) {
      left = mid + 1;
      steps.push({
        array: sorted,
        highlight: Array.from({ length: right - left + 1 }, (_, k) => left + k),
        swap: [],
        compare: [],
        sorted: [],
        description: `${target} is greater, searching right half`
      });
    } else {
      right = mid - 1;
      steps.push({
        array: sorted,
        highlight: Array.from({ length: right - left + 1 }, (_, k) => left + k),
        swap: [],
        compare: [],
        sorted: [],
        description: `${target} is smaller, searching left half`
      });
    }
  }

  steps.push({
    array: sorted,
    highlight: [],
    swap: [],
    compare: [],
    sorted: [],
    description: `${target} not found in array`
  });

  return steps;
}

export default function Algorithms() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('bubble-sort');
  const [arraySize, setArraySize] = useState<number>(10);
  const [speed, setSpeed] = useState<number>(500);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [array, setArray] = useState<number[]>([]);
  const [searchTarget, setSearchTarget] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('visualizer');

  // Generate random array
  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize }, () => 
      Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
    setCurrentStep(0);
    setIsPlaying(false);
    
    // Generate steps based on algorithm
    const algorithm = ALGORITHMS.find(a => a.id === selectedAlgorithm);
    if (algorithm?.category === 'Sorting') {
      if (selectedAlgorithm === 'bubble-sort') {
        setSteps(generateBubbleSortSteps(newArray));
      } else if (selectedAlgorithm === 'selection-sort') {
        setSteps(generateSelectionSortSteps(newArray));
      }
    } else if (algorithm?.category === 'Searching') {
      if (selectedAlgorithm === 'linear-search') {
        setSteps(generateLinearSearchSteps(newArray, searchTarget || newArray[Math.floor(newArray.length / 2)]));
      } else if (selectedAlgorithm === 'binary-search') {
        setSteps(generateBinarySearchSteps(newArray, searchTarget || newArray[Math.floor(newArray.length / 2)]));
      }
    }
  }, [arraySize, selectedAlgorithm, searchTarget]);

  // Initialize on mount and algorithm change
  useEffect(() => {
    generateArray();
  }, [selectedAlgorithm, arraySize]);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && steps.length > 0) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  const currentArray = steps.length > 0 && currentStep < steps.length 
    ? steps[currentStep].array 
    : array;

  const currentDescription = steps.length > 0 && currentStep < steps.length
    ? steps[currentStep].description
    : '';

  const currentHighlight = steps.length > 0 && currentStep < steps.length
    ? steps[currentStep].highlight
    : [];

  const currentCompare = steps.length > 0 && currentStep < steps.length
    ? steps[currentStep].compare
    : [];

  const currentSwap = steps.length > 0 && currentStep < steps.length
    ? steps[currentStep].swap
    : [];

  const selectedAlgo = ALGORITHMS.find(a => a.id === selectedAlgorithm);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>
          <p className="text-muted-foreground">Learn algorithms through interactive visualization</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {selectedAlgo?.category}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
          <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
          <TabsTrigger value="learn">Learn</TabsTrigger>
        </TabsList>

        <TabsContent value="visualizer" className="space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Algorithm</label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALGORITHMS.map(algo => (
                        <SelectItem key={algo.id} value={algo.id}>
                          {algo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[150px]">
                  <label className="text-sm font-medium mb-2 block">Array Size</label>
                  <Select value={arraySize.toString()} onValueChange={(v) => setArraySize(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Elements</SelectItem>
                      <SelectItem value="10">10 Elements</SelectItem>
                      <SelectItem value="15">15 Elements</SelectItem>
                      <SelectItem value="20">20 Elements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[150px]">
                  <label className="text-sm font-medium mb-2 block">Speed</label>
                  <Select value={speed.toString()} onValueChange={(v) => setSpeed(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">Slow</SelectItem>
                      <SelectItem value="500">Normal</SelectItem>
                      <SelectItem value="200">Fast</SelectItem>
                      <SelectItem value="50">Very Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(selectedAlgorithm === 'linear-search' || selectedAlgorithm === 'binary-search') && (
                  <div className="w-[150px]">
                    <label className="text-sm font-medium mb-2 block">Target</label>
                    <input
                      type="number"
                      value={searchTarget}
                      onChange={(e) => setSearchTarget(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-6">
                  <Button onClick={generateArray} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Info */}
          {selectedAlgo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  {selectedAlgo.name}
                </CardTitle>
                <CardDescription>{selectedAlgo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-xs text-muted-foreground mb-1">Time Complexity</p>
                    <p className="font-mono font-bold text-primary">{selectedAlgo.timeComplexity}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <p className="text-xs text-muted-foreground mb-1">Space Complexity</p>
                    <p className="font-mono font-bold text-secondary">{selectedAlgo.spaceComplexity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visualization */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </p>
                <p className="font-medium mt-1">{currentDescription}</p>
              </div>

              <div className="flex items-end justify-center gap-1 h-[300px] px-4">
                {currentArray.map((value, idx) => (
                  <motion.div
                    key={idx}
                    className="relative flex flex-col items-center rounded-t-md transition-colors"
                    animate={{
                      backgroundColor: currentHighlight.includes(idx) 
                        ? 'hsl(var(--primary))' 
                        : currentCompare.includes(idx)
                          ? 'hsl(var(--secondary))'
                          : currentSwap.includes(idx)
                            ? 'hsl(var(--destructive))'
                            : 'hsl(var(--muted))'
                    }}
                    style={{
                      height: `${Math.max((value / 100) * 250, 20)}px`,
                      width: `${Math.max(300 / arraySize - 4, 10)}px`,
                      minWidth: '10px'
                    }}
                  >
                    <span className="absolute -top-6 text-xs font-mono">
                      {value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Step controls */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(0)}
                  disabled={currentStep === 0}
                >
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep >= steps.length - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(steps.length - 1)}
                  disabled={currentStep >= steps.length - 1}
                >
                  End
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="algorithms" className="space-y-4">
          <div className="grid gap-4">
            {ALGORITHMS.map(algo => (
              <Card 
                key={algo.id} 
                className={`cursor-pointer transition-all ${selectedAlgorithm === algo.id ? 'border-primary' : ''}`}
                onClick={() => setSelectedAlgorithm(algo.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {algo.category === 'Sorting' && <ArrowUpDown className="w-4 h-4" />}
                      {algo.category === 'Searching' && <Search className="w-4 h-4" />}
                      {algo.category === 'Graph' && <GitBranch className="w-4 h-4" />}
                      {algo.name}
                    </CardTitle>
                    <Badge variant="outline">{algo.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{algo.description}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="font-mono text-primary">Time: {algo.timeComplexity}</span>
                    <span className="font-mono text-secondary">Space: {algo.spaceComplexity}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="learn" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Algorithm Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-400/10">
                  <p className="font-medium text-sm">Bubble Sort</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best for nearly sorted arrays. Simple to understand but inefficient for large datasets.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-400/10">
                  <p className="font-medium text-sm">Binary Search</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requires sorted array. Reduces search space by half each iteration.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-400/10">
                  <p className="font-medium text-sm">Quick Sort</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average case O(n log n). In-place but not stable. Good cache performance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Interview Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-400/10">
                  <p className="font-medium text-sm">When to use Merge Sort?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When you need stable sort, O(n log n) guaranteed, and external sorting.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-400/10">
                  <p className="font-medium text-sm">Binary vs Linear Search?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Binary search for sorted data O(log n), Linear for unsorted O(n).
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-400/10">
                  <p className="font-medium text-sm">BFS vs DFS?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    BFS for shortest path, DFS for path finding and cycle detection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

