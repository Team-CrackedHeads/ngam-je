# Agentic Framework Compatibility Analysis

## Executive Summary

This document analyzes the compatibility and integration potential of LangChain/LangGraph, Google ADK (Agent Development Kit), A2A (Agent-to-Agent Protocol), and Parlant for building multi-agent AI systems. It also evaluates whether external evaluation tools like Comet/Opik are necessary given Google ADK's built-in evaluation capabilities.

**Key Finding**: All frameworks are compatible and designed to work together, with LangChain/LangGraph integrating seamlessly with Google ADK, Parlant complementing LangGraph's workflow orchestration, and A2A enabling cross-framework agent communication.

---

## 1. Framework Overview

### 1.1 LangChain & LangGraph

**Purpose**: Agent orchestration and stateful workflow management

**Key Features (2025)**:
- **Stateful Graph Architecture**: Agents structured as graphs (not linear chains) where each node is a step and transitions depend on dynamic logic
- **Production-Ready Features**: Time-travel debugging, human-in-the-loop interrupts, fault tolerance
- **Memory Management**: Built-in conversation history and context persistence across sessions
- **Token-by-Token Streaming**: Real-time display of agent reasoning and actions
- **LangGraph Studio v2** (May 2025): Local execution without desktop app, trace investigation, dataset creation for evals, direct prompt updates via UI
- **LangGraph Pre-Builts**: Common architectures (Swarm, Supervisor, tool-calling agent) pre-configured
- **Open Agent Platform**: No-code agent builder with MCP tools, prompt customization, model selection, and multi-agent connections
- **1.0 Stability**: LangChain 1.0 and LangGraph 1.0 released with commitment to no breaking changes until 2.0

**Best For**: Complex, stateful agent systems requiring orchestration and workflow control

**Sources**:
- [LangChain Blog - Interrupt 2025 Recap](https://blog.langchain.com/interrupt-2025-recap/)
- [LangChain - LangGraph Overview](https://www.langchain.com/langgraph)
- [LangChain Blog - LangGraph 1.0 Release](https://blog.langchain.com/langchain-langgraph-1dot0/)

---

### 1.2 Google ADK (Agent Development Kit)

**Purpose**: Multi-agent application development with built-in evaluation

**Key Features**:
- **Multi-Agent Architecture**: Designed for systems with multiple independent AI agents that communicate and delegate tasks
- **Built-in Evaluation Framework**:
  - Test Files for unit testing during development
  - Evalset Files for integration testing with multiple complex sessions
  - 7 built-in evaluation metrics (tool trajectory, response matching, hallucination detection, safety)
- **Third-Party Integration**: Native support for LangChain, LlamaIndex, CrewAI via dedicated wrappers
- **LangChain Tool Support**: Two-line integration for LangChain tools via `LangchainTool` wrapper
- **Observability Integration**: AgentOps, Arize AX, Phoenix, W&B Weave support
- **Model Agnostic**: Supports LLMs from multiple providers

**Best For**: Multi-agent systems requiring robust evaluation and testing frameworks

**Sources**:
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Google Developers Blog - ADK Announcement](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/)
- [Google ADK - Evaluation Guide](https://google.github.io/adk-docs/evaluate/)
- [LangChain Docs - Trace with Google ADK](https://docs.langchain.com/langsmith/trace-with-google-adk)

---

### 1.3 A2A (Agent-to-Agent Protocol)

**Purpose**: Open standard for cross-vendor agent interoperability

**Launch**: April 9, 2025 by Google with 50+ technology partners

**Core Design Principles**:
1. **Agentic Capabilities**: Agents collaborate without shared memory, tools, or context
2. **Built on Existing Standards**: Uses HTTP, SSE, and JSON-RPC for easy IT infrastructure integration
3. **Security-First**: Enterprise-grade authentication and authorization matching OpenAPI standards
4. **Long-Running Task Support**: Handles quick tasks to multi-day research with real-time feedback
5. **Modality Agnostic**: Supports text, audio, and video streaming

**Technical Components**:
- **Capability Discovery**: Agents advertise abilities via JSON "Agent Cards"
- **Task Management**: Structured task objects with defined lifecycles
- **Collaboration**: Inter-agent messaging for context and status updates
- **User Experience Negotiation**: Content type negotiation (iframes, video, web forms)

**Ecosystem Partners** (50+):
- **Platform**: Atlassian, Box, Cohere, Intuit, LangChain, MongoDB, PayPal, Salesforce, SAP, ServiceNow, UKG, Workday
- **Service Providers**: Accenture, BCG, Capgemini, Cognizant, Deloitte, HCLTech, Infosys, KPMG, McKinsey, PwC, TCS, Wipro

**Availability**:
- Open-source draft on GitHub (google/A2A)
- Production-ready version planned for later in 2025

**Best For**: Enabling communication between agents from different vendors and frameworks

**Sources**:
- [Google Developers Blog - A2A Announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [ArXiv - Agent Interoperability Protocols Survey](https://arxiv.org/html/2505.02279v1)
- [Medium - Agentic AI Protocols](https://medium.com/@manavg/agentic-ai-protocols-mcp-a2a-and-acp-ea0200eac18b)

---

### 1.4 Parlant

**Purpose**: Conversation modeling engine for LLM agents with controlled behavior

**Key Features**:
- **Behavioral Guidelines**: Condition-action pairs with contextual matching
- **Journeys**: Defined customer journeys with specified agent responses at each step
- **Tool Use**: External API, data fetcher, and backend service attachment to interaction events
- **Domain Adaptation**: Domain-specific terminology teaching and personalized responses
- **Strict Mode**: Canned responses for 100% predictable output (compliance-critical situations)
- **Explainability**: Transparent audit trail showing which guidelines were active and why decisions were made
- **Guidelines-as-Code**: Version control, testing, and programmatic logic definition
- **Integrated Playground UI**: Rapid iteration with persistent session logs
- **Native SDKs**: Python and TypeScript support

**Best For**: Compliance-critical, open-ended, multi-topic conversations requiring strict business rules

**Integration with LangGraph**:
- **Complementary Strengths**: Parlant provides conversational coherence; LangGraph offers workflow orchestration
- **Tool Integration**: LangGraph can handle complex retrieval workflows inside Parlant tools
- **Use Case Guidance**:
  - LangGraph alone: Narrow, guided, workflow-like interactions
  - Parlant + LangGraph: Open-ended, multi-topic conversations with strict business rules

**Sources**:
- [Parlant Documentation](https://www.parlant.io/docs/quickstart/introduction/)
- [GitHub - Parlant Repository](https://github.com/emcie-co/parlant)
- [Medium - Mastra vs Parlant Comparison](https://hrshdg8.medium.com/mastra-vs-parlant-a-deep-dive-into-the-architectural-philosophies-of-modern-agentic-frameworks-a4a4497fdd4e)

---

## 2. Compatibility Matrix

| Framework Pair | Compatibility | Integration Method | Status |
|---------------|--------------|-------------------|--------|
| LangChain/LangGraph + Google ADK | ✅ Full | LangSmith OpenTelemetry tracing, `LangchainTool` wrapper | Production-ready |
| LangChain/LangGraph + A2A | ✅ Full | LangChain is official A2A partner | Draft spec available |
| Google ADK + A2A | ✅ Full | Both Google products, designed for interoperability | Production-ready |
| Parlant + LangGraph | ✅ Full | Parlant tools work within LangGraph workflow | Production-ready |
| Parlant + Google ADK | ✅ Expected | Both support standard tool interfaces | Not explicitly documented |
| All Four Together | ✅ Full | Stack compatible via standard protocols | Architecturally sound |

---

## 3. Integration Details

### 3.1 LangChain/LangGraph + Google ADK

**Integration Methods**:

1. **LangSmith Tracing**:
   - Requires: `langsmith>=0.4.26`
   - Setup: Environment variables (`LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`)
   - Automatic instrumentation via `configure()` from `langsmith.integrations.otel`
   - Captures: Agent conversations, tool calls, model interactions, session information

2. **LangChain Tool Wrapper**:
   ```python
   from google.adk.tools import LangchainTool
   from langchain_community.tools import YahooFinanceNewsTool

   # Two-line integration
   langchain_tool = YahooFinanceNewsTool()
   adk_tool = LangchainTool(langchain_tool)
   ```

3. **Containerized Deployment**:
   - LangChain + ADK logic can be containerized with Docker
   - Deploy to any environment with full compatibility

**Use Cases**:
- Building modular, composable multi-agent applications
- Leveraging existing LangChain tools within ADK agents
- Comprehensive tracing and observability for debugging

**Sources**:
- [LangChain Docs - Trace with Google ADK](https://docs.langchain.com/langsmith/trace-with-google-adk)
- [Medium - Multi-Agent Assistant with ADK & LangChain](https://medium.com/@pratiksworking/building-a-multi-agent-assistant-with-google-adk-langchain-crewai-b09d7c293488)

---

### 3.2 Parlant + LangGraph

**Integration Architecture**:

- **Parlant's Role**: Conversational coherence and precise control over agent interactions
- **LangGraph's Role**: Powerful workflow orchestration for complex retrieval and task management
- **Integration Pattern**: LangGraph handles complex retrieval workflows inside Parlant tools

**Decision Framework**:

| Scenario | Recommended Approach |
|----------|---------------------|
| Narrow, guided, workflow-like interactions | LangGraph alone |
| Open-ended, multi-topic conversations with strict business rules | Parlant + LangGraph |
| Compliance-sensitive, multi-turn interactions | Parlant + LangGraph |
| Simple task automation | LangGraph alone |

**Key Benefit**: Addresses LangGraph's limitation in open-ended, multi-topic, compliance-sensitive interactions by adding Parlant's conversation modeling layer

**Sources**:
- [Parlant Agentic Design Methodology](https://www.parlant.io/docs/production/agentic-design/)
- [DEV Community - Integrating LangGraph with AI Tools](https://dev.to/ciphernutz/how-i-integrate-langgraph-with-other-ai-tools-3578)

---

### 3.3 A2A Protocol Integration

**Universal Compatibility**:
- A2A is designed as an open standard for ALL agent frameworks
- LangChain is an official partner
- Google ADK natively supports A2A
- Any framework can implement A2A using standard HTTP, SSE, and JSON-RPC

**Communication Model**:
- **Client Agent**: Formulates tasks
- **Remote Agent**: Executes tasks
- **Agent Cards**: JSON-based capability advertisement
- **Task Objects**: Structured with defined lifecycles
- **Messaging**: Inter-agent context and status updates

**Benefits for Multi-Framework Systems**:
1. Agents from different frameworks can collaborate without shared infrastructure
2. No central orchestrator required for real-time collaboration
3. Stateful, long-running workflows with context retention
4. Multimodal communication (text, audio, video)
5. Cross-vendor interoperability

**Example Use Case** (from A2A announcement):
> A hiring manager's agent coordinates with specialized agents to source candidates matching job criteria, schedule interviews, and facilitate background checks—all through unified agent collaboration.

**Sources**:
- [Google Developers Blog - A2A Announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [ArXiv - AgentMaster Framework using A2A and MCP](https://arxiv.org/html/2507.21105v1)

---

## 4. Evaluation Tools Analysis

### 4.1 Google ADK Built-in Evaluation

**Capabilities**:

1. **Test Files** (Unit Testing):
   - Individual test cases for active development
   - Single session with one or more conversation turns
   - Fast execution for rapid iteration

2. **Evalset Files** (Integration Testing):
   - Multiple complex, multi-turn sessions
   - Requires paid Vertex Gen AI Evaluation Service API
   - Comprehensive testing for production readiness

3. **Seven Built-in Metrics**:
   - `tool_trajectory_avg_score`: Exact tool call sequence matching
   - `response_match_score`: ROUGE-1 similarity to reference responses
   - `final_response_match_v2`: LLM-judged semantic equivalence
   - `rubric_based_final_response_quality_v1`: Custom rubric assessment
   - `rubric_based_tool_use_quality_v1`: Tool usage quality evaluation
   - `hallucinations_v1`: Groundedness checking
   - `safety_v1`: Harmlessness assessment

4. **Three Evaluation Methods**:
   - **Web UI** (`adk web`): Interactive evaluation
   - **Programmatic** (pytest): CI/CD pipeline integration
   - **CLI** (`adk eval`): Direct command-line evaluation

5. **User Simulation**:
   - AI model dynamically generates user prompts
   - Test agent behavior in specific conversation scenarios

6. **Trajectory Evaluation**:
   - Expected intermediate tool use trajectory
   - Verification of tool calls for correct responses

**Limitations**:
- No mention of Comet/Opik or external evaluation platform integration
- Observability integrations (AgentOps, Arize, Phoenix, W&B Weave) focus on monitoring, not evaluation criteria

---

### 4.2 Comet Opik

**Overview**: End-to-end open-source LLM evaluation platform

**Key Features**:

1. **Tracing & Observability**:
   - Record, sort, search every step of LLM app execution
   - Nested call capture in complex workflows
   - Distributed tracing with non-LLM step support

2. **Evaluation Capabilities**:
   - Pre-configured evaluation metrics
   - Custom metric definition via SDK
   - Built-in LLM judges for hallucination detection, factuality, moderation
   - Human, automated, and LLM-as-a-judge evaluations

3. **Testing**:
   - PyTest-based LLM unit tests
   - Reliable performance baselines
   - Comprehensive test suites for entire LLM pipelines

4. **Performance**:
   - Non-intrusive design (decorators/callbacks, not proxy)
   - Virtually zero latency impact
   - Better automated scoring than competitors

5. **Integration**:
   - OpenAI, LangChain, LlamaIndex support
   - Minimal configuration (few lines of code)

6. **Open Source**:
   - True open-source with full feature set free
   - Local execution available
   - GitHub repository: [comet-ml/opik](https://github.com/comet-ml/opik)

**Comparison with Google ADK**:

| Feature | Google ADK | Comet Opik |
|---------|-----------|-----------|
| Built-in Metrics | 7 standard metrics | Pre-configured + custom |
| LLM Judges | Yes (semantic, rubric) | Yes (hallucination, factuality, moderation) |
| CI/CD Integration | pytest support | pytest-based |
| Observability | Limited (external tools) | Comprehensive tracing |
| Custom Metrics | Rubric-based | Full SDK support |
| Open Source | ADK is open, Vertex API paid | Fully open-source |
| Performance Impact | Not documented | Virtually zero latency |
| Latency Overhead | Unknown | Minimal (no proxy) |

---

### 4.3 Recommendation: Do You Need Comet/Opik?

**Use Google ADK Built-in Evaluation ONLY if**:
- Your evaluation needs are covered by the 7 built-in metrics
- You're primarily testing tool trajectories and response matching
- You're already using Vertex AI and can afford the Evaluation Service API
- You don't need deep observability beyond basic monitoring

**Add Comet/Opik if you need**:
- ✅ **More comprehensive observability**: Deep tracing with nested call capture
- ✅ **Advanced custom metrics**: Beyond rubric-based evaluation
- ✅ **Better automated scoring**: Opik's strength vs. competitors
- ✅ **Fine-grained, code-based control**: SDK for custom evaluation logic
- ✅ **Production monitoring**: Real-time dashboards and alerts
- ✅ **Cost considerations**: Free open-source vs. paid Vertex API
- ✅ **Multi-framework support**: If using LangChain, LlamaIndex, etc. alongside ADK
- ✅ **Hallucination/factuality detection**: Specialized LLM judges

**Recommended Architecture**:
```
LangChain/LangGraph + Google ADK (development & orchestration)
    ↓
Parlant (conversation modeling for compliance-critical flows)
    ↓
A2A Protocol (cross-agent communication)
    ↓
Comet Opik (comprehensive evaluation & production monitoring)
```

**Sources**:
- [Google ADK - Evaluation Documentation](https://google.github.io/adk-docs/evaluate/)
- [Comet - Opik Product Page](https://www.comet.com/site/products/opik/)
- [GitHub - Opik Repository](https://github.com/comet-ml/opik)
- [Comet Blog - LLM Evaluation Frameworks Comparison](https://www.comet.com/site/blog/llm-evaluation-frameworks/)

---

## 5. Recommended Architecture

### 5.1 Full Stack Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│                                                                   │
│  ┌─────────────────┐         ┌──────────────────┐               │
│  │  LangGraph      │◄────────┤   Parlant        │               │
│  │  (Orchestration)│         │   (Conversation  │               │
│  │                 │         │    Modeling)     │               │
│  └────────┬────────┘         └──────────────────┘               │
│           │                                                       │
│           │                                                       │
│  ┌────────▼────────────────────────────────────────────────┐    │
│  │           Google ADK (Multi-Agent Runtime)              │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │  Agent 1  │  Agent 2  │  Agent 3  │  Agent N     │   │    │
│  │  └──────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │
            ┌───────────────┼──────────────┐
            │               │              │
    ┌───────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
    │     A2A      │ │ LangSmith │ │   Comet    │
    │   Protocol   │ │  (Tracing)│ │   Opik     │
    │ (Inter-Agent)│ │           │ │ (Evaluation)│
    └──────────────┘ └───────────┘ └────────────┘
```

### 5.2 Component Responsibilities

| Component | Responsibility | When to Use |
|-----------|---------------|-------------|
| **LangGraph** | Workflow orchestration, stateful agent logic | Complex multi-step processes, tool-calling agents |
| **Parlant** | Conversation modeling, compliance controls | Customer-facing interactions, regulated industries |
| **Google ADK** | Multi-agent runtime, tool integration | Systems with multiple specialized agents |
| **A2A Protocol** | Cross-vendor agent communication | Integrating agents from different frameworks/vendors |
| **LangSmith** | Development tracing and debugging | Active development, troubleshooting |
| **Comet Opik** | Production evaluation and monitoring | Pre-deployment testing, production monitoring |

### 5.3 Implementation Phases

**Phase 1: Foundation**
1. Set up Google ADK for multi-agent runtime
2. Integrate LangChain tools via `LangchainTool` wrapper
3. Configure LangSmith tracing for development visibility

**Phase 2: Orchestration**
4. Implement LangGraph for complex workflow orchestration
5. Add Parlant for customer-facing, compliance-critical flows
6. Test integration between LangGraph and Parlant tools

**Phase 3: Interoperability**
7. Implement A2A protocol for cross-agent communication
8. Enable agent discovery via Agent Cards
9. Test multi-vendor agent collaboration scenarios

**Phase 4: Production Readiness**
10. Set up Comet Opik for comprehensive evaluation
11. Define custom metrics beyond ADK's built-in 7
12. Establish CI/CD pipeline with pytest-based tests
13. Configure production monitoring dashboards

---

## 6. Key Takeaways

### ✅ Compatibility Confirmed

All frameworks (LangChain/LangGraph, Google ADK, A2A, Parlant) are compatible and designed to work together:

1. **LangChain/LangGraph + Google ADK**: Production-ready with two-line tool integration and comprehensive tracing
2. **Parlant + LangGraph**: Complementary strengths for open-ended, compliance-sensitive conversations
3. **A2A Protocol**: Universal standard enabling all frameworks to communicate
4. **Full Stack**: All four can be used together in a single architecture

### 📊 Evaluation Strategy

**Google ADK built-in evaluation is sufficient for**:
- Basic development and testing
- Standard tool trajectory and response matching
- Projects with limited custom evaluation needs

**Add Comet/Opik when you need**:
- Comprehensive observability with deep tracing
- Advanced custom metrics and LLM judges
- Production monitoring with real-time dashboards
- Cost-effective open-source solution vs. paid Vertex API

### 🎯 Recommended Approach

**For Most Projects**: Use Google ADK built-in evaluation during development, add Comet/Opik for production monitoring

**For Enterprise/Compliance-Critical Projects**: Full stack with LangGraph + Parlant + Google ADK + A2A + Comet Opik

**For Simple Projects**: LangGraph + Google ADK (skip Parlant if no compliance needs, skip A2A if single-vendor)

---

## 7. Additional Resources

### Official Documentation
- [LangChain Documentation](https://docs.langchain.com/)
- [LangGraph Documentation](https://www.langchain.com/langgraph)
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [A2A Protocol GitHub](https://github.com/google/A2A)
- [Parlant Documentation](https://www.parlant.io/docs/)
- [Comet Opik Documentation](https://www.comet.com/docs/opik/)

### Key Blog Posts
- [Google Developers Blog - ADK Announcement](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/)
- [Google Developers Blog - A2A Announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [LangChain Blog - LangGraph 1.0 Release](https://blog.langchain.com/langchain-langgraph-1dot0/)
- [LangChain Blog - Interrupt 2025 Recap](https://blog.langchain.com/interrupt-2025-recap/)

### GitHub Repositories
- [google/adk](https://github.com/google/adk) - Google Agent Development Kit
- [google/A2A](https://github.com/google/A2A) - Agent-to-Agent Protocol
- [emcie-co/parlant](https://github.com/emcie-co/parlant) - Parlant Framework
- [comet-ml/opik](https://github.com/comet-ml/opik) - Opik Evaluation Platform

### Academic Papers
- [ArXiv - Survey of Agent Interoperability Protocols](https://arxiv.org/html/2505.02279v1)
- [ArXiv - AgentMaster: Multi-Agent Framework using A2A and MCP](https://arxiv.org/html/2507.21105v1)

---

**Document Version**: 1.0
**Last Updated**: November 6, 2025
**Research Date**: November 6, 2025
