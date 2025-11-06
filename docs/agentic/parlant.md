# Parlant: Comprehensive Guide to Controlled AI Agents

## Table of Contents
1. [Introduction](#introduction)
2. [Core Features](#core-features)
3. [Reliability & Control](#reliability--control)
4. [Integration with LangGraph](#integration-with-langgraph)
5. [Use Cases](#use-cases)
6. [Getting Started](#getting-started)
7. [Best Practices](#best-practices)
8. [Resources](#resources)

---

## Introduction

**Parlant** is an open-source conversation modeling engine designed for building reliable, production-ready AI agents with controlled, predictable behavior. Unlike traditional agent frameworks that focus on workflow orchestration, Parlant specializes in ensuring agents follow business rules, compliance requirements, and behavioral guidelines consistently.

**Key Value Proposition**: LLM agents built for control, designed for real-world use, deployed in minutes.

**Tagline**: "Beyond the Prompt: Redefining AI Agent Reliability"

---

## Core Philosophy

### The Reliability Problem

Traditional LLM agents face a critical challenge:
- Prompts alone are insufficient for reliable behavior
- LLMs are probabilistic and can produce unexpected outputs
- Compliance-critical scenarios require 100% predictability
- Multi-topic conversations lose coherence over time

### Parlant's Solution

**Guidelines-as-Code**: Define agent behavior programmatically with version control, testing, and precise control

```
Traditional Approach:          Parlant Approach:
┌─────────────────┐           ┌─────────────────────────┐
│  System Prompt  │           │   Behavioral Guidelines │
│   (text blob)   │           │   (condition-action)    │
│                 │           │                         │
│  - Unreliable   │           │  - Reliable             │
│  - Hard to test │           │  - Testable             │
│  - No version   │           │  - Version controlled   │
│    control      │           │  - Explainable          │
└─────────────────┘           └─────────────────────────┘
```

---

## Core Features

### 1. Behavioral Guidelines

**Definition**: Condition-action pairs that define agent behavior contextually

**Structure**:
```python
from parlant import Guideline

# Define guideline
guideline = Guideline(
    name="return_policy_guideline",
    condition="user asks about return policy",
    action="respond with 30-day return policy, receipt required",
    priority=10
)
```

**How it works**:
1. User message is analyzed
2. Parlant matches relevant guidelines contextually (not exact matching)
3. Highest priority guidelines are activated
4. Agent response follows activated guidelines

**Benefits**:
- **Context-aware**: Not brittle keyword matching
- **Prioritized**: Handle conflicting guidelines gracefully
- **Composable**: Combine multiple guidelines
- **Testable**: Verify guideline activation in tests

**Example Guideline Set**:
```python
guidelines = [
    Guideline(
        name="greeting",
        condition="user greets agent",
        action="greet warmly and ask how to help",
        priority=5
    ),
    Guideline(
        name="angry_customer",
        condition="user is frustrated or angry",
        action="acknowledge frustration, apologize, offer immediate help",
        priority=15  # Higher priority overrides greeting
    ),
    Guideline(
        name="refund_request",
        condition="user requests refund",
        action="check order eligibility, explain process, initiate if eligible",
        priority=10
    ),
    Guideline(
        name="out_of_policy_refund",
        condition="user requests refund outside 30-day window",
        action="explain policy, offer store credit or exchange instead",
        priority=12  # More specific, higher priority
    )
]
```

### 2. Journeys

**Definition**: Defined customer journeys specifying how agents respond at each step

**Journey Stages**:
```python
from parlant import Journey, Stage

onboarding_journey = Journey(
    name="customer_onboarding",
    stages=[
        Stage(
            name="welcome",
            guidelines=["greeting", "explain_process"],
            next_stages=["information_collection"]
        ),
        Stage(
            name="information_collection",
            guidelines=["request_email", "request_preferences"],
            next_stages=["account_creation", "welcome"]  # Can loop back
        ),
        Stage(
            name="account_creation",
            guidelines=["create_account", "send_confirmation"],
            next_stages=["completion"]
        ),
        Stage(
            name="completion",
            guidelines=["thank_user", "next_steps"],
            next_stages=[]  # Terminal stage
        )
    ]
)
```

**Benefits**:
- **Structured conversations**: Clear progression through stages
- **Consistent experiences**: Every user follows the same journey
- **Easy debugging**: Know exactly which stage caused issues
- **Compliance**: Ensure required steps aren't skipped

### 3. Tool Use

**Definition**: Attach external APIs, data fetchers, or backend services to specific interaction events

**Tool Integration**:
```python
from parlant import Tool

# Define tool
@Tool(name="search_orders")
def search_orders(customer_email: str, order_id: str = None):
    """Search customer orders"""
    results = database.query(
        "SELECT * FROM orders WHERE email = ?",
        customer_email
    )
    if order_id:
        results = [r for r in results if r.id == order_id]
    return {"orders": results}

# Attach to guideline
guideline = Guideline(
    name="order_lookup",
    condition="user wants to check order status",
    action="use search_orders tool, then explain status",
    tools=["search_orders"]
)
```

**Event-Driven Tool Execution**:
```python
# Tool triggered by conversation event
agent.on_event(
    event="user_mentions_order",
    action=lambda ctx: search_orders(ctx.user.email)
)
```

**Benefits**:
- **Contextual tool use**: Tools called only when relevant
- **Guardrails**: Define when tools should/shouldn't be used
- **Auditability**: Track all tool invocations

### 4. Domain Adaptation

**Definition**: Teach agents domain-specific terminology and craft personalized responses

**Custom Domain Knowledge**:
```python
from parlant import DomainKnowledge

# Healthcare domain
healthcare_knowledge = DomainKnowledge(
    domain="healthcare",
    terminology={
        "EHR": "Electronic Health Record",
        "ICD-10": "International Classification of Diseases, 10th Revision",
        "HIPAA": "Health Insurance Portability and Accountability Act"
    },
    response_style={
        "tone": "professional, empathetic",
        "formality": "formal",
        "jargon_level": "moderate"  # Balance between technical and accessible
    },
    compliance_rules=[
        "Never share patient information without verification",
        "Always use secure channels for sensitive data",
        "Document all interactions for HIPAA compliance"
    ]
)

agent = Agent(
    guidelines=guidelines,
    domain_knowledge=healthcare_knowledge
)
```

**Personalization**:
```python
# User-specific adaptation
user_profile = {
    "expertise_level": "beginner",
    "preferred_language": "en-US",
    "communication_style": "detailed_explanations"
}

agent.adapt_to_user(user_profile)
```

---

## Reliability & Control

### Strict Mode: Canned Responses

**Purpose**: 100% predictable output for compliance-critical situations

**How it works**:
- Define exact response templates
- Agent MUST return one of the predefined responses
- No hallucination possible
- Full control over agent output

**Example**:
```python
from parlant import StrictGuideline

strict_guideline = StrictGuideline(
    name="data_breach_response",
    condition="user reports suspected data breach",
    canned_responses=[
        "I'm escalating this to our security team immediately. You'll receive a call within 15 minutes from a security specialist. Case ID: {case_id}",
        "Thank you for reporting this. I've created an urgent security ticket (ID: {case_id}) and our team will contact you at {contact_method} within 15 minutes."
    ],
    variables=["case_id", "contact_method"],
    strict=True  # Must use one of these responses
)
```

**When to use Strict Mode**:
- Legal/compliance statements
- Security incident responses
- Financial transaction confirmations
- Medical advice disclaimers
- Regulatory disclosures

**Benefits**:
- **Guaranteed compliance**: No risk of off-policy responses
- **Liability protection**: Legal review of exact wording
- **Consistency**: Same message every time
- **Audit-friendly**: Predefined responses easily reviewed

### Explainability

**Purpose**: Transparent audit trail for debugging and compliance

**What's captured**:
```python
# Every interaction includes
{
    "conversation_id": "conv_abc123",
    "turn_id": "turn_001",
    "user_message": "I need to return this product",
    "active_guidelines": [
        {
            "name": "return_policy_guideline",
            "priority": 10,
            "condition_match_score": 0.95,
            "activated": true
        },
        {
            "name": "greeting",
            "priority": 5,
            "condition_match_score": 0.30,
            "activated": false
        }
    ],
    "tools_used": [
        {
            "name": "search_orders",
            "input": {"email": "user@example.com"},
            "output": {"orders": [...]},
            "timestamp": "2025-11-06T10:00:00Z"
        }
    ],
    "agent_response": "I can help you with that return...",
    "decision_reason": "Activated return_policy_guideline due to high match on user intent"
}
```

**Debugging Example**:
```python
# Why did agent respond this way?
session = agent.get_session("conv_abc123")
turn = session.get_turn("turn_001")

print(f"Active guidelines: {turn.active_guidelines}")
print(f"Decision reason: {turn.decision_reason}")
print(f"Tools used: {turn.tools_used}")

# Invaluable for debugging!
```

**Compliance Benefits**:
- Explain agent decisions to regulators
- Audit trail for sensitive industries (healthcare, finance)
- Root cause analysis for errors
- Training data for improving guidelines

---

## Integration with LangGraph

### Complementary Strengths

**LangGraph**: Workflow orchestration, complex retrieval, task management

**Parlant**: Conversational coherence, behavioral control, compliance

**Together**: Powerful multi-agent systems with both flexibility and reliability

### Architecture Pattern

```
┌──────────────────────────────────────────────────────┐
│                 User Interaction                      │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │       Parlant Agent           │
        │  (Conversation Modeling)      │
        │                               │
        │  - Guidelines                 │
        │  - Journeys                   │
        │  - Strict Mode                │
        │  - Explainability             │
        └───────────────┬───────────────┘
                        │
                        │ Delegates complex tasks
                        ▼
        ┌───────────────────────────────┐
        │     LangGraph Workflow        │
        │   (Orchestration Engine)      │
        │                               │
        │  - Multi-step research        │
        │  - Data retrieval             │
        │  - Tool coordination          │
        │  - State management           │
        └───────────────┬───────────────┘
                        │
                        │ Returns results
                        ▼
        ┌───────────────────────────────┐
        │       Parlant Agent           │
        │  (Formats & Delivers)         │
        └───────────────────────────────┘
```

### Integration Code Example

```python
from parlant import Agent, Guideline, Tool
from langgraph import StateGraph

# LangGraph workflow
def create_research_workflow():
    workflow = StateGraph()
    workflow.add_node("search", search_node)
    workflow.add_node("analyze", analyze_node)
    workflow.add_node("synthesize", synthesize_node)
    workflow.add_edge("search", "analyze")
    workflow.add_edge("analyze", "synthesize")
    return workflow.compile()

# Parlant tool wrapping LangGraph
@Tool(name="deep_research")
def deep_research(topic: str):
    """Perform comprehensive research using LangGraph workflow"""
    workflow = create_research_workflow()
    result = workflow.invoke({"topic": topic})
    return result

# Parlant agent with LangGraph tool
agent = Agent(
    name="research_assistant",
    guidelines=[
        Guideline(
            name="research_request",
            condition="user requests in-depth research",
            action="use deep_research tool, summarize findings clearly",
            tools=["deep_research"]
        )
    ]
)
```

### Decision Framework

**Use LangGraph alone**:
- Narrow, guided, workflow-like interactions
- Backend automation (no user interaction)
- Simple task chains

**Use Parlant alone**:
- Simple conversations with strict guidelines
- Compliance-critical customer interactions
- No complex multi-step workflows needed

**Use Parlant + LangGraph**:
- Open-ended, multi-topic conversations
- Strict business rules + complex workflows
- Compliance-sensitive with advanced capabilities
- Production systems requiring both control and power

**Example Scenarios**:

| Scenario | Recommendation |
|----------|---------------|
| Customer service chatbot (banking) | Parlant + LangGraph |
| Backend data processing pipeline | LangGraph alone |
| Simple FAQ bot | Parlant alone |
| Healthcare patient triage | Parlant + LangGraph |
| Code review automation | LangGraph alone |
| Regulated industry support (legal, finance) | Parlant + LangGraph |

---

## Use Cases

### 1. Healthcare Patient Triage

**Requirements**:
- HIPAA compliance (strict privacy rules)
- Consistent triage process
- Explainable decisions
- Emergency escalation protocols

**Parlant Solution**:
```python
triage_guidelines = [
    StrictGuideline(
        name="emergency_response",
        condition="patient reports chest pain, difficulty breathing, or stroke symptoms",
        canned_responses=["This is a medical emergency. Please call 911 immediately or go to your nearest emergency room."],
        strict=True,
        priority=100  # Highest priority
    ),
    Guideline(
        name="symptom_collection",
        condition="patient describes symptoms",
        action="ask clarifying questions following clinical protocol",
        priority=10
    ),
    Guideline(
        name="privacy_protection",
        condition="any interaction",
        action="never share patient information, always verify identity",
        priority=50
    )
]

healthcare_agent = Agent(
    name="triage_nurse",
    guidelines=triage_guidelines,
    domain_knowledge=healthcare_knowledge,
    strict_mode=True  # Enable for critical scenarios
)
```

**Benefits**:
- Guaranteed emergency protocol compliance
- Full audit trail for medical records
- Consistent patient experiences
- HIPAA-compliant explainability

### 2. Financial Services Customer Support

**Requirements**:
- Regulatory compliance (SEC, FINRA)
- Transaction verification protocols
- Fraud detection escalation
- Disclosure requirements

**Parlant Solution**:
```python
finance_guidelines = [
    StrictGuideline(
        name="investment_advice_disclaimer",
        condition="user asks for investment recommendations",
        canned_responses=[
            "I can provide information, but this is not financial advice. Please consult with a licensed financial advisor. Past performance does not guarantee future results."
        ],
        strict=True
    ),
    Guideline(
        name="fraud_detection",
        condition="suspicious activity indicators",
        action="escalate to fraud team immediately, lock account if necessary",
        priority=90,
        tools=["check_fraud_patterns", "lock_account"]
    )
]
```

### 3. E-commerce Customer Service

**Requirements**:
- Return policy compliance
- Escalation workflows
- Personalized support
- Multi-language support

**Parlant Solution**:
```python
ecommerce_journey = Journey(
    name="customer_support",
    stages=[
        Stage(
            name="issue_identification",
            guidelines=["greeting", "ask_issue_type"]
        ),
        Stage(
            name="order_lookup",
            guidelines=["search_order", "verify_details"],
            tools=["search_orders"]
        ),
        Stage(
            name="resolution",
            guidelines=["return_policy", "refund_process", "exchange_option"]
        ),
        Stage(
            name="confirmation",
            guidelines=["confirm_resolution", "next_steps"]
        )
    ]
)
```

### 4. Government Services

**Requirements**:
- Accessibility compliance (ADA)
- Multi-language support
- Consistent policy information
- Audit trail for transparency

**Parlant Solution**:
```python
gov_agent = Agent(
    name="benefits_assistant",
    guidelines=[
        Guideline(
            name="accessibility",
            condition="always",
            action="use clear language, offer alternative formats",
            priority=20
        ),
        StrictGuideline(
            name="eligibility_criteria",
            condition="user asks about benefit eligibility",
            canned_responses=[
                "To qualify for {benefit_name}, you must meet these requirements: {requirements}. For official determination, please visit {official_link}"
            ],
            strict=True,
            variables=["benefit_name", "requirements", "official_link"]
        )
    ],
    domain_knowledge=government_services_knowledge
)
```

---

## Getting Started

### Installation

```bash
# Python
pip install parlant

# TypeScript/Node.js
npm install @parlant/sdk
```

### Quick Start (Python)

```python
from parlant import Agent, Guideline

# 1. Define guidelines
guidelines = [
    Guideline(
        name="greeting",
        condition="user greets agent",
        action="greet warmly and ask how to help"
    ),
    Guideline(
        name="help_request",
        condition="user asks for help",
        action="ask what specific issue they need help with"
    )
]

# 2. Create agent
agent = Agent(
    name="support_agent",
    model="gpt-4",  # or "claude-3-5-sonnet-20241022"
    guidelines=guidelines
)

# 3. Start conversation
response = agent.chat(
    user_id="user_123",
    message="Hi, I need help with my order"
)

print(response.text)
# Agent's guideline-driven response
```

### Quick Start (TypeScript)

```typescript
import { Agent, Guideline } from '@parlant/sdk';

// 1. Define guidelines
const guidelines = [
  new Guideline({
    name: 'greeting',
    condition: 'user greets agent',
    action: 'greet warmly and ask how to help'
  })
];

// 2. Create agent
const agent = new Agent({
  name: 'support_agent',
  model: 'gpt-4',
  guidelines: guidelines
});

// 3. Start conversation
const response = await agent.chat({
  userId: 'user_123',
  message: 'Hi, I need help with my order'
});

console.log(response.text);
```

### Using the Playground UI

```bash
# Start local playground
parlant playground --port 3000

# Open browser to http://localhost:3000
# - Test guidelines interactively
# - View activated guidelines in real-time
# - Inspect decision-making process
# - Iterate on guidelines quickly
```

---

## Best Practices

### 1. Guideline Design

**Do**:
- Use clear, specific conditions
- Prioritize appropriately (more specific = higher priority)
- Test guideline interactions
- Keep actions focused (one guideline = one behavior)

**Don't**:
- Create overlapping guidelines without priority consideration
- Use vague conditions ("user needs help")
- Forget to test edge cases
- Over-engineer (start simple, add complexity as needed)

### 2. Strict Mode Usage

**When to use**:
- Legal/compliance scenarios
- High-risk decisions (medical, financial)
- Brand-critical messaging
- Security-sensitive interactions

**When NOT to use**:
- Open-ended conversations
- Creative tasks
- Casual interactions
- Exploratory discussions

### 3. Testing Strategy

```python
# Unit test guidelines
def test_return_policy_guideline():
    agent = Agent(guidelines=[return_policy_guideline])

    response = agent.chat(
        user_id="test_user",
        message="What's your return policy?"
    )

    # Verify guideline activated
    assert "return_policy_guideline" in response.active_guidelines

    # Verify response content
    assert "30-day" in response.text
    assert "receipt required" in response.text

# Integration test journeys
def test_customer_support_journey():
    agent = Agent(journeys=[customer_support_journey])

    # Stage 1: Issue identification
    r1 = agent.chat(user_id="test_user", message="I have a problem")
    assert agent.get_stage() == "issue_identification"

    # Stage 2: Order lookup
    r2 = agent.chat(user_id="test_user", message="My order #12345")
    assert agent.get_stage() == "order_lookup"

    # ... test entire journey
```

### 4. Monitoring & Maintenance

```python
# Monitor guideline activation rates
analytics = agent.get_analytics(timeframe="last_7_days")

print(f"Top guidelines: {analytics.top_guidelines}")
print(f"Unused guidelines: {analytics.unused_guidelines}")
print(f"Conflicting guidelines: {analytics.conflicts}")

# Adjust based on data
if "greeting" in analytics.unused_guidelines:
    # Guideline condition may be too specific
    pass
```

---

## Resources

### Official Documentation

- **Parlant Docs**: [https://www.parlant.io/docs/](https://www.parlant.io/docs/)
- **Quickstart**: [https://www.parlant.io/docs/quickstart/introduction/](https://www.parlant.io/docs/quickstart/introduction/)
- **Agentic Design Methodology**: [https://www.parlant.io/docs/production/agentic-design/](https://www.parlant.io/docs/production/agentic-design/)

### GitHub

- **Repository**: [https://github.com/emcie-co/parlant](https://github.com/emcie-co/parlant)
- **Issues**: Report bugs and request features
- **Discussions**: Community support and best practices

### Blog Posts & Articles

- [Beyond the Prompt: Why Parlant is Redefining AI Agent Reliability](https://skywork.ai/blog/beyond-the-prompt-why-parlant-is-redefining-ai-agent-reliability/)
- [Mastra vs. Parlant: Architectural Philosophies of Modern Agentic Frameworks](https://hrshdg8.medium.com/mastra-vs-parlant-a-deep-dive-into-the-architectural-philosophies-of-modern-agentic-frameworks-a4a4497fdd4e)
- [IBM - AI Agent Frameworks: Choosing the Right Foundation](https://www.ibm.com/think/insights/top-ai-agent-frameworks)

### Community

- **Discord**: Join Parlant community for support
- **Twitter**: [@ParlantAI](https://twitter.com/parlantai) (follow for updates)
- **Newsletter**: Subscribe for best practices and case studies

---

**Document Version**: 1.0
**Last Updated**: November 6, 2025
**Parlant Version**: Latest (2025)
