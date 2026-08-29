# TCSNQTHSHEET 🚀
### TCS NQT 100 DSA Sheet & Interactive Preparation Tracker

An interactive, full-featured DSA tracking application and Python execution workspace designed for mastering the **Top 100 TCS NQT DSA Problems**.

![TCS NQT DSA Tracker](https://img.shields.io/badge/DSA-TCS%20NQT-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite)

---

## 🌟 Key Features

- 📊 **LeetCode-Style Dashboard**: Real-time progress breakdown by difficulty (Easy, Medium, Hard) with circular progress gauge, streak tracker, and daily goal monitoring.
- 🧩 **100 Master DSA Problems**: Categorized across Arrays, Numbers, Number Systems, Sorting, and Strings with LeetCode number mappings.
- ⚡ **Built-In Python IDE (Pyodide)**: Run Python 3 code in-browser with zero installation or backend requirements.
- 🤖 **AI DSA Tutor & Problem Generator (Groq / Llama 3.3 / GPT-OSS)**: 
  - Generates comprehensive 13-part structured conceptual intuitions and explanations.
  - Dynamically synthesizes LeetCode-style descriptions, edge test cases, and starter boilerplates for custom problems.
- 🧪 **Test Case Evaluation & Submit**: Run hidden unit test cases against user code and view pass/fail test reports.
- 📝 **Global Scratchpad**: Shared rough-work canvas across all problems.
- 🔄 **Smart Revision System**: Spaced repetition tracking and personalized problem notes.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **State Management**: Zustand with persistent storage
- **Python Runtime**: Pyodide (WebAssembly Python 3.11 engine)
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **AI Engine**: Groq Cloud API (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`)
- **Markdown & Syntax**: `react-markdown`, `remark-gfm`, `react-syntax-highlighter`

---

## 🚀 Getting Started

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/ibanmondal/TCSNQTHSHEET.git
cd TCSNQTHSHEET
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup Environment Variables
Create a \`.env\` file in the root directory:
\`\`\`env
VITE_GROQ_API_KEY=your_groq_api_key_here
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### 5. Build for Production
\`\`\`bash
npm run build
\`\`\`

---

## 📜 License
MIT License
