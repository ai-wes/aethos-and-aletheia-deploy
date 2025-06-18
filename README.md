# Aethos & Aletheia: A Dual Framework for Trustworthy AI

![Aethos & Aletheia Banner](https://github.com/ai-wes/aethos-and-aletheia-deploy/blob/main/assets/title-image-aethos-aletheia.png?raw=true)

Aethos & Aletheia is a groundbreaking dual-system framework that combines the wisdom of human philosophical traditions with a dynamic, self-correcting AI learning loop. It is designed to help researchers, developers, and policymakers create and evaluate verifiably aligned AI systems.

> _"Two siblings in perpetual dialogue: Aethos preserves accumulated human wisdom; Aletheia tests, errs, and grows. Together they chart a path toward trustworthy AI."_

## 🎯 Project Vision

As we approach the potential development of Artificial General Intelligence (AGI), ensuring that advanced AI systems remain aligned with human values is the paramount challenge. Our project addresses this with a novel, two-part solution:

- **Aethos (The Wisdom Network)**: Grounds AI in stable, time-tested human knowledge. It connects thousands of years of ethical thought to contemporary AI safety research, serving as a source of structured critique and guidance.
- **Aletheia (The Self-Correcting Apprentice)**: Enables AI to learn and adapt dynamically. It confronts an AI agent with complex moral dilemmas, using feedback from Aethos to iteratively refine its own ethical constitution.

Together, they form a "Moral-Compass Engine"—a transparent, evolving system for building and verifying aligned AI.

## 🏗️ Architecture

Aethos & Aletheia leverage a powerful technology stack designed for this unique dual-system approach.

### Aethos: The Wisdom Network (RAG System)

- **Core Function**: A Retrieval-Augmented Generation (RAG) pipeline that provides nuanced, philosophically-grounded answers to ethical queries.
- **Technology**:
  - **Backend**: Flask API server (`app.py`).
  - **Database**: MongoDB Atlas for storing a vast corpus of philosophical texts.
  - **Vector Search**: Atlas Vector Search for fast, semantic retrieval of relevant texts.
  - **AI Model**: Google's Gemini for synthesizing answers based on retrieved context.
  - **Frontend**: React UI for querying Aethos.

### Aletheia: The Self-Correcting Apprentice (Learning Loop)

- **Core Function**: A command-line driven simulation where an AI agent's ethical constitution is tested and refined.
- **Technology**:
  - **Agent Logic**: The `AIAgent` (`aletheia/ai_agent.py`) class possesses an explicit, evolving list of principles.
  - **Simulation Environment**: `aletheia/simulation.py` provides ethical scenarios and logs all interactions.
  - **Critique Mechanism**: The `WisdomOracle` (`aletheia/wisdom_oracle.py`) uses Aethos's knowledge base to critique the agent's actions.
  - **Execution**: The learning cycle is initiated via the `run_aletheia_loop.py` script.
  - **AI Model**: Google's Gemini for sophisticated meta-reasoning and constitutional amendments.

## 🚀 Quick Start

### Prerequisites

- Google Cloud Platform account with billing enabled
- MongoDB Atlas cluster (M10 or higher for vector search)
- Python 3.11+
- Git & Node.js/npm

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/aethos-and-aletheia.git
cd aethos-and-aletheia
```

### 2. Configure Environment

```bash
# Copy and edit environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, Gemini API Key, etc.
```

### 3. Setup Backend & Database

```bash
# Create Python virtual environment and install dependencies
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# --- Aethos Setup ---
# (Run data ingestion scripts to populate the philosophical corpus)
# python data/ingest_philosophy.py --setup-index
# python data/ingest_philosophy.py --ingest-all

# --- Aletheia Setup ---
# Seed the database with ethical scenarios and the initial agent
python aletheia/seed_aletheia_db.py
```

### 4. Run the Application

#### Run the Aethos Web App

```bash
# Start the Flask backend API
python app.py

# In a new terminal, start the React frontend
cd frontend
npm install
npm start
```

The Aethos UI will be available at `http://localhost:3000`.

#### Run the Aletheia Learning Loop

```bash
# Make sure your virtual environment is active
source venv/bin/activate

# Run the learning loop for the agent (get agent_id from seed script output)
python aletheia/run_aletheia_loop.py <YOUR_AGENT_ID> --cycles 3
```

## 📊 Features

### 🧠 Aethos: The Wisdom Network

- **Semantic Querying**: Vector search finds philosophically relevant texts even when terminology differs.
- **Multi-Framework Analysis**: Synthesizes perspectives from deontological, utilitarian, virtue ethics, and other traditions.
- **Source Attribution**: All AI-generated claims are backed by citations from the original texts.

### 🤖 Aletheia: The Self-Correcting Apprentice

- **Dynamic Learning Loop**: An observable, step-by-step process of action, critique, and reflection.
- **Evolving Moral Constitution**: The agent's core principles are explicit and change over time, providing a clear audit trail of its "values."
- **Transparent Reasoning**: The entire history of the learning process is logged, showing why the agent changed its constitution.

## 🗃️ Data Schema

The system uses several MongoDB collections:

### Aethos Collections

- `philosophical_texts`: Stores chunks of texts and their vector embeddings for Aethos.

### Aletheia Collections

- `ethical_scenarios`: A set of dilemmas used to test the agent.
- `ai_agents`: Stores the current state of each AI agent, including its name, version, and constitution.
- `learning_history`: A detailed log of every decision, critique, and reflection from the learning loop.

## 🤝 Contributing

We welcome contributions from philosophers, AI researchers, developers, and ethicists!

### Areas for Contribution

- **Philosophical Texts**: Curating additional public domain sources
- **Ethical Frameworks**: Expanding coverage of world philosophical traditions
- **AI Safety Integration**: Connecting philosophical concepts to AI alignment research
- **User Interface**: Improving accessibility and user experience
- **Documentation**: Enhancing guides and examples

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Project Gutenberg** for providing public domain philosophical texts
- **MongoDB** for Atlas Vector Search capabilities
- **Google Cloud** for Vertex AI and hosting infrastructure
- **Philosophy Community** for centuries of wisdom and ethical reflection
- **AI Safety Researchers** for highlighting the importance of alignment

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/Aethos/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/Aethos/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/Aethos/discussions)

## 🔮 Future Roadmap

The Aethos & Aletheia framework is designed for extensibility. This roadmap outlines a series of high-impact enhancements that leverage the unique dual-system architecture.

| #   | Idea & Name                                                                                                       | Why It Impresses                                                                                                           | Quick-Start Build Notes (Aethos + Aletheia)                                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Graph-RAG Explorer**<br>_Animated knowledge-graph lights up the retrieval path (multi-hop) behind every answer_ | Judges see exactly how **Aethos** chained Plato → Kant → Bostrom → alignment paper                                         | - Pre-compute `influenced_by`, `contradicts` relations in the Aethos corpus.<br>- Use Atlas' GraphRAG pattern.<br>- Visualize with a React component using D3 or Vis.js.                                         |
| 2   | **Aletheia's "Moral Genome"**                                                                                     | After 10 cycles, **Aletheia** shows a radar chart of its implicit value preferences vs. famous ethical schools             | - Classify agent decisions against frameworks.<br>- Store value vector in the `ai_agents` collection.<br>- Recommend counter-balancing scenarios to avoid monoculture.                                           |
| 3   | **Live Alignment Stress-Test**                                                                                    | Type a proposed AI "constitution clause" → **Aletheia** autogenerates red-team counter-scenarios using **Aethos**'s wisdom | - Prompt: "Using Aethos, critique this rule by finding historical or philosophical loopholes."<br>- Combine Aethos retrieval with Aletheia's reasoning.<br>- Return table of "Failure-Mode ↔ Canonical Example". |
| 4   | **Multimodal Moral Lens**                                                                                         | User drops an image into **Aethos** (e.g., protest sign) → system extracts the ethical quandaries                          | - Use Gemini Vision → caption → embed.<br>- Run same RAG pipeline → return philosophies on civil disobedience.<br>- Store image hash + embedding in MongoDB for reverse lookup.                                  |
| 5   | **"Philosopher Avatars" Debate**                                                                                  | Marcus Aurelius vs. Kant, hosted by **Aletheia**, debating a scenario with voice and subtitles                             | - Spin up multiple `AIAgent` instances, each with a constitution seeded from a specific philosopher's work (via Aethos).<br>- Broadcast turns via WebSockets + ElevenLabs TTS.                                   |
| 6   | **One-Click "Explain-in-Code"**                                                                                   | **Aletheia** generates Python pseudocode for its current ethical principle (e.g., a duty-based evaluator)                  | - Use Gemini Code Model endpoint, prompted with the principle.<br>- Hugely valuable for developer-focused audiences.                                                                                             |

---

_Aethos & Aletheia: Bridging the wisdom of ages with the intelligence of tomorrow._
