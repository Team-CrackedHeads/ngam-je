# A2A (Agent-to-Agent) Protocol: Comprehensive Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Technical Architecture](#technical-architecture)
4. [Communication Model](#communication-model)
5. [Ecosystem & Partners](#ecosystem--partners)
6. [Use Cases](#use-cases)
7. [Comparison with Other Protocols](#comparison-with-other-protocols)
8. [Getting Started](#getting-started)
9. [Resources](#resources)

---

## Introduction

The **Agent2Agent Protocol (A2A)** is an open standard announced by Google on **April 9, 2025** that enables AI agents from different vendors and frameworks to collaborate securely. With support from over 50 technology partners, A2A aims to solve the fragmentation problem in multi-agent AI systems.

### The Problem A2A Solves

Before A2A, agent interoperability was inconsistent and fragmented:
- Different frameworks used proprietary communication protocols
- Agents couldn't discover capabilities of other agents dynamically
- Security models were ad-hoc and inconsistent
- Cross-vendor collaboration was difficult or impossible

### The A2A Solution

A2A provides a **universal communication standard** that:
- Works across all frameworks and vendors
- Enables secure, enterprise-grade communication
- Supports long-running, stateful workflows
- Handles multiple modalities (text, audio, video)
- Requires no central orchestrator

---

## Design Principles

A2A is built on five fundamental principles:

### 1. Agentic Capabilities

**Principle**: Agents collaborate naturally without requiring shared memory, tools, or context

**Why it matters**: Each agent maintains its own state and capabilities, preventing tight coupling

**Example**:
```
Agent A (Hiring Manager)
  ├─ Own memory: Job requirements, team info
  ├─ Own tools: HR database, scheduling system
  └─ Communicates with Agent B via A2A messages

Agent B (Recruiter)
  ├─ Own memory: Candidate pool, interview notes
  ├─ Own tools: LinkedIn API, resume parser
  └─ Responds to Agent A via A2A protocol
```

### 2. Built on Existing Standards

**Principle**: Uses HTTP, SSE (Server-Sent Events), and JSON-RPC for easier integration

**Benefits**:
- No new infrastructure needed
- Works with existing IT security policies
- Familiar to developers
- Battle-tested protocols

**Technical Stack**:
- **HTTP/HTTPS**: Transport layer (REST-like)
- **Server-Sent Events**: Real-time streaming updates
- **JSON-RPC 2.0**: Remote procedure calls
- **JSON**: Data serialization

### 3. Security-First

**Principle**: Enterprise-grade authentication and authorization matching OpenAPI standards

**Security Features**:
- **Authentication**: OAuth 2.0, API keys, JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: TLS 1.3 for all communications
- **Audit logging**: Complete request/response tracking
- **Rate limiting**: Prevent abuse and DoS attacks

**Example Auth Flow**:
```
1. Client Agent requests access token
2. Auth server validates credentials
3. Token issued with specific permissions
4. Token included in all A2A requests
5. Remote Agent validates token before processing
```

### 4. Long-Running Tasks

**Principle**: Supports scenarios from quick tasks to multi-day research with real-time feedback

**Task Lifecycle**:
```
Created → Queued → Running → [Paused] → Completed/Failed/Cancelled
```

**Features**:
- **Asynchronous execution**: Client doesn't block
- **Progress updates**: Real-time status via SSE
- **Checkpointing**: Resume after failures
- **Cancellation**: Stop tasks in progress
- **Result persistence**: Access results after completion

**Example Multi-Day Task**:
```
Day 1: Agent A requests comprehensive market research
       Agent B acknowledges and begins data collection

Day 2: Agent B streams preliminary findings
       Agent A reviews and requests additional focus areas

Day 3: Agent B completes final report
       Agent A receives and processes results
```

### 5. Modality Agnostic

**Principle**: Handles text, audio, and video streaming

**Supported Modalities**:
- **Text**: Standard JSON messages
- **Audio**: Streaming audio transcription and synthesis
- **Video**: Video stream processing and analysis
- **Multimodal**: Combined modalities (e.g., video + transcript)

**Content Negotiation**:
```json
{
  "accept": ["text/plain", "audio/mp3", "video/mp4"],
  "prefer": "text/plain"
}
```

---

## Technical Architecture

### Core Components

#### 1. Agent Cards (Capability Discovery)

**Purpose**: Agents advertise their abilities via JSON "Agent Cards"

**Agent Card Structure**:
```json
{
  "name": "customer_service_agent",
  "version": "1.2.0",
  "description": "Handles customer inquiries, returns, and support tickets",
  "capabilities": [
    {
      "name": "search_orders",
      "description": "Search customer orders by ID or criteria",
      "input_schema": {
        "type": "object",
        "properties": {
          "order_id": {"type": "string"},
          "customer_email": {"type": "string"}
        }
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "orders": {"type": "array"}
        }
      }
    },
    {
      "name": "process_return",
      "description": "Initiate return for eligible orders",
      "input_schema": {...},
      "output_schema": {...}
    }
  ],
  "modalities": ["text", "audio"],
  "authentication": "oauth2",
  "rate_limits": {
    "requests_per_minute": 60
  }
}
```

**Discovery Process**:
1. Client agent requests Agent Card from remote agent
2. Remote agent returns capabilities
3. Client agent validates and caches
4. Client agent invokes appropriate capabilities

#### 2. Task Objects (Structured Workflows)

**Purpose**: Define tasks with clear lifecycles and state management

**Task Object Structure**:
```json
{
  "task_id": "task_abc123",
  "status": "running",
  "created_at": "2025-11-06T10:00:00Z",
  "updated_at": "2025-11-06T10:05:00Z",
  "capability": "research_topic",
  "input": {
    "topic": "AI agent frameworks 2025",
    "depth": "comprehensive"
  },
  "progress": 0.35,
  "messages": [
    {"timestamp": "2025-11-06T10:01:00Z", "text": "Starting research..."},
    {"timestamp": "2025-11-06T10:03:00Z", "text": "Found 127 relevant sources"},
    {"timestamp": "2025-11-06T10:05:00Z", "text": "35% complete - analyzing sources"}
  ],
  "estimated_completion": "2025-11-06T10:15:00Z"
}
```

**Task Lifecycle**:
- **Created**: Task submitted but not yet started
- **Queued**: Waiting for resources
- **Running**: Active execution
- **Paused**: Temporarily suspended (resumable)
- **Completed**: Successfully finished
- **Failed**: Error occurred
- **Cancelled**: Stopped by request

#### 3. Collaboration (Inter-Agent Messaging)

**Purpose**: Enable agents to exchange context and status updates

**Message Types**:

1. **Request Message**:
```json
{
  "jsonrpc": "2.0",
  "method": "execute_capability",
  "params": {
    "capability": "search_orders",
    "input": {"order_id": "12345"}
  },
  "id": "req_001"
}
```

2. **Response Message**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "orders": [
      {"id": "12345", "status": "shipped", "total": 49.99}
    ]
  },
  "id": "req_001"
}
```

3. **Progress Update (SSE)**:
```
event: progress
data: {"task_id": "task_abc123", "progress": 0.45, "message": "Processing data..."}

event: progress
data: {"task_id": "task_abc123", "progress": 0.67, "message": "Generating report..."}
```

4. **Error Message**:
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {"field": "order_id", "issue": "required"}
  },
  "id": "req_001"
}
```

#### 4. User Experience Negotiation

**Purpose**: Support various UI elements (iframes, video, web forms) for rich interactions

**Content Type Negotiation**:
```json
{
  "accept": [
    "application/json",
    "text/html",
    "application/x-iframe",
    "video/mp4"
  ],
  "ui_preferences": {
    "embed_type": "iframe",
    "width": 800,
    "height": 600
  }
}
```

**Response with UI Component**:
```json
{
  "content_type": "application/x-iframe",
  "data": {
    "url": "https://agent.example.com/ui/order/12345",
    "width": 800,
    "height": 600,
    "sandbox": ["allow-forms", "allow-scripts"]
  }
}
```

---

## Communication Model

### Client-Server Architecture

```
┌─────────────────────┐           ┌─────────────────────┐
│   Client Agent      │           │   Remote Agent      │
│                     │           │                     │
│  ┌──────────────┐   │           │  ┌──────────────┐   │
│  │ Task         │   │   A2A     │  │ Capability   │   │
│  │ Formulator   │───┼──────────►│  │ Executor     │   │
│  └──────────────┘   │ Protocol  │  └──────────────┘   │
│                     │           │                     │
│  ┌──────────────┐   │           │  ┌──────────────┐   │
│  │ Result       │   │◄──────────┼──│ Result       │   │
│  │ Processor    │   │           │  │ Generator    │   │
│  └──────────────┘   │           │  └──────────────┘   │
│                     │           │                     │
└─────────────────────┘           └─────────────────────┘
         ▲                                   │
         │        Progress Updates (SSE)     │
         └───────────────────────────────────┘
```

### Communication Patterns

#### 1. Request-Response (Synchronous)

**Use case**: Quick queries, simple operations

```python
# Client Agent
response = await remote_agent.execute_capability(
    capability="search_orders",
    input={"order_id": "12345"}
)
# Blocks until response received
```

#### 2. Request-Streaming (Asynchronous)

**Use case**: Long-running tasks with progress updates

```python
# Client Agent
task = await remote_agent.start_task(
    capability="comprehensive_research",
    input={"topic": "AI frameworks"}
)

# Subscribe to progress updates
async for update in task.progress_stream():
    print(f"Progress: {update.progress * 100}%")
    print(f"Status: {update.message}")

# Get final result when complete
result = await task.wait_for_completion()
```

#### 3. Bidirectional Streaming

**Use case**: Real-time collaboration, multi-turn conversations

```python
# Client Agent initiates conversation
async with remote_agent.conversation() as conv:
    # Send initial message
    await conv.send("I need help with a return")

    # Receive and process responses
    async for message in conv.messages():
        print(f"Agent: {message.text}")

        # Send follow-up
        user_response = input("You: ")
        await conv.send(user_response)
```

---

## Ecosystem & Partners

### Platform Partners (50+)

**Enterprise Software**:
- Atlassian (Jira, Confluence agents)
- Box (Document management agents)
- MongoDB (Database agents)
- Salesforce (CRM agents)
- SAP (ERP agents)
- ServiceNow (IT service agents)
- Workday (HR agents)

**AI/ML Platforms**:
- Cohere (Language model agents)
- LangChain (Agent orchestration)

**Payments & Financial**:
- Intuit (Finance agents)
- PayPal (Payment agents)

**Communication & Collaboration**:
- UKG (Workforce management agents)

### Service Provider Partners

**Consulting & Implementation**:
- Accenture
- BCG (Boston Consulting Group)
- Capgemini
- Cognizant
- Deloitte
- HCLTech
- Infosys
- KPMG
- McKinsey
- PwC (PricewaterhouseCoopers)
- TCS (Tata Consultancy Services)
- Wipro

**Value**: Help enterprises implement A2A-based multi-agent systems

---

## Use Cases

### 1. Recruitment Workflow (from A2A announcement)

**Scenario**: Hiring manager needs to fill a position

**Agents Involved**:
- Hiring Manager Agent (client)
- Sourcing Agent (finds candidates)
- Scheduling Agent (coordinates interviews)
- Background Check Agent (verification)

**A2A Workflow**:
```
1. Hiring Manager Agent formulates task:
   "Find 5 qualified software engineers with 3+ years Python experience"

2. Sourcing Agent (via A2A):
   - Searches LinkedIn, GitHub, job boards
   - Returns candidate profiles with match scores

3. Hiring Manager Agent reviews and requests interviews

4. Scheduling Agent (via A2A):
   - Checks interviewer calendars
   - Sends invite to candidates
   - Confirms interview times

5. After interviews, Background Check Agent (via A2A):
   - Runs verification for top candidates
   - Returns results to Hiring Manager Agent

6. Hiring Manager Agent makes hiring decision
```

**Benefits**:
- No single vendor lock-in (each agent from different provider)
- Secure data exchange
- Async execution (doesn't block)
- Full audit trail

### 2. Customer Support Escalation

**Agents**:
- Tier 1 Support Agent (handles common queries)
- Technical Specialist Agent (deep technical issues)
- Billing Agent (payment/refund issues)
- Manager Agent (complex escalations)

**A2A Flow**:
```
Customer: "I was charged twice and the product doesn't work"

Tier 1 Agent:
  ├─ Recognizes two issues: billing + technical
  ├─ Via A2A, delegates to Billing Agent
  └─ Via A2A, delegates to Technical Agent

Billing Agent:
  ├─ Finds duplicate charge
  ├─ Issues refund
  └─ Reports back to Tier 1 via A2A

Technical Agent:
  ├─ Requests diagnostic data
  ├─ Identifies software bug
  ├─ Escalates to Manager Agent via A2A
  └─ Reports status to Tier 1 via A2A

Manager Agent:
  ├─ Approves expedited replacement
  └─ Notifies Tier 1 via A2A

Tier 1 Agent:
  └─ Synthesizes updates for customer
```

### 3. Research & Analysis

**Agents**:
- Research Coordinator (orchestrates)
- Web Scraper Agent (collects data)
- Academic Paper Agent (searches journals)
- Data Analysis Agent (processes findings)
- Report Generator Agent (creates output)

**A2A Multi-Day Workflow**:
```
Day 1, 9 AM:  Coordinator initiates research task via A2A
Day 1, 10 AM: Web Scraper finds 500 sources, streams progress
Day 1, 2 PM:  Academic Agent finds 50 papers, streams findings
Day 1, 5 PM:  Coordinator reviews, requests deeper analysis

Day 2, 9 AM:  Data Analysis Agent processes all sources
Day 2, 3 PM:  Sends preliminary insights to Coordinator
Day 2, 4 PM:  Coordinator requests specific angles

Day 3, 10 AM: Report Generator creates final report
Day 3, 11 AM: Coordinator receives, validates, delivers to user
```

---

## Comparison with Other Protocols

### A2A vs MCP (Model Context Protocol)

| Feature | A2A | MCP |
|---------|-----|-----|
| **Purpose** | Agent-to-agent communication | Tool invocation & data exchange |
| **Architecture** | REST + SSE | JSON-RPC client-server |
| **Scope** | Cross-agent collaboration | LLM-tool integration |
| **State Management** | Long-running stateful tasks | Stateless tool calls |
| **Use Case** | Multi-agent systems | Single-agent tool use |

**Complementary**: Use MCP for agent-tool interaction, A2A for agent-agent interaction

### A2A vs ACP (Agent Communication Protocol)

| Feature | A2A | ACP |
|---------|-----|-----|
| **Focus** | Standard agent communication | REST-native messaging |
| **Multimodal** | Yes (text, audio, video) | Yes (multi-part messages) |
| **Streaming** | SSE | Asynchronous streaming |
| **Adoption** | 50+ partners (Google-backed) | Smaller ecosystem |

### A2A vs ANP (Agent Network Protocol)

| Feature | A2A | ANP |
|---------|-----|-----|
| **Discovery** | Agent Cards (JSON) | DIDs + JSON-LD graphs |
| **Architecture** | Client-server | Decentralized P2P |
| **Use Case** | Enterprise multi-agent | Open-internet agent marketplace |
| **Identity** | OAuth/API keys | Decentralized identifiers (DIDs) |

**Key Difference**: A2A is centralized/enterprise-focused, ANP is decentralized/open-internet

---

## Getting Started

### Prerequisites

- Python 3.9+ or Node.js 16+
- Understanding of REST APIs
- Agent framework (LangChain, Google ADK, etc.)

### Installation

**Python**:
```bash
pip install a2a-protocol
```

**Node.js**:
```bash
npm install @google/a2a-protocol
```

### Creating an A2A Server Agent

```python
from a2a import Agent, Capability

# Define capabilities
@Capability(
    name="search_database",
    description="Search customer database",
    input_schema={
        "type": "object",
        "properties": {
            "query": {"type": "string"}
        },
        "required": ["query"]
    }
)
async def search_database(query: str):
    results = db.search(query)
    return {"results": results}

# Create agent
agent = Agent(
    name="database_agent",
    version="1.0.0",
    capabilities=[search_database],
    authentication="api_key"
)

# Start server
agent.serve(host="0.0.0.0", port=8080)
```

### Creating an A2A Client Agent

```python
from a2a import RemoteAgent

# Connect to remote agent
remote_agent = RemoteAgent(
    url="https://database-agent.example.com",
    api_key="your_api_key"
)

# Discover capabilities
capabilities = await remote_agent.get_capabilities()
print(f"Available: {[c.name for c in capabilities]}")

# Execute capability
result = await remote_agent.execute(
    capability="search_database",
    input={"query": "customer:12345"}
)

print(result)
```

### Long-Running Task Example

```python
# Start long-running task
task = await remote_agent.start_task(
    capability="comprehensive_research",
    input={"topic": "AI trends 2025"}
)

# Monitor progress
async for update in task.progress_stream():
    print(f"{update.progress*100:.1f}% - {update.message}")

# Get result when complete
result = await task.get_result()
```

---

## Resources

### Official Resources

- **A2A Specification**: [https://github.com/google/A2A](https://github.com/google/A2A)
- **A2A Website**: Code samples and documentation
- **Google Developers Blog**: [A2A Announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)

### Research Papers

- [Survey of Agent Interoperability Protocols](https://arxiv.org/html/2505.02279v1) - Comprehensive comparison of MCP, ACP, A2A, ANP
- [AgentMaster: Multi-Agent Framework using A2A and MCP](https://arxiv.org/html/2507.21105v1) - Practical implementation

### Articles & Guides

- [Agentic AI Protocols: MCP, A2A, and ACP](https://medium.com/@manavg/agentic-ai-protocols-mcp-a2a-and-acp-ea0200eac18b)
- [Top 5 Open Protocols for Multi-Agent AI Systems](https://onereach.ai/blog/power-of-multi-agent-ai-open-protocols/)
- [How Agents Talk: Mapping the Future of Multi-Agent Communication Protocols](https://medium.com/software-architecture-in-the-age-of-ai/how-agents-talk-mapping-the-future-of-multi-agent-communication-protocols-6115ea083dba)

### Community

- **GitHub Discussions**: [google/A2A/discussions](https://github.com/google/A2A/discussions)
- **Contribution**: Community feedback welcomed via documentation and idea submission forms
- **Partners**: Join A2A partner program (contact via website)

---

## Timeline & Status

- **April 9, 2025**: Public announcement with 50+ partners
- **Q2 2025**: Draft specification available on GitHub
- **Late 2025** (planned): Production-ready version 1.0
- **Current Status**: Draft specification, early implementations available

---

**Document Version**: 1.0
**Last Updated**: November 6, 2025
**Protocol Status**: Draft (production release planned late 2025)
