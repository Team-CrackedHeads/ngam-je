# AI Services Architecture

## Overview

This document outlines the comprehensive architecture for AI services in the Ngam-Je backend, following FastAPI best practices (inspired by Netflix Dispatch), and integrating modern agentic AI frameworks.

**Last Updated**: November 8, 2025
**Status**: Proposed Architecture
**Related Docs**: [Agentic AI Framework Documentation](../agentic/README.md)

---

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Design Philosophy](#design-philosophy)
3. [Folder Structure](#folder-structure)
4. [Component Breakdown](#component-breakdown)
5. [Integration Patterns](#integration-patterns)
6. [Implementation Phases](#implementation-phases)
7. [Configuration](#configuration)
8. [API Design](#api-design)
9. [Testing Strategy](#testing-strategy)
10. [Monitoring & Observability](#monitoring--observability)
11. [Best Practices](#best-practices)

---

## Architecture Principles

### 1. Service-Oriented Architecture (SOA)

- **Separation of Concerns**: Clear boundaries between API, business logic, and data layers
- **Plugin Architecture**: AI providers as pluggable modules (inspired by Netflix Dispatch)
- **Dependency Injection**: Clean dependencies managed through FastAPI's DI system
- **Domain-Driven Design**: Organize by business domain, not file type

### 2. Framework Agnostic Core

- **Abstract Interfaces**: Core abstractions that work with any AI framework
- **Provider Pattern**: Swap LLM providers without changing business logic
- **Adapter Pattern**: Framework-specific implementations behind common interfaces

### 3. Production-First Mindset

- **Observability**: Built-in monitoring, tracing, and evaluation
- **Error Handling**: Comprehensive exception handling and retries
- **Rate Limiting**: Protect against API abuse and cost overruns
- **Testing**: Unit, integration, and evaluation testing from day one

### 4. Scalability by Design

- **Modular Structure**: Each AI service is independently scalable
- **Stateless Services**: Enable horizontal scaling
- **Async-First**: Non-blocking I/O for all AI operations
- **Caching**: Smart caching of prompts, embeddings, and responses

---

## Design Philosophy

### Why This Structure?

**1. Netflix Dispatch Patterns**
- Plugin-based architecture for extensibility
- Service registry for dynamic discovery
- Clear separation between API and service layers
- Configuration-driven behavior

**2. FastAPI Best Practices**
- Feature/domain-based organization (not file-type)
- APIRouter for modular routing
- Dependency injection for testability
- Pydantic for type safety and validation

**3. Multi-Framework Support**
- Google ADK for multi-agent systems
- Parlant for conversation modeling
- LangChain/LangGraph for orchestration
- MCP for tool/resource servers
- A2A Protocol for inter-agent communication
- Opik for monitoring and evaluation

### Compared to Alternatives

| Approach | Pros | Cons | Our Choice |
|----------|------|------|------------|
| **Monolithic AI Service** | Simple to start | Hard to scale, tight coupling | ❌ |
| **Microservices per Framework** | Maximum separation | Complex deployment, overhead | ❌ |
| **Modular Monolith** | Balance of simplicity and scalability | Requires discipline | ✅ **This** |
| **File-Type Organization** | Familiar pattern | Poor scalability for large projects | ❌ |

---

## Folder Structure

### Complete Proposed Structure

```
backend/src/app/services/ai/
├── __init__.py                      # AI services registry and exports
├── config.py                        # AI-specific configuration (Pydantic settings)
├── dependencies.py                  # AI service dependencies (FastAPI DI)
│
├── core/                            # Core AI abstractions (framework-agnostic)
│   ├── __init__.py
│   ├── base.py                      # Base classes for agents/tools/workflows
│   ├── provider.py                  # LLM provider abstraction (Gemini, OpenAI, etc.)
│   ├── exceptions.py                # AI-specific exceptions
│   ├── types.py                     # Type definitions and protocols
│   └── interfaces.py                # Abstract interfaces
│
├── agents/                          # Google ADK - Multi-Agent Systems
│   ├── __init__.py
│   ├── registry.py                  # Agent discovery and registration
│   ├── factory.py                   # Agent factory for creation
│   │
│   ├── customer_service/            # Domain: Customer Service Agent
│   │   ├── __init__.py
│   │   ├── agent.py                 # root_agent definition (ADK)
│   │   ├── config.py                # Agent-specific config
│   │   ├── prompts.py               # Prompt templates
│   │   ├── tools.py                 # Agent tools
│   │   └── sub_agents/              # Hierarchical sub-agents
│   │       ├── __init__.py
│   │       ├── triage/              # Triage sub-agent
│   │       │   ├── agent.py
│   │       │   └── __init__.py
│   │       └── resolver/            # Issue resolver sub-agent
│   │           ├── agent.py
│   │           └── __init__.py
│   │
│   ├── data_analyst/                # Domain: Data Analysis Agent
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── config.py
│   │   ├── prompts.py
│   │   └── tools.py
│   │
│   ├── kyc_specialist/              # Domain: KYC Verification Agent
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── config.py
│   │   ├── prompts.py
│   │   └── tools.py
│   │
│   └── tests/                       # ADK test files (.test.json, .evalset.json)
│       ├── customer_service.test.json
│       ├── data_analyst.test.json
│       ├── kyc_specialist.test.json
│       └── integration.evalset.json
│
├── conversations/                   # Parlant - Conversation Modeling
│   ├── __init__.py
│   ├── engine.py                    # Parlant engine initialization
│   ├── manager.py                   # Session and conversation management
│   │
│   ├── guidelines/                  # Behavioral Guidelines (condition-action rules)
│   │   ├── __init__.py
│   │   ├── base.py                  # Base guideline class
│   │   ├── tone.py                  # Tone guidelines (friendly, professional, etc.)
│   │   ├── safety.py                # Safety guidelines (no harmful content)
│   │   ├── compliance.py            # Regulatory compliance (HIPAA, GDPR, etc.)
│   │   └── brand.py                 # Brand voice and messaging
│   │
│   ├── journeys/                    # Customer Journeys (multi-stage flows)
│   │   ├── __init__.py
│   │   ├── base.py                  # Base journey class
│   │   ├── onboarding.py            # User onboarding journey
│   │   ├── kyc_verification.py      # KYC verification journey
│   │   ├── support.py               # Customer support journey
│   │   └── troubleshooting.py       # Technical troubleshooting journey
│   │
│   └── sessions/                    # Session Management
│       ├── __init__.py
│       ├── manager.py               # Session lifecycle management
│       └── storage.py               # Session persistence
│
├── workflows/                       # LangGraph - Workflow Orchestration
│   ├── __init__.py
│   ├── builder.py                   # Workflow graph builder
│   ├── executor.py                  # Workflow execution engine
│   ├── state.py                     # State management and schemas
│   │
│   ├── graphs/                      # Workflow Graph Definitions
│   │   ├── __init__.py
│   │   ├── base.py                  # Base workflow graph
│   │   ├── kyc_verification.py      # KYC verification workflow
│   │   ├── document_processing.py   # Document processing workflow
│   │   ├── customer_support.py      # Customer support workflow
│   │   └── fraud_detection.py       # Fraud detection workflow
│   │
│   └── nodes/                       # Reusable Workflow Nodes
│       ├── __init__.py
│       ├── base.py                  # Base node class
│       ├── validators.py            # Validation nodes
│       ├── processors.py            # Processing nodes
│       ├── decision.py              # Decision/routing nodes
│       └── integrations.py          # External integration nodes
│
├── protocols/                       # A2A Protocol - Inter-Agent Communication
│   ├── __init__.py
│   ├── models.py                    # A2A data models (AgentCard, Message, Task)
│   ├── client.py                    # A2A client implementation
│   ├── server.py                    # A2A server implementation
│   ├── discovery.py                 # Agent discovery mechanisms
│   ├── registry.py                  # Agent registry
│   └── auth.py                      # A2A authentication (OAuth 2.0)
│
├── mcp/                            # MCP - Model Context Protocol Servers
│   ├── __init__.py
│   ├── manager.py                   # MCP server lifecycle manager
│   ├── client.py                    # MCP client utilities
│   │
│   └── servers/                     # Individual MCP Servers
│       ├── __init__.py
│       │
│       ├── database/                # Database MCP Server
│       │   ├── __init__.py
│       │   ├── server.py            # FastMCP server definition
│       │   ├── tools/               # Database tools
│       │   │   ├── __init__.py
│       │   │   ├── query_tools.py   # SQL query tools
│       │   │   └── schema_tools.py  # Schema inspection tools
│       │   └── resources/           # Database resources
│       │       ├── __init__.py
│       │       └── db_resources.py  # DB connection resources
│       │
│       ├── documents/               # Document MCP Server
│       │   ├── __init__.py
│       │   ├── server.py
│       │   ├── tools/
│       │   │   ├── __init__.py
│       │   │   ├── search_tools.py  # Document search
│       │   │   └── extract_tools.py # Text extraction
│       │   └── resources/
│       │       ├── __init__.py
│       │       └── doc_resources.py
│       │
│       └── gcs/                     # Google Cloud Storage MCP Server
│           ├── __init__.py
│           ├── server.py
│           ├── tools/
│           │   ├── __init__.py
│           │   ├── upload_tools.py
│           │   └── download_tools.py
│           └── resources/
│               ├── __init__.py
│               └── bucket_resources.py
│
├── monitoring/                      # Opik/Comet - Monitoring & Evaluation
│   ├── __init__.py
│   ├── config.py                    # Monitoring configuration
│   ├── trackers.py                  # Tracking decorators (@track)
│   ├── metrics.py                   # Custom metrics
│   ├── logger.py                    # Structured logging
│   │
│   ├── evaluations/                 # Evaluation Framework
│   │   ├── __init__.py
│   │   ├── datasets.py              # Test datasets management
│   │   ├── test_cases.py            # Test case definitions
│   │   ├── judges.py                # LLM judges (hallucination, factuality)
│   │   ├── metrics.py               # Evaluation metrics
│   │   └── runners.py               # Evaluation runners
│   │
│   └── dashboards/                  # Dashboard Configurations
│       ├── __init__.py
│       ├── setup.py                 # Dashboard setup scripts
│       └── templates/               # Dashboard templates
│           └── __init__.py
│
├── tools/                           # AI Tools (shared across agents)
│   ├── __init__.py
│   ├── base.py                      # Base tool class
│   ├── registry.py                  # Tool registry
│   │
│   ├── search/                      # Search Tools
│   │   ├── __init__.py
│   │   ├── web_search.py            # Web search tool
│   │   └── semantic_search.py       # Vector/semantic search
│   │
│   ├── data/                        # Data Tools
│   │   ├── __init__.py
│   │   ├── extraction.py            # Data extraction
│   │   └── validation.py            # Data validation
│   │
│   ├── documents/                   # Document Tools
│   │   ├── __init__.py
│   │   ├── analysis.py              # Document analysis
│   │   ├── parsing.py               # Document parsing
│   │   └── generation.py            # Document generation
│   │
│   └── integrations/                # External Integrations
│       ├── __init__.py
│       ├── didit.py                 # DID.it KYC integration
│       ├── clerk.py                 # Clerk auth integration
│       ├── gcs.py                   # Google Cloud Storage
│       └── gemini.py                # Google Gemini API
│
├── prompts/                         # Prompt Management
│   ├── __init__.py
│   ├── registry.py                  # Prompt registry
│   ├── loader.py                    # Prompt loading utilities
│   ├── validator.py                 # Prompt validation
│   │
│   ├── templates/                   # Prompt Templates
│   │   ├── __init__.py
│   │   ├── system.py                # System prompts
│   │   ├── user.py                  # User prompts
│   │   ├── assistant.py             # Assistant prompts
│   │   └── few_shot.py              # Few-shot examples
│   │
│   └── versioning/                  # Prompt Version Control
│       ├── __init__.py
│       └── manager.py               # Version management
│
├── memory/                          # Memory & Context Management
│   ├── __init__.py
│   ├── manager.py                   # Memory manager
│   │
│   ├── stores/                      # Memory Stores
│   │   ├── __init__.py
│   │   ├── base.py                  # Base store interface
│   │   ├── postgres.py              # PostgreSQL memory store
│   │   ├── redis.py                 # Redis cache (optional)
│   │   └── vector.py                # Vector store for embeddings
│   │
│   ├── retrievers/                  # Context Retrievers
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── semantic.py              # Semantic retrieval
│   │   └── hybrid.py                # Hybrid retrieval
│   │
│   └── strategies/                  # Memory Strategies
│       ├── __init__.py
│       ├── conversation.py          # Conversation memory
│       └── entity.py                # Entity memory
│
└── utils/                           # AI Utilities
    ├── __init__.py
    ├── rate_limiting.py             # Rate limiting utilities
    ├── retry.py                     # Retry logic with exponential backoff
    ├── streaming.py                 # Streaming response utilities
    ├── cost_tracking.py             # Token/cost tracking
    ├── formatting.py                # Response formatting
    └── validation.py                # Input validation
```

### API Endpoints Structure

```
backend/src/app/api/v1/endpoints/ai/
├── __init__.py                      # AI router aggregation
├── agents.py                        # Agent management endpoints
├── chat.py                          # Chat/conversation endpoints
├── workflows.py                     # Workflow execution endpoints
├── tools.py                         # Tool management endpoints
├── evaluations.py                   # Evaluation endpoints
└── monitoring.py                    # Monitoring dashboard endpoints
```

---

## Component Breakdown

### 1. Core (`core/`)

**Purpose**: Framework-agnostic abstractions and interfaces

**Key Files**:

```python
# core/base.py
from abc import ABC, abstractmethod
from typing import Any, Dict, List

class BaseAgent(ABC):
    """Base class for all AI agents."""

    @abstractmethod
    async def execute(self, input: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agent with given input."""
        pass

    @abstractmethod
    def get_tools(self) -> List['BaseTool']:
        """Get agent's available tools."""
        pass

class BaseTool(ABC):
    """Base class for all AI tools."""

    @abstractmethod
    async def run(self, *args, **kwargs) -> Any:
        """Run the tool."""
        pass

class BaseWorkflow(ABC):
    """Base class for workflows."""

    @abstractmethod
    async def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workflow."""
        pass
```

```python
# core/provider.py
from enum import Enum
from typing import Protocol

class LLMProvider(str, Enum):
    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    COHERE = "cohere"

class LLMInterface(Protocol):
    """Protocol for LLM providers."""

    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate completion."""
        ...

    async def stream(self, prompt: str, **kwargs):
        """Stream completion."""
        ...
```

**Design Decisions**:
- Use Abstract Base Classes (ABC) for inheritance
- Use Protocol for structural typing
- Keep dependencies minimal
- No framework-specific code

---

### 2. Agents (`agents/`)

**Purpose**: Google ADK multi-agent implementations

**Structure**: Domain-based organization (not file-type)

**Example Agent**:

```python
# agents/customer_service/agent.py
from google import genai
from google.genai import types
from app.services.ai.core.base import BaseAgent
from app.services.ai.tools.integrations.clerk import get_user_info
from app.services.ai.monitoring.trackers import track_agent

@track_agent("customer_service")
class CustomerServiceAgent(BaseAgent):
    """Multi-agent customer service system."""

    def __init__(self):
        self.client = genai.Client()
        self.tools = [get_user_info, ...]

    async def execute(self, input: dict) -> dict:
        """Execute customer service agent."""
        agent = types.Agent(
            model="gemini-2.0-flash-exp",
            tools=self.tools,
            instruction="You are a helpful customer service agent..."
        )

        response = await self.client.agentic.run(
            agent=agent,
            input=input["message"]
        )

        return {"response": response.text}
```

**Key Features**:
- Each agent is self-contained
- Sub-agents for complex hierarchies
- ADK test files alongside agent code
- Monitoring integration via decorators

---

### 3. Conversations (`conversations/`)

**Purpose**: Parlant conversation modeling for compliance and control

**Guidelines Example**:

```python
# conversations/guidelines/compliance.py
from parlant import Guideline

class HIPAAComplianceGuideline:
    """HIPAA compliance for healthcare conversations."""

    @staticmethod
    def get_guidelines():
        return [
            Guideline(
                condition="user asks for medical records",
                action="Verify identity first, then check authorization",
                priority=10
            ),
            Guideline(
                condition="user mentions PHI",
                action="Acknowledge securely, log access",
                priority=10
            )
        ]
```

**Journey Example**:

```python
# conversations/journeys/kyc_verification.py
from parlant import Journey, Stage

kyc_journey = Journey(
    name="KYC Verification",
    stages=[
        Stage(
            name="greeting",
            message="Welcome! Let's verify your identity.",
            next_stage="document_upload"
        ),
        Stage(
            name="document_upload",
            message="Please upload your ID document.",
            next_stage="verification"
        ),
        Stage(
            name="verification",
            message="Verifying your documents...",
            next_stage="complete"
        ),
        Stage(
            name="complete",
            message="Verification complete!"
        )
    ]
)
```

---

### 4. Workflows (`workflows/`)

**Purpose**: LangGraph orchestration for complex multi-step processes

**Example Workflow**:

```python
# workflows/graphs/kyc_verification.py
from langgraph.graph import StateGraph
from app.services.ai.workflows.nodes.validators import validate_document
from app.services.ai.workflows.nodes.integrations import call_didit_api

class KYCVerificationWorkflow:
    """KYC verification workflow using LangGraph."""

    def __init__(self):
        self.graph = StateGraph()
        self._build_graph()

    def _build_graph(self):
        """Build the workflow graph."""
        self.graph.add_node("validate", validate_document)
        self.graph.add_node("verify", call_didit_api)
        self.graph.add_node("store", store_verification_result)

        self.graph.add_edge("validate", "verify")
        self.graph.add_edge("verify", "store")

        self.graph.set_entry_point("validate")
        self.graph.set_finish_point("store")

    async def execute(self, state: dict) -> dict:
        """Execute workflow."""
        return await self.graph.ainvoke(state)
```

---

### 5. Protocols (`protocols/`)

**Purpose**: A2A Protocol for cross-agent and cross-vendor communication

**Agent Card Example**:

```python
# protocols/models.py
from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class AgentCard(BaseModel):
    """A2A Agent Card for capability advertisement."""

    name: str
    description: str
    version: str
    endpoint: HttpUrl
    capabilities: List[str]
    skills: List['Skill']
    oauth_endpoint: Optional[HttpUrl] = None

class Skill(BaseModel):
    """Agent skill definition."""

    name: str
    description: str
    input_schema: dict
    output_schema: dict
```

---

### 6. MCP (`mcp/`)

**Purpose**: Model Context Protocol servers for tools and resources

**Example Server**:

```python
# mcp/servers/database/server.py
from fastmcp import FastMCP

mcp = FastMCP("ngam-je-database")

@mcp.tool()
async def query_users(limit: int = 10) -> list:
    """Query users from database."""
    # Implementation
    pass

@mcp.resource("db://users/schema")
def get_user_schema() -> dict:
    """Get user table schema."""
    # Implementation
    pass
```

**FastAPI Integration**:

```python
# api/v1/endpoints/ai/tools.py
from app.services.ai.mcp.servers.database.server import mcp

# Mount MCP server to FastAPI
router.mount("/mcp/database", mcp.get_asgi_app())
```

---

### 7. Monitoring (`monitoring/`)

**Purpose**: Opik integration for observability and evaluation

**Tracking Example**:

```python
# monitoring/trackers.py
import opik
from functools import wraps

def track_agent(agent_name: str):
    """Decorator to track agent execution."""
    def decorator(cls):
        original_execute = cls.execute

        @wraps(original_execute)
        @opik.track(name=f"agent_{agent_name}")
        async def tracked_execute(self, *args, **kwargs):
            return await original_execute(self, *args, **kwargs)

        cls.execute = tracked_execute
        return cls
    return decorator
```

**Evaluation Example**:

```python
# monitoring/evaluations/judges.py
from opik.evaluation.metrics import hallucination, moderation

def evaluate_response(response: str, context: str) -> dict:
    """Evaluate response quality."""
    return {
        "hallucination_score": hallucination(response, context),
        "moderation_score": moderation(response),
    }
```

---

## Integration Patterns

### Pattern 1: Full Stack Integration

**Use Case**: Complex customer support with compliance requirements

```python
# api/v1/endpoints/ai/chat.py
from app.services.ai.agents.registry import get_agent
from app.services.ai.conversations.engine import get_conversation_engine
from app.services.ai.workflows.executor import get_workflow
from app.services.ai.monitoring.trackers import track_request

@router.post("/chat/support")
@track_request("support_chat")
async def support_chat(message: str, session_id: str):
    """
    Full stack AI chat:
    1. Parlant for conversation modeling
    2. LangGraph for workflow orchestration
    3. Google ADK for agent execution
    4. Opik for monitoring
    """

    # Step 1: Parlant - Apply conversation guidelines
    conversation = get_conversation_engine()
    guided_context = await conversation.process(
        message=message,
        session_id=session_id,
        guidelines=["safety", "compliance", "tone"]
    )

    # Step 2: LangGraph - Determine workflow
    workflow = get_workflow("customer_support")
    workflow_state = await workflow.execute({
        "message": message,
        "context": guided_context
    })

    # Step 3: Google ADK - Execute agent
    agent = get_agent("customer_service")
    response = await agent.execute(workflow_state)

    return {"response": response, "session_id": session_id}
```

### Pattern 2: Simple Agent Call

**Use Case**: Direct agent interaction without workflows

```python
@router.post("/chat/simple")
async def simple_chat(message: str):
    """Simple agent chat without workflows."""
    agent = get_agent("customer_service")
    response = await agent.execute({"message": message})
    return {"response": response}
```

### Pattern 3: Workflow-Only

**Use Case**: Complex orchestration without conversational modeling

```python
@router.post("/workflows/kyc")
async def run_kyc_workflow(user_id: str, document_url: str):
    """Run KYC verification workflow."""
    workflow = get_workflow("kyc_verification")
    result = await workflow.execute({
        "user_id": user_id,
        "document_url": document_url
    })
    return result
```

### Pattern 4: Inter-Agent Communication (A2A)

**Use Case**: Multiple agents collaborating on a task

```python
@router.post("/agents/collaborate")
async def agent_collaboration(task: dict):
    """Multiple agents working together via A2A protocol."""
    from app.services.ai.protocols.client import A2AClient

    # Agent 1: Data analyst extracts insights
    analyst_client = A2AClient("data_analyst")
    analysis = await analyst_client.send_task({
        "action": "analyze",
        "data": task["data"]
    })

    # Agent 2: Customer service uses analysis
    support_client = A2AClient("customer_service")
    response = await support_client.send_task({
        "action": "respond",
        "analysis": analysis,
        "query": task["query"]
    })

    return {"response": response}
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal**: Establish core infrastructure and basic AI capabilities

**Tasks**:
1. ✅ Create folder structure (`ai/core/`, `ai/agents/`, `ai/monitoring/`)
2. ✅ Implement core abstractions (`BaseAgent`, `BaseTool`, `BaseWorkflow`)
3. ✅ Set up LLM provider abstraction (Gemini)
4. ✅ Create first agent (Customer Service)
5. ✅ Add basic monitoring (Opik setup)
6. ✅ Create `/api/v1/ai/chat` endpoint
7. ✅ Write unit tests

**Deliverables**:
- Working chat endpoint with single agent
- Basic monitoring dashboard
- Core abstractions tested
- Documentation updated

**Success Metrics**:
- Agent responds correctly to basic queries
- Monitoring captures all requests
- Tests pass with >80% coverage

---

### Phase 2: Expand Capabilities (Weeks 3-4)

**Goal**: Add conversation modeling and workflow orchestration

**Tasks**:
1. ✅ Implement Parlant conversation engine
2. ✅ Create guidelines (safety, compliance, tone)
3. ✅ Design customer journeys (onboarding, support)
4. ✅ Implement LangGraph workflows
5. ✅ Create workflow graphs (KYC, document processing)
6. ✅ Add MCP servers (database, documents, GCS)
7. ✅ Create additional agents (Data Analyst, KYC Specialist)
8. ✅ Implement evaluation pipeline (ADK + Opik)

**Deliverables**:
- Parlant-guided conversations
- LangGraph workflows for complex processes
- MCP servers integrated
- Multiple specialized agents
- Comprehensive evaluation suite

**Success Metrics**:
- Conversations follow guidelines 100%
- Workflows complete successfully
- MCP tools accessible to agents
- Evaluation metrics tracked

---

### Phase 3: Advanced Features (Weeks 5-6)

**Goal**: Production-ready with advanced capabilities

**Tasks**:
1. ✅ Implement A2A protocol for inter-agent communication
2. ✅ Create agent registry and discovery
3. ✅ Add advanced memory management (conversation, entity)
4. ✅ Implement vector store for semantic search
5. ✅ Add streaming response support
6. ✅ Implement rate limiting and cost tracking
7. ✅ Create production monitoring dashboards
8. ✅ Add comprehensive error handling and retries
9. ✅ Performance optimization (caching, batching)
10. ✅ Complete test coverage (unit, integration, e2e)

**Deliverables**:
- A2A-enabled multi-agent system
- Production monitoring and alerting
- Advanced memory and context management
- Optimized performance
- Complete documentation

**Success Metrics**:
- Agents communicate via A2A successfully
- Response time <2s for 95% of requests
- Cost tracking accurate within 1%
- Test coverage >90%
- Zero critical bugs in production

---

## Configuration

### AI Settings (`ai/config.py`)

```python
# app/services/ai/config.py
from pydantic_settings import BaseSettings
from typing import Literal

class AISettings(BaseSettings):
    """AI service configuration."""

    # ========================================
    # LLM Provider Settings
    # ========================================
    gemini_api_key: str
    default_model: str = "gemini-2.0-flash-exp"
    default_temperature: float = 0.7
    default_max_tokens: int = 2048

    # ========================================
    # Google ADK Settings
    # ========================================
    adk_enabled: bool = True
    adk_eval_enabled: bool = False
    adk_vertex_project_id: str | None = None

    # ========================================
    # Parlant Settings
    # ========================================
    parlant_enabled: bool = True
    parlant_home: str = "./data/parlant"
    parlant_strict_mode: bool = False

    # ========================================
    # LangGraph Settings
    # ========================================
    langgraph_enabled: bool = True
    langgraph_checkpointing: bool = True
    langgraph_checkpoint_store: Literal["postgres", "memory"] = "postgres"

    # ========================================
    # MCP Settings
    # ========================================
    mcp_enabled: bool = True
    mcp_database_enabled: bool = True
    mcp_documents_enabled: bool = True
    mcp_gcs_enabled: bool = True

    # ========================================
    # A2A Protocol Settings
    # ========================================
    a2a_enabled: bool = False
    a2a_oauth_enabled: bool = False
    a2a_registry_url: str | None = None

    # ========================================
    # Monitoring (Opik) Settings
    # ========================================
    opik_enabled: bool = True
    opik_workspace: str = "ngam-je"
    opik_use_local: bool = True
    opik_api_key: str | None = None

    # ========================================
    # Memory Settings
    # ========================================
    memory_store: Literal["postgres", "redis"] = "postgres"
    memory_ttl_seconds: int = 3600  # 1 hour

    # ========================================
    # Rate Limiting
    # ========================================
    rate_limit_enabled: bool = True
    rate_limit_requests_per_minute: int = 60
    rate_limit_tokens_per_minute: int = 100000

    # ========================================
    # Cost Tracking
    # ========================================
    cost_tracking_enabled: bool = True
    cost_per_input_token: float = 0.000001  # $0.001/1K tokens
    cost_per_output_token: float = 0.000002  # $0.002/1K tokens

    class Config:
        env_prefix = "AI_"
        env_file = ".env"

# Singleton instance
_settings: AISettings | None = None

def get_ai_settings() -> AISettings:
    """Get AI settings singleton."""
    global _settings
    if _settings is None:
        _settings = AISettings()
    return _settings
```

### Environment Variables (`.env`)

```bash
# ========================================
# AI Service Configuration
# ========================================

# LLM Provider
AI_GEMINI_API_KEY=your_gemini_api_key_here
AI_DEFAULT_MODEL=gemini-2.0-flash-exp
AI_DEFAULT_TEMPERATURE=0.7
AI_DEFAULT_MAX_TOKENS=2048

# Google ADK
AI_ADK_ENABLED=true
AI_ADK_EVAL_ENABLED=false
AI_ADK_VERTEX_PROJECT_ID=your_gcp_project_id

# Parlant
AI_PARLANT_ENABLED=true
AI_PARLANT_HOME=./data/parlant
AI_PARLANT_STRICT_MODE=false

# LangGraph
AI_LANGGRAPH_ENABLED=true
AI_LANGGRAPH_CHECKPOINTING=true
AI_LANGGRAPH_CHECKPOINT_STORE=postgres

# MCP
AI_MCP_ENABLED=true
AI_MCP_DATABASE_ENABLED=true
AI_MCP_DOCUMENTS_ENABLED=true
AI_MCP_GCS_ENABLED=true

# A2A Protocol
AI_A2A_ENABLED=false
AI_A2A_OAUTH_ENABLED=false
AI_A2A_REGISTRY_URL=

# Monitoring (Opik)
AI_OPIK_ENABLED=true
AI_OPIK_WORKSPACE=ngam-je
AI_OPIK_USE_LOCAL=true
AI_OPIK_API_KEY=

# Memory
AI_MEMORY_STORE=postgres
AI_MEMORY_TTL_SECONDS=3600

# Rate Limiting
AI_RATE_LIMIT_ENABLED=true
AI_RATE_LIMIT_REQUESTS_PER_MINUTE=60
AI_RATE_LIMIT_TOKENS_PER_MINUTE=100000

# Cost Tracking
AI_COST_TRACKING_ENABLED=true
AI_COST_PER_INPUT_TOKEN=0.000001
AI_COST_PER_OUTPUT_TOKEN=0.000002
```

---

## API Design

### Endpoint Organization

```python
# app/api/v1/endpoints/ai/__init__.py
from fastapi import APIRouter
from . import agents, chat, workflows, tools, evaluations, monitoring

router = APIRouter()

router.include_router(agents.router, prefix="/agents", tags=["AI - Agents"])
router.include_router(chat.router, prefix="/chat", tags=["AI - Chat"])
router.include_router(workflows.router, prefix="/workflows", tags=["AI - Workflows"])
router.include_router(tools.router, prefix="/tools", tags=["AI - Tools"])
router.include_router(evaluations.router, prefix="/evaluations", tags=["AI - Evaluations"])
router.include_router(monitoring.router, prefix="/monitoring", tags=["AI - Monitoring"])
```

### Chat Endpoint (`ai/chat.py`)

```python
# app/api/v1/endpoints/ai/chat.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.ai.agents.registry import get_agent
from app.services.ai.conversations.engine import get_conversation_engine
from app.services.ai.monitoring.trackers import track_request

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    agent_type: str = "customer_service"
    session_id: str | None = None
    stream: bool = False

class ChatResponse(BaseModel):
    response: str
    session_id: str
    agent: str
    metadata: dict | None = None

@router.post("/", response_model=ChatResponse)
@track_request("chat_endpoint")
async def chat(request: ChatRequest):
    """
    Chat with an AI agent.

    - **message**: User message
    - **agent_type**: Type of agent (customer_service, data_analyst, kyc_specialist)
    - **session_id**: Optional session ID for conversation continuity
    - **stream**: Stream response (SSE)
    """
    try:
        # Get agent
        agent = get_agent(request.agent_type)

        # Get conversation engine (Parlant)
        if request.session_id:
            conversation = get_conversation_engine()
            guided_context = await conversation.process(
                message=request.message,
                session_id=request.session_id
            )
        else:
            guided_context = {"message": request.message}

        # Execute agent
        result = await agent.execute(guided_context)

        return ChatResponse(
            response=result["response"],
            session_id=request.session_id or "new",
            agent=request.agent_type,
            metadata=result.get("metadata")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_session_history(session_id: str):
    """Get conversation history for a session."""
    # Implementation
    pass
```

### Workflow Endpoint (`ai/workflows.py`)

```python
# app/api/v1/endpoints/ai/workflows.py
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from app.services.ai.workflows.executor import get_workflow

router = APIRouter()

class WorkflowRequest(BaseModel):
    workflow_type: str
    input_data: dict
    async_execution: bool = False

@router.post("/execute")
async def execute_workflow(
    request: WorkflowRequest,
    background_tasks: BackgroundTasks
):
    """
    Execute an AI workflow.

    - **workflow_type**: kyc_verification, document_processing, etc.
    - **input_data**: Workflow input
    - **async_execution**: Run in background
    """
    workflow = get_workflow(request.workflow_type)

    if request.async_execution:
        background_tasks.add_task(
            workflow.execute,
            request.input_data
        )
        return {"status": "started", "message": "Workflow running in background"}
    else:
        result = await workflow.execute(request.input_data)
        return {"status": "completed", "result": result}
```

---

## Testing Strategy

### Unit Tests

```python
# tests/services/ai/agents/test_customer_service.py
import pytest
from app.services.ai.agents.customer_service.agent import CustomerServiceAgent

@pytest.mark.asyncio
async def test_customer_service_agent_basic_query():
    """Test basic customer service query."""
    agent = CustomerServiceAgent()

    response = await agent.execute({
        "message": "What are your business hours?"
    })

    assert "response" in response
    assert len(response["response"]) > 0

@pytest.mark.asyncio
async def test_customer_service_agent_tool_calling():
    """Test agent uses tools correctly."""
    agent = CustomerServiceAgent()

    response = await agent.execute({
        "message": "What's my account status?",
        "user_id": "user_123"
    })

    assert "response" in response
    # Verify tool was called
    assert response.get("metadata", {}).get("tools_used") is not None
```

### Integration Tests (ADK)

```json
// agents/tests/customer_service.test.json
{
  "name": "Customer Service Agent Test",
  "cases": [
    {
      "input": "What are your hours?",
      "expected_output_contains": ["Monday", "Friday"],
      "tools_called": []
    },
    {
      "input": "Check my order status",
      "expected_tools": ["get_order_status"],
      "expected_output_contains": ["order"]
    }
  ]
}
```

### Evaluation Tests (Opik)

```python
# tests/evaluations/test_response_quality.py
from opik.evaluation import evaluate
from opik.evaluation.metrics import hallucination, moderation
from app.services.ai.agents.registry import get_agent

async def test_response_quality():
    """Evaluate response quality across test dataset."""
    agent = get_agent("customer_service")

    test_cases = [
        {"input": "Hello", "context": "greeting"},
        {"input": "What's the refund policy?", "context": "policy_doc"}
    ]

    results = await evaluate(
        agent=agent,
        dataset=test_cases,
        metrics=[hallucination, moderation]
    )

    assert results["hallucination_avg"] < 0.1  # Low hallucination
    assert results["moderation_avg"] > 0.9      # High moderation score
```

---

## Monitoring & Observability

### Tracking Requests

```python
# monitoring/trackers.py
import opik
from opik.decorator import track
from functools import wraps

def track_request(name: str):
    """Decorator to track API requests."""
    return track(
        name=name,
        tags=["api", "request"],
        capture_input=True,
        capture_output=True
    )

def track_agent(agent_name: str):
    """Decorator to track agent execution."""
    def decorator(cls):
        original_execute = cls.execute

        @wraps(original_execute)
        @track(name=f"agent_{agent_name}", tags=["agent"])
        async def tracked_execute(self, *args, **kwargs):
            return await original_execute(self, *args, **kwargs)

        cls.execute = tracked_execute
        return cls
    return decorator
```

### Custom Metrics

```python
# monitoring/metrics.py
import opik
from typing import Dict, Any

async def log_cost_metrics(
    model: str,
    input_tokens: int,
    output_tokens: int,
    duration_ms: int
):
    """Log cost and performance metrics."""
    cost = calculate_cost(input_tokens, output_tokens)

    opik.log_metrics({
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_cost_usd": cost,
        "duration_ms": duration_ms,
        "tokens_per_second": (input_tokens + output_tokens) / (duration_ms / 1000)
    })
```

### Dashboards

```python
# monitoring/dashboards/setup.py
import opik

def create_production_dashboard():
    """Create production monitoring dashboard."""
    dashboard = opik.Dashboard(name="AI Production Metrics")

    dashboard.add_panel(
        name="Request Volume",
        query="count(requests) by agent_type",
        visualization="time_series"
    )

    dashboard.add_panel(
        name="Response Time p95",
        query="percentile(duration_ms, 95) by agent_type",
        visualization="gauge"
    )

    dashboard.add_panel(
        name="Cost per Day",
        query="sum(total_cost_usd) by day",
        visualization="bar_chart"
    )

    dashboard.add_panel(
        name="Error Rate",
        query="count(errors) / count(requests) * 100",
        visualization="single_stat"
    )

    return dashboard
```

---

## Best Practices

### 1. Error Handling

```python
# core/exceptions.py
class AIServiceException(Exception):
    """Base exception for AI services."""
    pass

class AgentExecutionError(AIServiceException):
    """Agent execution failed."""
    pass

class WorkflowExecutionError(AIServiceException):
    """Workflow execution failed."""
    pass

class RateLimitExceeded(AIServiceException):
    """Rate limit exceeded."""
    pass

class CostLimitExceeded(AIServiceException):
    """Cost limit exceeded."""
    pass

# Usage in agent
from app.services.ai.core.exceptions import AgentExecutionError
from app.services.ai.utils.retry import retry_with_backoff

class CustomerServiceAgent:
    @retry_with_backoff(max_retries=3)
    async def execute(self, input: dict) -> dict:
        try:
            # Agent logic
            pass
        except Exception as e:
            raise AgentExecutionError(f"Agent failed: {str(e)}") from e
```

### 2. Rate Limiting

```python
# utils/rate_limiting.py
from fastapi import HTTPException
from app.services.ai.core.exceptions import RateLimitExceeded
import time

class RateLimiter:
    """Simple token bucket rate limiter."""

    def __init__(self, requests_per_minute: int, tokens_per_minute: int):
        self.requests_per_minute = requests_per_minute
        self.tokens_per_minute = tokens_per_minute
        self.request_tokens = requests_per_minute
        self.token_budget = tokens_per_minute
        self.last_refill = time.time()

    def check_limit(self, estimated_tokens: int = 0):
        """Check if request is within limits."""
        self._refill()

        if self.request_tokens < 1:
            raise RateLimitExceeded("Request rate limit exceeded")

        if estimated_tokens > 0 and self.token_budget < estimated_tokens:
            raise RateLimitExceeded("Token rate limit exceeded")

        self.request_tokens -= 1
        self.token_budget -= estimated_tokens

    def _refill(self):
        """Refill token buckets."""
        now = time.time()
        elapsed = now - self.last_refill

        if elapsed >= 60:  # 1 minute
            self.request_tokens = self.requests_per_minute
            self.token_budget = self.tokens_per_minute
            self.last_refill = now
```

### 3. Cost Tracking

```python
# utils/cost_tracking.py
from app.services.ai.config import get_ai_settings
from app.services.ai.monitoring.metrics import log_cost_metrics

async def track_cost(
    model: str,
    input_tokens: int,
    output_tokens: int,
    duration_ms: int
):
    """Track and log cost metrics."""
    settings = get_ai_settings()

    input_cost = input_tokens * settings.cost_per_input_token
    output_cost = output_tokens * settings.cost_per_output_token
    total_cost = input_cost + output_cost

    await log_cost_metrics(
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        duration_ms=duration_ms
    )

    # Check cost limits
    if settings.cost_tracking_enabled:
        daily_cost = await get_daily_cost()
        if daily_cost > settings.daily_cost_limit:
            raise CostLimitExceeded(f"Daily cost limit exceeded: ${daily_cost:.2f}")

    return total_cost
```

### 4. Streaming Responses

```python
# utils/streaming.py
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator

async def stream_agent_response(agent, input: dict) -> AsyncGenerator[str, None]:
    """Stream agent response using SSE."""
    async for chunk in agent.stream(input):
        yield f"data: {chunk}\n\n"
    yield "data: [DONE]\n\n"

# Usage in endpoint
@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream chat response."""
    agent = get_agent(request.agent_type)
    return StreamingResponse(
        stream_agent_response(agent, {"message": request.message}),
        media_type="text/event-stream"
    )
```

### 5. Dependency Injection

```python
# dependencies.py
from fastapi import Depends
from app.services.ai.agents.registry import AgentRegistry
from app.services.ai.monitoring.config import get_opik_client
from app.services.ai.config import get_ai_settings

def get_agent_registry() -> AgentRegistry:
    """Get agent registry dependency."""
    return AgentRegistry()

def get_monitoring() -> OpikClient:
    """Get monitoring client dependency."""
    return get_opik_client()

# Usage in endpoint
@router.post("/chat")
async def chat(
    request: ChatRequest,
    registry: AgentRegistry = Depends(get_agent_registry),
    monitoring = Depends(get_monitoring)
):
    """Chat with dependency injection."""
    agent = registry.get_agent(request.agent_type)
    # Use agent
```

### 6. Prompt Versioning

```python
# prompts/versioning/manager.py
from typing import Dict
import json

class PromptVersionManager:
    """Manage prompt versions."""

    def __init__(self, storage_path: str = "./prompts/versions"):
        self.storage_path = storage_path
        self.versions: Dict[str, Dict[str, str]] = {}

    def save_version(self, prompt_name: str, content: str, version: str):
        """Save a prompt version."""
        if prompt_name not in self.versions:
            self.versions[prompt_name] = {}

        self.versions[prompt_name][version] = content
        self._persist()

    def get_version(self, prompt_name: str, version: str = "latest") -> str:
        """Get specific prompt version."""
        if version == "latest":
            versions = self.versions.get(prompt_name, {})
            if not versions:
                raise ValueError(f"No versions found for {prompt_name}")
            version = max(versions.keys())

        return self.versions[prompt_name][version]

    def rollback(self, prompt_name: str, to_version: str):
        """Rollback to previous version."""
        content = self.get_version(prompt_name, to_version)
        self.save_version(prompt_name, content, "latest")
```

---

## Next Steps

### Immediate Actions

1. **Review & Approve Architecture**: Team review of proposed structure
2. **Create GitHub Issues**: Break down implementation into tasks
3. **Set Up Project Board**: Kanban board for tracking progress
4. **Assign Phase 1 Tasks**: Developers assigned to foundation work

### Phase 1 Kickoff Checklist

- [ ] Create `ai/` folder structure
- [ ] Set up core abstractions
- [ ] Configure Gemini API access
- [ ] Implement first agent (Customer Service)
- [ ] Set up Opik monitoring
- [ ] Create chat endpoint
- [ ] Write tests
- [ ] Update documentation

### Questions to Answer

1. **Timeline**: When do we want Phase 1 completed?
2. **Resources**: How many developers on AI services?
3. **Priorities**: Which agent/workflow is highest priority?
4. **Compliance**: Any specific regulatory requirements to consider?
5. **Infrastructure**: Do we need additional cloud resources (Redis, vector DB)?

---

## References

- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Netflix Dispatch Architecture](https://github.com/Netflix/dispatch)
- [Agentic AI Framework Documentation](../agentic/README.md)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [LangChain Documentation](https://docs.langchain.com/)
- [Parlant Documentation](https://www.parlant.io/docs/)
- [A2A Protocol Specification](https://github.com/google/A2A)
- [Opik Documentation](https://www.comet.com/docs/opik/)

---

**Document Version**: 1.0
**Last Updated**: November 8, 2025
**Authors**: Development Team
**Status**: Proposed - Awaiting Approval
