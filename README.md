<p align="center">
  <img src="public/ngamje-logo.png" alt="Ngam-je Logo" width="200" height="200"/>
</p>

<h1 align="center">🧩 Ngam-je 🧩</h1>

<p align="center">
  Powered by Google Gemini AI and Celery. Designed for intelligent marketplace matching, AI-driven negotiations, and seamless buyer-seller connections.
</p>
<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/frontend-next.js%20%7C%20react-blue?style=for-the-badge" /></a>
  <a href="#"><img src="https://img.shields.io/badge/backend-fastapi%20%7C%20python-green?style=for-the-badge" /></a>
  <a href="#"><img src="https://img.shields.io/badge/storage-postgresql%20%7C%20redis-yellow?style=for-the-badge" /></a>
  <a href="#"><img src="https://img.shields.io/badge/infra-docker%20%7C%20gcp-lightgrey?style=for-the-badge" /></a>
</p>

# 🏆 1st Runner Up - Gamuda AI Academy Cohort 4 🏆

**Ngam-je** is an AI-powered marketplace platform that revolutionizes how buyers and sellers connect. Using advanced AI matching algorithms, automated negotiations, and intelligent price analysis, Ngam-je creates a seamless trading experience where deals happen faster and fairer.

This project was developed as the capstone project for Gamuda AI Academy Cohort 4 and achieved **1st Runner Up** recognition.

  ---

  ## 🎯 Key Features

  ### 🤖 AI Matching Algorithm
  Intelligent matching system to find the perfect buyer-seller pairs:
  - Product details and specifications
  - Pricing compatibility
  - Location proximity
  - User preferences and history

  <div align="center">
    <video controls muted src="https://github.com/user-attachments/assets/4e5dcd0c-1e4a-4edf-aa44-b6510dbc94f9"></video>
    <h3><u>🤖 Smart Buyer-Seller Matching 🤖</u></h3>
    <p>"Matching algorithm powered by Google Gemini that analyzes listings and finds the perfect buyer-seller pairs."</p>
  </div>

  ---

  ### 💬 Automated Negotiations
  AI agents that negotiate on behalf of buyers and sellers:
  - Uses Celery to queue jobs, and RAG to extract data from listings
  - Real-time price negotiations
  - Smart counteroffers based on market data
  - Win-win deal finding
  - Transparent negotiation history

  <div align="center">
    <video controls muted src="https://github.com/user-attachments/assets/c02a0fb9-b4cc-4cab-ac9c-68477ca6d217"></video>
    <h3><u>💬 Agent-to-Agent Negotiations 💬</u></h3>
    <p>"Ngam-je uses AI Agents to communicate with one-another, removing the boilerplate conversations."</p>
  </div>

  ---

  ### 📊 Price Intelligence
  Market research and price analysis using SerpAPI:
  - Real-time market price comparison
  - Price trend analysis
  - Competitive pricing suggestions
  - Historical price data

  <div align="center">
    <video controls muted src="https://github.com/user-attachments/assets/3650f248-3b97-4a29-9bb6-631b8e7b04ea"></video>
    <h3><u>📊 Smart Pricing Recommendations 📊</u></h3>
    <p>"Ngam-je uses AI to search for similar priced products, to inform users about the best prices to set."</p>
  </div>

  ---

  ### 🎨 AI Listing Generation
  Automated listing creation and enhancement:
  - AI-generated product descriptions
  - Image enhancement and generation
  - Tag and category suggestions
  - FAQ generation from product details

  <div align="center">
    <video controls muted src="https://github.com/user-attachments/assets/453ad9c6-9231-482b-9537-1db6dcc9e3ca"></video>
    <h3><u>🎨 Effortless Listing Creation 🎨</u></h3>
    <p>"Ngam-je enables users to effortlessly create listings using AI."</p>
  </div>

  ---

  ### ❓ FAQ Correspondence
  AI-powered Q&A system for product listings:
  - Automated FAQ generation from product details
  - Intelligent answer suggestions for sellers
  - Natural language question understanding
  - Community-driven knowledge base

  <div align="center">
    <video controls muted src="https://github.com/user-attachments/assets/1220e159-5d79-466a-a0b4-a6b7cf5e5eb9"></video>
    <h3><u>❓ Smart FAQ Management ❓</u></h3>
    <p>"Ngam-je automatically generates and manages FAQs, helping sellers answer buyer questions efficiently with AI-powered suggestions."</p>
  </div>

  ---

  ### 🔍 AI-Assisted Web Search
  Intelligent market research powered by SerpAPI and Google Gemini:
  - Real-time product search across major e-commerce platforms
  - Price comparison and trend analysis
  - Competitive pricing recommendations
  - Market insights and demand forecasting

  <div align="center">
    <video controls muted src="https://github.com/user-attachments/assets/fd40dae2-6a37-4348-bdcc-45d0e71fdb8d"></video>
    <h3><u>🔍 Smart Market Research 🔍</u></h3>
    <p>"Our AI scours the web to find the best market data, helping you price competitively and understand market trends instantly."</p>
  </div>

  ---

  ### 💬 AI Chatbot Assistant
  Conversational AI assistant for personalized marketplace guidance:
  - Natural language product search
  - Personalized buying and selling recommendations
  - Real-time query assistance
  - Context-aware responses based on user history

  <div align="center">
    <video controls muted src="https://github.com/user-attachments/assets/97ae72d7-1e0a-4075-87b5-a735c1d10246"></video>
    <h3><u>💬 Your Personal Marketplace Guide 💬</u></h3>
    <p>"Chat naturally with our AI assistant to discover products, get pricing advice, and navigate the marketplace effortlessly."</p>
  </div>

  ---

  ## ⚙️ Tech Stack Overview

### Front-End
- **Next.js 15** with App Router and TypeScript
- **React 19** for modern UI components
- **Tailwind CSS** for styling
- **Shadcn/UI** component library
- **Clerk** for authentication
- **Stripe** for payment processing
- **Google Maps API** for location services
- **Bun** for package management

### Back-End
- **FastAPI** for high-performance API routing
- **Python 3.12** with **uv** dependency management
- **PydanticAI** for fast and simple data-validated agents
- **Google Gemini** for AI-powered features
- **Celery** for background task processing
- **SQLAlchemy 2.0** with Alembic migrations
- **Redis** for caching and task queues
- **Cloudinary** for image storage
- **SerpAPI** for price intelligence
- **Pydantic v2** for data validation

### Storage & Database
- **PostgreSQL 16** for persistent relational data
- **Redis 7** for caching and message queuing
- **Google Cloud Storage** for file uploads

### Infrastructure & Deployment
- **Docker** for containerization
- **Google Cloud Run** for serverless deployment
- **Google Cloud SQL** for managed PostgreSQL
- **Google Cloud Secret Manager** for secrets management
- **GitHub Actions** for CI/CD

## 👥 Team

<!-- Add your team members here -->
- **Darren Siew Jun Zhen** - [@DarrenSJZ](https://github.com/DarrenSJZ)
- **Maryam Mohamed** - [@mrym-emm](https://github.com/mrym-emm)
- **Yuvarani Jagathesan** - [@Rach0613](https://github.com/Rach0613)
- **Liew Shan Khiun** - [@batutiga](https://github.com/batutiga)
- **Luqman Hakim** - [@lululuqman](https://github.com/lululuqman)
- **Joel Wong** - [@ScorpiusG](https://github.com/ScorpiusG)

---

## 👏 Acknowledgements

Thanks to the amazing open-source community and tool maintainers. Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [Google Gemini](https://ai.google.dev/)
- [Clerk](https://clerk.com/)
- [Stripe](https://stripe.com/)
- [Shadcn/UI](https://ui.shadcn.com/)

Special thanks to **Gamuda AI Academy** for the guidance and support throughout Cohort 4.

---

## 📄 License

See [LICENSE](./LICENSE) file for details.
