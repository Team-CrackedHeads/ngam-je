# Google Agent Development Kit (ADK): Comprehensive Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Core Features](#core-features)
3. [Built-in Evaluation Framework](#built-in-evaluation-framework)
4. [Multi-Agent Architecture](#multi-agent-architecture)
5. [Tool Integration](#tool-integration)
6. [Integration with Other Frameworks](#integration-with-other-frameworks)
7. [Deployment & Production](#deployment--production)
8. [Resources](#resources)

---

## Introduction

Google's Agent Development Kit (ADK) is a Python framework designed to make building multi-agent AI applications easy and production-ready. Released in 2024, ADK provides comprehensive tools for agent development, evaluation, and deployment.

**Key Value Proposition**: While other frameworks focus on single-agent optimization, ADK is purpose-built for multi-agent systems where specialized agents communicate, collaborate, and delegate tasks.

---

## Core Features

### 1. Multi-Agent Architecture

ADK is designed from the ground up for systems with **multiple independent AI agents**:

```python
from google.adk import Agent, Runtime

# Create specialized agents
research_agent = Agent(
    name="researcher",
    model="gemini-2.0-flash-001",
    instructions="You are a research specialist..."
)

writer_agent = Agent(
    name="writer",
    model="gemini-2.0-flash-001",
    instructions="You are a content writer..."
)

# Runtime coordinates agents
runtime = Runtime(agents=[research_agent, writer_agent])
```

**Benefits**:
- Clear separation of concerns
- Specialized expertise per agent
- Scalable architecture
- Independent testing and deployment

### 2. Model Agnostic

Supports LLMs from multiple providers:
- **Google**: Gemini Pro, Gemini Flash, Gemini Ultra
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **OpenAI**: GPT-4, GPT-3.5
- **Cohere**: Command R+
- **Open-source**: Llama, Mistral via Vertex AI

**Provider Switching**:
```python
# Easy model switching
agent = Agent(
    name="my-agent",
    model="gemini-2.0-flash-001"  # or "claude-3-5-sonnet-20241022"
)
```

### 3. Declarative Agent Configuration

```python
agent = Agent(
    name="customer_service",
    model="gemini-2.0-flash-001",
    instructions="You are a helpful customer service agent...",
    tools=[search_tool, database_tool],
    memory=ConversationMemory(backend="redis"),
    max_iterations=10,
    temperature=0.7
)
```

### 4. Built-in Safety & Security

- **Enterprise-grade authentication**: OAuth 2.0, API keys
- **Authorization controls**: Role-based access
- **Content filtering**: Gemini safety ratings
- **Audit logging**: Full request/response tracking
- **Data privacy**: PII redaction support

---

## Built-in Evaluation Framework

### Overview

ADK includes a comprehensive evaluation system that addresses the challenge of testing probabilistic LLM agents.

**Key Insight**: Traditional deterministic "pass/fail" assertions don't work for LLM agents. ADK uses qualitative evaluation of both final output and agent trajectory.

### Evaluation Methods

#### 1. Test Files (Unit Testing)

**Best for**: Active development, rapid iteration

```python
# tests/test_agent.py
from google.adk.testing import AgentTest

def test_customer_inquiry():
    test = AgentTest(
        agent=my_agent,
        user_input="What's your return policy?",
        expected_tools=["search_knowledge_base"],
        expected_response_contains=["30-day return", "receipt required"]
    )
    test.run()
```

**Characteristics**:
- Individual test cases per file
- Single session with one or more turns
- Fast execution (seconds)
- Ideal for CI/CD pipelines

#### 2. Evalset Files (Integration Testing)

**Best for**: Pre-production validation, comprehensive testing

```yaml
# evalsets/customer_service.yaml
name: customer_service_evalset
sessions:
  - id: session_1
    turns:
      - user: "I need to return a product"
        expected_tools: ["search_orders", "check_return_policy"]
        expected_response: "I can help you with that return..."
      - user: "It's been 45 days since purchase"
        expected_tools: ["check_return_policy"]
        expected_response: "Our return policy is 30 days..."
  - id: session_2
    turns:
      # ... more test scenarios
```

**Characteristics**:
- Multiple complex, multi-turn sessions
- Requires Vertex Gen AI Evaluation Service API (paid)
- Comprehensive test coverage
- Production readiness validation

### Seven Built-in Evaluation Metrics

#### 1. `tool_trajectory_avg_score`
**Purpose**: Exact tool call sequence matching

**How it works**: Compares the actual sequence of tool calls against expected trajectory

**Use case**: Ensuring agents follow correct procedures (e.g., check inventory before ordering)

#### 2. `response_match_score`
**Purpose**: Text similarity to reference responses

**How it works**: Uses ROUGE-1 algorithm for similarity scoring

**Use case**: Verify factual accuracy of responses

#### 3. `final_response_match_v2`
**Purpose**: Semantic equivalence via LLM judge

**How it works**: LLM evaluates if response has same meaning as reference

**Use case**: Allow natural language variation while ensuring correctness

#### 4. `rubric_based_final_response_quality_v1`
**Purpose**: Custom quality assessment

**How it works**: Define your own rubric criteria, LLM grades accordingly

**Example rubric**:
```python
rubric = {
    "helpfulness": "Does the response fully address the user's question?",
    "clarity": "Is the response easy to understand?",
    "accuracy": "Is the information factually correct?"
}
```

#### 5. `rubric_based_tool_use_quality_v1`
**Purpose**: Evaluate tool usage quality

**How it works**: LLM judges if tools were used appropriately

**Use case**: Ensure agents don't over-use or under-use tools

#### 6. `hallucinations_v1`
**Purpose**: Groundedness checking

**How it works**: Verify claims are supported by retrieved context

**Use case**: Prevent agents from inventing facts not in knowledge base

#### 7. `safety_v1`
**Purpose**: Harmlessness assessment

**How it works**: Check for toxic, biased, or unsafe content

**Use case**: Ensure production safety and compliance

### Three Ways to Evaluate

#### 1. Web UI (`adk web`)

**Interactive evaluation interface**:

```bash
adk web
```

**Features**:
- Visual test case creation
- Real-time execution
- Result visualization
- Side-by-side comparisons

**Best for**: Exploratory testing, demos

#### 2. Programmatic (pytest)

**CI/CD integration**:

```python
# tests/test_integration.py
import pytest
from google.adk.testing import evaluate_agent

def test_agent_performance():
    results = evaluate_agent(
        agent=my_agent,
        evalset="evalsets/customer_service.yaml",
        metrics=[
            "tool_trajectory_avg_score",
            "final_response_match_v2",
            "hallucinations_v1"
        ]
    )

    assert results["tool_trajectory_avg_score"] > 0.8
    assert results["final_response_match_v2"] > 0.9
    assert results["hallucinations_v1"] < 0.1
```

**Best for**: Automated testing, continuous integration

#### 3. CLI (`adk eval`)

**Command-line evaluation**:

```bash
adk eval \
  --agent my_agent \
  --evalset evalsets/customer_service.yaml \
  --metrics tool_trajectory_avg_score,hallucinations_v1 \
  --output results.json
```

**Best for**: Batch testing, scripting

### User Simulation

**Dynamic test case generation**:

```python
from google.adk.testing import UserSimulator

simulator = UserSimulator(
    scenario="frustrated_customer",
    personality="demanding",
    goal="get_refund"
)

# AI model generates realistic user prompts
user_prompts = simulator.generate_conversation(turns=5)

# Test agent against simulated user
results = test_agent_with_simulation(my_agent, user_prompts)
```

**Benefits**:
- Test edge cases automatically
- Generate diverse test scenarios
- Stress test agent behavior

### Trajectory Evaluation

**Verify intermediate steps**:

```python
# Not just final response, but entire reasoning path
test = AgentTest(
    user_input="Book a flight to NYC",
    expected_trajectory=[
        ("search_flights", {"destination": "NYC"}),
        ("check_user_preferences", {}),
        ("compare_prices", {"flights": "..."}),
        ("book_flight", {"flight_id": "..."})
    ]
)
```

**Why it matters**: Even if final output is correct, wrong reasoning path indicates fragile agent

---

## Multi-Agent Architecture

### Agent Collaboration Patterns

#### 1. Supervisor Pattern

```python
supervisor = Agent(
    name="supervisor",
    model="gemini-2.0-flash-001",
    instructions="Coordinate research and writing agents"
)

research_agent = Agent(name="researcher", ...)
writer_agent = Agent(name="writer", ...)

# Supervisor delegates tasks
runtime = Runtime(
    supervisor=supervisor,
    workers=[research_agent, writer_agent]
)
```

**Use case**: Hierarchical workflows with central coordination

#### 2. Peer-to-Peer Collaboration

```python
runtime = Runtime(
    agents=[agent1, agent2, agent3],
    communication="peer_to_peer"
)
```

**Use case**: Collaborative problem-solving without central coordinator

#### 3. Pipeline Pattern

```python
pipeline = Pipeline([
    ("research", research_agent),
    ("draft", writer_agent),
    ("review", editor_agent)
])
```

**Use case**: Sequential processing with specialized stages

### Inter-Agent Communication

ADK provides built-in messaging:

```python
# Agent 1 sends message to Agent 2
await agent1.send_message(
    to="agent2",
    message="I found these research papers...",
    attachments=[{"papers": papers_data}]
)

# Agent 2 receives and processes
@agent2.on_message
async def handle_message(message):
    papers = message.attachments["papers"]
    # Process papers...
```

---

## Tool Integration

### Native Tool Definition

```python
from google.adk.tools import Tool

@Tool(
    name="search_database",
    description="Search the customer database",
    parameters={
        "query": {"type": "string", "description": "Search query"},
        "limit": {"type": "integer", "default": 10}
    }
)
def search_database(query: str, limit: int = 10):
    # Implementation
    results = db.search(query, limit=limit)
    return {"results": results}
```

### LangChain Tool Integration

**Two-line integration**:

```python
from google.adk.tools import LangchainTool
from langchain_community.tools import YahooFinanceNewsTool

# Wrap LangChain tool
langchain_tool = YahooFinanceNewsTool()
adk_tool = LangchainTool(langchain_tool)

# Add to agent
agent.add_tool(adk_tool)
```

**Available LangChain tools** (100+):
- Yahoo Finance News
- Wikipedia Search
- Arxiv Research
- Google Search
- File System Operations
- And many more...

### CrewAI Tool Integration

```python
from google.adk.tools import CrewaiTool
from crewai_tools import ScrapeWebsiteTool

crewai_tool = ScrapeWebsiteTool()
adk_tool = CrewaiTool(crewai_tool)

agent.add_tool(adk_tool)
```

### Custom API Tools

```python
@Tool(name="weather_api")
async def get_weather(location: str):
    async with aiohttp.ClientSession() as session:
        async with session.get(f"https://api.weather.com/{location}") as resp:
            return await resp.json()
```

---

## Integration with Other Frameworks

### LangChain/LangGraph + ADK

**Use Case**: Leverage LangGraph orchestration with ADK multi-agent runtime

```python
from google.adk import Agent
from langchain.agents import create_react_agent
from google.adk.tools import LangchainTool

# LangGraph workflow as ADK tool
langgraph_workflow = create_langgraph_workflow()
adk_tool = LangchainTool(langgraph_workflow)

# Use in ADK agent
agent = Agent(
    name="orchestrator",
    model="gemini-2.0-flash-001",
    tools=[adk_tool]
)
```

**Tracing with LangSmith**:

```python
from langsmith.integrations.otel import configure

# Automatic tracing setup
configure()

# ADK agent calls are now traced in LangSmith
agent = Agent(name="my-agent", model="gemini-2.0-flash-001")
```

**Captured data**:
- Complete agent conversations
- Individual tool calls
- Gemini API requests/responses
- Session information

### A2A Protocol Support

ADK natively supports A2A (both are Google products):

```python
from google.adk.protocols import A2AClient

# Agent advertises capabilities via Agent Card
agent.register_capabilities({
    "name": "customer_service_agent",
    "description": "Handles customer inquiries",
    "tools": ["search_orders", "process_returns"],
    "modalities": ["text", "voice"]
})

# Discover and communicate with remote agents
remote_agent = A2AClient("https://remote-agent.example.com")
result = await remote_agent.execute_task("Search for order #12345")
```

### Parlant Integration

**Expected compatibility** (not explicitly documented):

Since both ADK and Parlant support standard tool interfaces, integration should work:

```python
# Parlant agent as ADK tool (theoretical)
parlant_agent = ParlantAgent(guidelines="...")
adk_tool = Tool.from_callable(parlant_agent.chat)

adk_agent.add_tool(adk_tool)
```

---

## Deployment & Production

### Containerization

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "-m", "google.adk.serve", "--agent", "my_agent"]
```

### Vertex AI Deployment

```python
from google.cloud import aiplatform

# Deploy to Vertex AI
aiplatform.init(project="my-project", location="us-central1")

endpoint = aiplatform.Endpoint.create(display_name="my-agent-endpoint")

model = aiplatform.Model.upload(
    display_name="my-agent",
    artifact_uri="gs://my-bucket/agent",
    serving_container_image_uri="gcr.io/my-project/adk-agent"
)

model.deploy(endpoint=endpoint)
```

### Monitoring & Observability

**Built-in integrations**:

- **AgentOps**: Agent-specific monitoring
- **Arize AX**: Model performance tracking
- **Phoenix**: LLM observability
- **W&B Weave**: Experiment tracking

```python
from google.adk.observability import configure_monitoring

configure_monitoring(
    provider="agentops",
    api_key="...",
    project="my-agent-project"
)
```

### Scaling

**Horizontal scaling**:

```python
# Multiple agent instances
runtime = Runtime(
    agents=[agent],
    replicas=5,  # 5 instances
    load_balancer="round_robin"
)
```

**Auto-scaling based on load**:

```python
runtime = Runtime(
    agents=[agent],
    auto_scale=True,
    min_replicas=2,
    max_replicas=10,
    target_qps=100  # Scale to maintain 100 QPS
)
```

---

## Resources

### Official Documentation

- **ADK Docs**: [https://google.github.io/adk-docs/](https://google.github.io/adk-docs/)
- **Get Started Guide**: [https://google.github.io/adk-docs/get-started/about/](https://google.github.io/adk-docs/get-started/about/)
- **Evaluation Guide**: [https://google.github.io/adk-docs/evaluate/](https://google.github.io/adk-docs/evaluate/)
- **Vertex AI Integration**: [https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/develop/adk](https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/develop/adk)

### Key Blog Posts

- [Google Developers Blog - ADK Announcement](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/)
- [Cloud Blog - Tools Make an Agent: From Zero to Assistant with ADK](https://cloud.google.com/blog/topics/developers-practitioners/tools-make-an-agent-from-zero-to-assistant-with-adk)
- [Cloud Blog - Build Multimodal Agents using Gemini, Langchain, and LangGraph](https://cloud.google.com/blog/products/ai-machine-learning/build-multimodal-agents-using-gemini-langchain-and-langgraph)

### Tutorials & Codelabs

- [Build and Evaluate BigQuery Agents using ADK](https://codelabs.developers.google.com/bigquery-adk-eval)
- [Build an AI Travel Assistant With Google ADK](https://www.codecademy.com/article/build-an-ai-travel-assistant-with-google-agent-development-kit-adk)
- [The Complete Guide to Google's ADK](https://www.siddharthbharath.com/the-complete-guide-to-googles-agent-development-kit-adk/)

### Comparison Articles

- [Google ADK vs LangGraph: Comprehensive Guide](https://medium.com/@ajayverma23/google-adk-vs-langgraph-a-comprehensive-blog-guide-eaceeb89d583)
- [Google ADK vs LangGraph: Which One Develops AI Agents Better](https://www.zenml.io/blog/google-adk-vs-langgraph)
- [Guide to Google Agent Development Kit](https://www.aalpha.net/blog/google-agent-development-kit-adk-for-multi-agent-applications/)

### Community

- **GitHub**: Issues and discussions at ADK repository
- **Stack Overflow**: Tag `google-adk`
- **Google Cloud Community**: Vertex AI forums

---

**Document Version**: 1.0
**Last Updated**: November 6, 2025
**ADK Version**: Latest (2025)
