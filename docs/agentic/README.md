# Agentic AI Framework Documentation

## Overview

This directory contains comprehensive research and analysis on modern agentic AI frameworks, protocols, and evaluation tools for building production-ready multi-agent systems.

**Research Date**: November 6, 2025

---

## Table of Contents

1. [Compatibility Analysis](#compatibility-analysis)
2. [Framework Documentation](#framework-documentation)
3. [Protocol Documentation](#protocol-documentation)
4. [Evaluation Tools](#evaluation-tools)
5. [Quick Reference](#quick-reference)

---

## Compatibility Analysis

**File**: [compatibility-analysis.md](./compatibility-analysis.md)

**Executive Summary**: Comprehensive analysis confirming that LangChain/LangGraph, Google ADK, A2A Protocol, and Parlant are fully compatible and designed to work together.

**Key Findings**:
- ✅ All frameworks are compatible
- ✅ LangChain/LangGraph integrates seamlessly with Google ADK via two-line tool wrapper
- ✅ Parlant complements LangGraph for compliance-critical conversations
- ✅ A2A Protocol enables cross-vendor agent communication
- ✅ Comet Opik recommended for comprehensive evaluation and production monitoring

**Topics Covered**:
- Framework overview and features
- Compatibility matrix with integration methods
- Detailed integration guides
- Evaluation strategy (ADK vs. Opik)
- Recommended architecture for full-stack systems
- Implementation phases

**When to Read**: Start here for high-level understanding and architectural decisions.

---

## Framework Documentation

### LangChain & LangGraph

**File**: [langchain-langgraph.md](./langchain-langgraph.md)

**Summary**: Production-ready frameworks for building AI agents and multi-agent systems, both reaching 1.0 milestones in 2025.

**Key Features**:
- **LangGraph 1.0**: Stateful graph architecture, time-travel debugging, human-in-the-loop, fault tolerance
- **LangGraph Studio v2** (May 2025): Local execution, trace investigation, dataset creation
- **LangGraph Pre-Builts**: Swarm, Supervisor, tool-calling agent patterns
- **Open Agent Platform**: No-code agent builder
- **LangSmith Observability**: Agent-specific metrics, trajectory tracking

**Use Cases**:
- Complex multi-agent systems
- Stateful workflows with memory
- Production applications requiring reliability
- Adaptive agents with self-correcting behavior

**When to Read**: When implementing agent orchestration and workflow management.

---

### Google ADK (Agent Development Kit)

**File**: [google-adk.md](./google-adk.md)

**Summary**: Python framework for multi-agent AI applications with built-in evaluation, designed for production deployments.

**Key Features**:
- **Multi-Agent Architecture**: Purpose-built for systems with multiple independent agents
- **Built-in Evaluation**: 7 metrics (tool trajectory, response matching, hallucination detection, safety)
- **Model Agnostic**: Supports Google, Anthropic, OpenAI, Cohere, and open-source models
- **Third-Party Integration**: Native LangChain, LlamaIndex, CrewAI support via wrappers
- **LangSmith Tracing**: Automatic OpenTelemetry instrumentation

**Evaluation Methods**:
1. Test Files (unit testing)
2. Evalset Files (integration testing)
3. User Simulation (dynamic test generation)

**When to Read**: When building multi-agent systems requiring robust evaluation and testing.

---

### Parlant

**File**: [parlant.md](./parlant.md)

**Summary**: Open-source conversation modeling engine for building reliable, controlled AI agents with predictable behavior.

**Key Features**:
- **Behavioral Guidelines**: Condition-action pairs with contextual matching
- **Journeys**: Defined customer paths with stage-by-stage responses
- **Strict Mode**: 100% predictable canned responses for compliance
- **Explainability**: Transparent audit trail showing active guidelines and decisions
- **Guidelines-as-Code**: Version control, testing, programmatic logic

**Integration with LangGraph**:
- Parlant provides conversational coherence
- LangGraph handles workflow orchestration
- Combined for open-ended, compliance-sensitive conversations

**Use Cases**:
- Healthcare patient triage (HIPAA compliance)
- Financial services support (SEC/FINRA compliance)
- E-commerce customer service (return policies)
- Government services (ADA compliance, multi-language)

**When to Read**: When building compliance-critical conversational agents.

---

## Protocol Documentation

### A2A (Agent-to-Agent) Protocol

**File**: [a2a-protocol.md](./a2a-protocol.md)

**Summary**: Open standard announced by Google (April 9, 2025) enabling AI agents from different vendors and frameworks to collaborate securely.

**Design Principles**:
1. **Agentic Capabilities**: Agents collaborate without shared memory/tools/context
2. **Existing Standards**: Built on HTTP, SSE, JSON-RPC
3. **Security-First**: Enterprise-grade OAuth 2.0, TLS 1.3, RBAC
4. **Long-Running Tasks**: Multi-day workflows with checkpointing
5. **Modality Agnostic**: Text, audio, video streaming

**Technical Components**:
- **Agent Cards**: JSON capability advertisement
- **Task Objects**: Structured task lifecycles
- **Collaboration**: Inter-agent messaging
- **UX Negotiation**: Content type negotiation (iframes, video, forms)

**Ecosystem**: 50+ partners including Atlassian, Box, Cohere, LangChain, MongoDB, Salesforce, SAP, ServiceNow, Workday

**Status**: Draft specification available (GitHub: google/A2A), production-ready v1.0 planned late 2025

**When to Read**: When integrating agents from different vendors or enabling cross-framework communication.

---

## Evaluation Tools

### Google ADK vs Comet Opik

**File**: [evaluation-tools.md](./evaluation-tools.md)

**Summary**: Comprehensive comparison of Google ADK's built-in evaluation vs. Comet Opik open-source platform.

**Google ADK Built-in**:
- 7 built-in metrics
- Test Files (unit testing)
- Evalset Files (integration testing via paid Vertex API)
- User simulation
- Basic observability

**Comet Opik**:
- Unlimited custom metrics via SDK
- Comprehensive nested tracing (distributed)
- LLM judges (hallucination, factuality, moderation)
- Production monitoring with dashboards and alerts
- Cost tracking
- Human evaluation support
- Zero latency impact (no proxy)
- Fully open-source

**Recommendation**:
- **ADK alone**: Simple projects, basic evaluation needs, Google Cloud-native
- **Opik added**: Comprehensive observability, production monitoring, custom metrics, cost tracking
- **Hybrid (recommended)**: ADK for development, Opik for production
- **Opik only**: Unified platform, full control, multi-framework support

**When to Read**: When planning evaluation strategy and production monitoring architecture.

---

## Quick Reference

### Compatibility Matrix

| Framework Pair | Compatible | Integration | Status |
|---------------|-----------|-------------|--------|
| LangChain/LangGraph + Google ADK | ✅ | LangSmith tracing, `LangchainTool` wrapper | Production |
| LangChain/LangGraph + A2A | ✅ | LangChain is A2A partner | Draft spec |
| Google ADK + A2A | ✅ | Both Google products | Production |
| Parlant + LangGraph | ✅ | Parlant tools in LangGraph workflow | Production |
| All Four Together | ✅ | Via standard protocols | Architecturally sound |

### When to Use Each Framework

| Framework | Best For |
|-----------|----------|
| **LangChain** | Simple agents, rapid prototyping, tool-calling workflows |
| **LangGraph** | Complex multi-agent systems, stateful workflows, production reliability |
| **Google ADK** | Multi-agent runtime, built-in evaluation, Google Cloud deployments |
| **Parlant** | Compliance-critical conversations, behavioral control, regulated industries |
| **A2A Protocol** | Cross-vendor agent communication, interoperability, multi-framework systems |

### Recommended Full-Stack Architecture

```
User Interaction
    ↓
Parlant (Conversation Modeling)
    ↓
LangGraph (Workflow Orchestration)
    ↓
Google ADK (Multi-Agent Runtime)
    ↓
A2A Protocol (Cross-Agent Communication)
    ↓
Comet Opik (Evaluation & Monitoring)
```

**Component Responsibilities**:
- **LangGraph**: Workflow orchestration, stateful agent logic
- **Parlant**: Conversation modeling, compliance controls
- **Google ADK**: Multi-agent runtime, tool integration
- **A2A Protocol**: Cross-vendor agent communication
- **Comet Opik**: Production evaluation and monitoring

### Evaluation Strategy

**Development Phase**:
- Google ADK Test Files for rapid unit testing
- Fast feedback loop

**Pre-Production Phase**:
- Comet Opik comprehensive evaluation
- Establish baselines
- Regression tests

**Production Phase**:
- Comet Opik monitoring for real-time observability
- Alerts for anomalies
- Cost tracking

---

## Key Takeaways

### ✅ Compatibility Confirmed

All frameworks (LangChain/LangGraph, Google ADK, A2A, Parlant) are compatible:
1. LangChain/LangGraph + Google ADK: Production-ready with two-line integration
2. Parlant + LangGraph: Complementary strengths for compliance-sensitive flows
3. A2A Protocol: Universal standard enabling cross-framework communication
4. Full Stack: All four work together in single architecture

### 📊 Evaluation Strategy

**Google ADK built-in is sufficient for**:
- Basic development and testing
- Standard tool trajectory and response matching
- Limited custom evaluation needs

**Add Comet/Opik for**:
- Comprehensive observability with deep tracing
- Production monitoring with real-time dashboards
- Advanced custom metrics and LLM judges
- Cost-effective open-source alternative

### 🎯 Recommended Approaches

**For Most Projects**:
- Use Google ADK built-in evaluation during development
- Add Comet/Opik for production monitoring

**For Enterprise/Compliance-Critical**:
- Full stack: LangGraph + Parlant + Google ADK + A2A + Comet Opik

**For Simple Projects**:
- LangGraph + Google ADK (skip Parlant if no compliance needs)

---

## Additional Resources

### Official Documentation

- **LangChain**: [https://docs.langchain.com/](https://docs.langchain.com/)
- **LangGraph**: [https://www.langchain.com/langgraph](https://www.langchain.com/langgraph)
- **Google ADK**: [https://google.github.io/adk-docs/](https://google.github.io/adk-docs/)
- **A2A Protocol**: [https://github.com/google/A2A](https://github.com/google/A2A)
- **Parlant**: [https://www.parlant.io/docs/](https://www.parlant.io/docs/)
- **Comet Opik**: [https://www.comet.com/docs/opik/](https://www.comet.com/docs/opik/)

### GitHub Repositories

- [langchain-ai/langchain](https://github.com/langchain-ai/langchain)
- [google/adk](https://github.com/google/adk)
- [google/A2A](https://github.com/google/A2A)
- [emcie-co/parlant](https://github.com/emcie-co/parlant)
- [comet-ml/opik](https://github.com/comet-ml/opik)

### Research Papers

- [Survey of Agent Interoperability Protocols (MCP, ACP, A2A, ANP)](https://arxiv.org/html/2505.02279v1)
- [AgentMaster: Multi-Agent Framework using A2A and MCP](https://arxiv.org/html/2507.21105v1)

---

## Document Information

**Version**: 1.0
**Last Updated**: November 6, 2025
**Research Conducted**: November 6, 2025
**Maintained By**: Development Team

---

## Questions & Support

For questions about these frameworks and tools:

1. **Framework-Specific**: Consult official documentation linked above
2. **Integration Issues**: Check compatibility matrix and integration sections
3. **Architecture Decisions**: Review compatibility-analysis.md recommendations
4. **Evaluation Strategy**: See evaluation-tools.md for detailed guidance

---

**Note**: This research reflects the state of frameworks and protocols as of November 2025. As these are rapidly evolving technologies, always verify current documentation for the latest features and compatibility information.
