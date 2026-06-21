// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface Question {
  type: 'behavioral' | 'system-design' | 'coding' | 'wrap-up';
  question: string;
  aiCriteria: string;
}

export interface CodePresets {
  js: string;
  py: string;
  cpp: string;
}

export interface TestCase {
  input_args: string[];
  expected_output: string;
}

export interface ProfileTemplate {
  char: string;
  title: string;
  level: string;
  skills: string[];
  syllabus: string[];
  questions: Question[];
  codePresets: CodePresets;
  testCases: TestCase[];
}

export interface UserResponse {
  round: string;
  question: string;
  response: string;
  criteria: string;
}

export interface Telemetry {
  cacheHits: number;
  ragQueries: number;
  summarizeCompress: number;
  costSaved: number;
}

export interface Scores {
  technical: number;
  communication: number;
  problemSolving: number;
  cultureFit: number;
  codeQuality: number;
  systemDesign: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  type: 'bot' | 'candidate' | 'system';
}

export interface TelemetryLog {
  id: string;
  module: string;
  message: string;
  time: string;
}

// ==========================================
// STATIC PRESET DATA
// ==========================================
export const profileTemplates: Record<string, ProfileTemplate> = {
  frontend: {
    char: 'JS',
    title: 'Senior Frontend UI Architect',
    level: 'Senior Staff Specialist (L6)',
    skills: ['React/Next.js Core', 'CSS Reflow Engines', 'AST Compilers', 'V8 V-List Opts', 'Zustand/Redux State', 'TypeScript Typings', 'Web Performance audit'],
    syllabus: [
      'Design conflict strategies (CSS-in-JS vs Vanilla HSL tokens)',
      'Browser critical rendering path optimizations & Layout Thrashing prevention',
      'Algorithmic unique intersect sets filtering (Linear time execution)',
      'Dynamic code-splitting bundle trade-offs with RAG vector cache engines'
    ],
    questions: [
      {
        type: 'behavioral',
        question: "Describe a scenario where you faced a critical design disagreement with a Lead Architect regarding structural layout paradigms (e.g. standard Tailwind vs CSS HSL Custom Variables). How did you present your metrics, resolve the deadlock, and what was the outcome?",
        aiCriteria: "Assesses architectural collaboration, metrics-driven decision making, and leadership maturity in design system governance."
      },
      {
        type: 'system-design',
        question: "You are building a high-frequency trading dashboard displaying hundreds of real-time nodes. Users report heavy rendering lag, high frame drops, and periodic layout thrashing. How do you audit, pinpoint, and structure your React/V8 component reflow thread optimizations?",
        aiCriteria: "Assesses browser event loop knowledge, requestAnimationFrame strategies, DOM virtualization, and performance profiling."
      },
      {
        type: 'coding',
        question: "You need to create an optimized helper `resolveIntersect(arr1, arr2)` which finds the unique intersection between two numerical arrays. Complete the code inside the live IDE and execute the verification suite. Explain your time and space complexity bounds.",
        aiCriteria: "Assesses algorithm analysis, linear time-complexity optimizations, and code robustness."
      },
      {
        type: 'wrap-up',
        question: "Excellent synthesis. As a closing architectural question, what are the primary engineering trade-offs of deploying dynamic bundle code-splitting when integrated with standard edge-side prompt caching and RAG context layouts?",
        aiCriteria: "Assesses understanding of resource loader mechanisms, bundle sizes, and dynamic caching overlaps."
      }
    ],
    codePresets: {
      js: `// Implement in linear O(N + M) time complexity
function resolveIntersect(arr1, arr2) {
    const registry = new Set(arr1);
    const result = [];
    
    for (const value of arr2) {
        if (registry.has(value)) {
            result.push(value);
            registry.delete(value); // Keep result unique
        }
    }
    
    return result;
}`,
      py: `# Implement in linear O(N + M) time complexity
def resolve_intersect(arr1, arr2):
    registry = set(arr1)
    result = []
    
    for value in arr2:
        if value in registry:
            result.append(value)
            registry.remove(value) # Keep result unique
            
    return result`,
      cpp: `// Implement in linear O(N + M) time complexity
#include <vector>
#include <unordered_set>

std::vector<int> resolveIntersect(const std::vector<int>& arr1, const std::vector<int>& arr2) {
    std::unordered_set<int> registry(arr1.begin(), arr1.end());
    std::vector<int> result;
    
    for (int value : arr2) {
        if (registry.count(value)) {
            result.push_back(value);
            registry.erase(value); // Keep result unique
        }
    }
    
    return result;
}`
    },
    testCases: [
      { input_args: ["[1, 2, 2, 1]", "[2, 2]"], expected_output: "[2]" },
      { input_args: ["[4, 9, 5]", "[9, 4, 9, 8, 4]"], expected_output: "[4, 9]" }
    ]
  },
  backend: {
    char: 'PY',
    title: 'Distributed Systems Backend Engineer',
    level: 'Lead Staff Architect (L6)',
    skills: ['Python/Go-Routine', 'Distributed Locking', 'Kafka PubSub', 'PostgreSQL Clusters', 'System Partitioning', 'Consensus (Raft/Paxos)', 'gRPC API Gateway'],
    syllabus: [
      'Deprecating high-traffic core APIs with zero transactional downtime',
      'Highly consistent distributed transaction caches & caching topology models',
      'Linear-time data intersection set calculations in memory-constrained devices',
      'Consensus latency reduction with prompt caching & embedding storage structures'
    ],
    questions: [
      {
        type: 'behavioral',
        question: "How do you coordinate with multiple cross-discipline engineering squads to deprecate a critical microservice API that handles thousands of requests per second? How do you guarantee absolute zero outage transitions?",
        aiCriteria: "Assesses cross-team leadership, API versioning strategies, fail-safe migration design, and risk mitigation."
      },
      {
        type: 'system-design',
        question: "Your transactional cluster is facing heavy locking issues under peak loads. You are asked to implement a distributed cache layer with strict data-consistency guarantees. Walk me through your cache topology, invalidation tactics, and race-condition handling.",
        aiCriteria: "Assesses caching patterns (write-through, cache-aside), cache stampede protections, transaction isolation, and cluster replication."
      },
      {
        type: 'coding',
        question: "Complete the optimized helper `resolveIntersect(arr1, arr2)` which calculates the unique overlap of two large unsorted numeric datasets. Ensure space efficiency is optimized for parallel threads.",
        aiCriteria: "Assesses parallelizable data-structures, hashing lookups, and minimal memory foot-print."
      },
      {
        type: 'wrap-up',
        question: "Let's conclude: How would you configure database replication models to minimize read lag without introducing massive node failover inconsistencies?",
        aiCriteria: "Assesses replication patterns, CAP theorem applications, and network partition resiliency."
      }
    ],
    codePresets: {
      js: `// Implement in linear O(N + M) time complexity
function resolveIntersect(arr1, arr2) {
    const registry = new Set(arr1);
    const result = [];
    for (const num of arr2) {
        if (registry.has(num)) {
            result.push(num);
            registry.delete(num);
        }
    }
    return result;
}`,
      py: `# Implement in linear O(N + M) time complexity
def resolve_intersect(arr1, arr2):
    registry = set(arr1)
    result = []
    for num in arr2:
        if num in registry:
            result.append(num)
            registry.remove(num)
    return result`,
      cpp: `// Implement in linear O(N + M) time complexity
#include <vector>
#include <unordered_set>

std::vector<int> resolveIntersect(const std::vector<int>& arr1, const std::vector<int>& arr2) {
    std::unordered_set<int> registry(arr1.begin(), arr1.end());
    std::vector<int> result;
    for (int num : arr2) {
        if (registry.count(num)) {
            result.push_back(num);
            registry.erase(num);
        }
    }
    return result;
}`
    },
    testCases: [
      { input_args: ["[1, 2, 2, 1]", "[2, 2]"], expected_output: "[2]" },
      { input_args: ["[4, 9, 5]", "[9, 4, 9, 8, 4]"], expected_output: "[4, 9]" }
    ]
  },
  fullstack: {
    char: 'TS',
    title: 'Full-Stack Product Developer',
    level: 'Mid-Senior Specialist (L5)',
    skills: ['Node.js/Express', 'PostgreSQL core', 'Zustand state', 'React Hook logic', 'GraphQL Resolvers', 'Redis Invalidation', 'Docker containerized'],
    syllabus: [
      'Tight deadlines vs. technical debt mitigation during product ship phases',
      'Notification dispatch architecture design with failure retry patterns',
      'Algorithm intersect arrays utility for optimized browser-to-server arrays data exchange',
      'Optimizing slow GraphQL query resolvers using batch loaders and prompt caches'
    ],
    questions: [
      {
        type: 'behavioral',
        question: "Tell me about a time you had to deliver a major product feature under tight deadlines but had to knowingly introduce technical debt. How did you structure the code, document trade-offs, and pay down that debt later?",
        aiCriteria: "Assesses pragmatism, code documentation hygiene, product sense, and engineering craftsmanship."
      },
      {
        type: 'system-design',
        question: "We need a scalable notification engine that dispatches SMS and email events. How do you design it to avoid double-sends under high concurrency, manage third-party API outages, and handle automated client retries?",
        aiCriteria: "Assesses queue processors, idempotency keys, dead-letter queues, exponential backoff, and circuit breaker patterns."
      },
      {
        type: 'coding',
        question: "Write an optimal utility `resolveIntersect(arr1, arr2)` to find the intersection of two arrays representing active client session IDs. Keep code clean and production-grade.",
        aiCriteria: "Assesses code clean-liness, naming conventions, and correctness under various test edge-cases."
      },
      {
        type: 'wrap-up',
        question: "Finally, how do you diagnose and resolve the N+1 database querying issue commonly experienced in deep nested GraphQL query loaders?",
        aiCriteria: "Assesses batch loaders, data-loaders libraries, SQL join patterns, and query performance audits."
      }
    ],
    codePresets: {
      js: `// Implement in linear O(N + M) time complexity
function resolveIntersect(arr1, arr2) {
    const lookup = new Set(arr1);
    const intersect = [];
    for (const val of arr2) {
        if (lookup.has(val)) {
            intersect.push(val);
            lookup.delete(val);
        }
    }
    return intersect;
}`,
      py: `# Implement in linear O(N + M) time complexity
def resolve_intersect(arr1, arr2):
    lookup = set(arr1)
    intersect = []
    for val in arr2:
        if val in lookup:
            intersect.append(val)
            lookup.remove(val)
    return intersect`,
      cpp: `// Implement in linear O(N + M) time complexity
#include <vector>
#include <unordered_set>

std::vector<int> resolveIntersect(const std::vector<int>& arr1, const std::vector<int>& arr2) {
    std::unordered_set<int> lookup(arr1.begin(), arr1.end());
    std::vector<int> intersect;
    for (int val : arr2) {
      if (lookup.count(val)) {
          intersect.push_back(val);
          lookup.erase(val);
      }
    }
    return intersect;
}`
    },
    testCases: [
      { input_args: ["[1, 2, 2, 1]", "[2, 2]"], expected_output: "[2]" },
      { input_args: ["[4, 9, 5]", "[9, 4, 9, 8, 4]"], expected_output: "[4, 9]" }
    ]
  }
};

export const simulationHistory = [
  { role: 'Backend Data Architect', date: '2 days ago', grade: '86%', scoreClass: 'A-' },
  { role: 'Senior React Engineer', date: '1 week ago', grade: '92%', scoreClass: 'A' },
  { role: 'Infrastructure SRE', date: '2 weeks ago', grade: '74%', scoreClass: 'B' },
  { role: 'Full-Stack Developer', date: '3 weeks ago', grade: '80%', scoreClass: 'B+' }
];

export const simulatedSpeechPhrases = [
  "Regarding this architectural paradigm, I prefer configuring linear sets using custom variables rather than inline tools because it decreases paint loops...",
  "To handle layout thrashing at scale, I'd implement virtual DOM scrolling and decouple DOM updates using requestAnimationFrame cycles...",
  "For database caching topology, I would suggest a write-through model with Redis, utilizing strict cluster synchronization to avoid stale values...",
  "To solve N+1 problems in our GraphQL architecture, I typically deploy DataLoader patterns to batch and cache query requests efficiently..."
];
