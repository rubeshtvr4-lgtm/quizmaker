import { useState, useEffect, Component } from "react";
import {
  ChevronDown,
  ArrowRight,
  Triangle,
  BookOpen,
  Sparkles,
  RotateCcw,
  Trash2,
  Download,
  Copy,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  LogOut,
  User,
  Save,
  FileText,
  FolderOpen,
  Clock,
  Lock,
  Mail,
  Printer,
  CheckCircle2,
  FileDown,
  Globe,
  Award,
  HelpCircle,
  Send,
  XCircle,
  UserCheck,
  CheckCircle,
  GraduationCap,
  Users,
  Eye,
  BarChart3,
  Search,
  X,
  Home,
} from "lucide-react";

// Local Storage Keys
const STORAGE_SESSION_KEY = "quizcraft_session";
const STORAGE_DRAFTS_KEY = "quizcraft_saved_drafts";
const STORAGE_STUDENTS_KEY = "quizcraft_student_accounts";
const STORAGE_PUBLISHED_KEY = "quizcraft_published_quizzes";
const STORAGE_RESULTS_KEY = "quizcraft_student_results";

let uid = 0;
const nextId = () => `q${Date.now()}_${uid++}`;

// Default Data Seed for rich immediate demo experience
const DEFAULT_PUBLISHED_QUIZZES = [
  {
    id: "pub_101",
    title: "Computer Networks & OSI Model Assessment",
    material:
      "The OSI model consists of seven layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. TCP is connection-oriented whereas UDP is connectionless.",
    questions: [
      {
        id: "q_pub_1",
        type: "mcq",
        question: "Which OSI layer is responsible for end-to-end communication reliability?",
        options: ["Transport Layer", "Network Layer", "Data Link Layer", "Physical Layer"],
        correctIndex: 0,
      },
      {
        id: "q_pub_2",
        type: "mcq",
        question: "UDP is classified as a ____ protocol.",
        options: ["Connectionless", "Connection-oriented", "Encrypted", "Synchronous"],
        correctIndex: 0,
      },
      {
        id: "q_pub_3",
        type: "fill",
        sentence: "The OSI model consists of ____ layers.",
        answer: "seven",
      },
    ],
    numQuestions: 3,
    difficulty: "medium",
    publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    author: "rubesh46@gmail.com",
  },
];

const DEFAULT_STUDENT_ACCOUNTS = [
  {
    registerNo: "731524165",
    name: "Rubesh",
    password: "Password@123",
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const DEFAULT_STUDENT_RESULTS = [
  {
    id: "res_101",
    quizId: "pub_101",
    quizTitle: "Computer Networks & OSI Model Assessment",
    registerNo: "731524165",
    studentName: "Rubesh",
    score: 3,
    total: 3,
    percentage: 100,
    breakdown: [
      {
        questionId: "q_pub_1",
        type: "mcq",
        prompt: "Which OSI layer is responsible for end-to-end communication reliability?",
        studentAnswer: "A) Transport Layer",
        correctAnswer: "A) Transport Layer",
        isCorrect: true,
      },
      {
        questionId: "q_pub_2",
        type: "mcq",
        prompt: "UDP is classified as a ____ protocol.",
        studentAnswer: "A) Connectionless",
        correctAnswer: "A) Connectionless",
        isCorrect: true,
      },
      {
        questionId: "q_pub_3",
        type: "fill",
        prompt: "The OSI model consists of ____ layers.",
        studentAnswer: "seven",
        correctAnswer: "seven",
        isCorrect: true,
      },
    ],
    takenAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

// Error Boundary Component
class QuizCraftErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("QuizCraft Error Boundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 font-helvetica-neue bg-brand-cream text-brand-dark">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-200 text-center">
            <AlertCircle size={40} className="mx-auto mb-3 text-red-700" />
            <h2 className="text-2xl font-bold font-helvetica-neue mb-2 text-brand-dark">
              Workspace Reset Required
            </h2>
            <p className="text-xs font-mono text-gray-600 mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_SESSION_KEY);
                localStorage.removeItem(STORAGE_DRAFTS_KEY);
                window.location.reload();
              }}
              className="px-6 py-3 bg-brand-dark text-white rounded-full text-xs font-helvetica-neue uppercase tracking-wider hover:bg-brand-green transition-colors font-bold"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Contextual Question Fallback Generator
function generateSmartFallback(materialText, count, mix, diff) {
  const textToUse =
    materialText && materialText.trim().length > 0
      ? materialText
      : "General Science and History Study Material";
  const words = textToUse.trim().split(/\s+/).filter((w) => w.length > 3);
  const keyTerms = Array.from(new Set(words.map((w) => w.replace(/[^a-zA-Z]/g, ""))))
    .filter((w) => w.length > 3)
    .slice(0, 10);
  const terms =
    keyTerms.length >= 4
      ? keyTerms
      : ["Concept", "Mechanism", "Structure", "Function", "Process", "Analysis"];

  const questions = [];
  const reqCount = typeof count === "number" && count > 0 ? count : 5;
  for (let i = 0; i < reqCount; i++) {
    const isMcq = mix === "mcq" ? true : mix === "fill" ? false : i % 2 === 0;
    const term = terms[i % terms.length] || "Topic";
    const titleTerm = term.charAt(0).toUpperCase() + term.slice(1);

    if (isMcq) {
      const correctOpt = `${titleTerm} is a primary component discussed in the text.`;
      questions.push({
        id: nextId(),
        type: "mcq",
        question: `Based on the material provided, which statement accurately describes the role of ${titleTerm}?`,
        options: [
          correctOpt,
          `${titleTerm} acts as an external variable without direct impact.`,
          `${titleTerm} is strictly theoretical and not supported by the data.`,
          `${titleTerm} was replaced in subsequent revisions of the theory.`,
        ],
        correctIndex: 0,
      });
    } else {
      questions.push({
        id: nextId(),
        type: "fill",
        sentence: `The study material emphasizes that the primary function of ____ is essential to the system.`,
        answer: titleTerm.toLowerCase(),
      });
    }
  }
  return questions;
}

// LLM API Call with automatic fallback
async function callClaude(userMessage, systemPrompt, materialText, numQuestions, typeMix, difficulty) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    const text = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    return JSON.parse(match[0]);
  } catch (e) {
    console.warn("LLM API call failed, generating contextual study questions fallback:", e.message);
    const fallbackQs = generateSmartFallback(materialText, numQuestions, typeMix, difficulty);
    return { questions: fallbackQs };
  }
}

const SYSTEM_PROMPT = `You are a quiz question generator for teachers. Generate questions ONLY using facts, terms, and ideas explicitly present in the study material the user provides. Never introduce outside facts or unrelated trivia. Match the requested difficulty and question type exactly. Respond with ONLY compact minified JSON — no markdown fences, no commentary, nothing before or after the JSON. Shape: {"questions":[{"type":"mcq","q":"question text","o":["opt1","opt2","opt3","opt4"],"c":0},{"type":"fill","s":"sentence with a ____ blank","a":"answer"}]}. "c" is the zero-based index of the correct option in "o". Keep wording concise.`;

function toInternal(raw) {
  const list = raw && Array.isArray(raw.questions) ? raw.questions : [];
  return list.map((item) => {
    if (item.type === "fill") {
      return {
        id: item.id || nextId(),
        type: "fill",
        sentence: item.sentence || item.s || "",
        answer: item.answer || item.a || "",
      };
    }
    const opts =
      item.options && Array.isArray(item.options) && item.options.length === 4
        ? item.options
        : item.o && Array.isArray(item.o) && item.o.length === 4
        ? item.o
        : ["Option A", "Option B", "Option C", "Option D"];
    return {
      id: item.id || nextId(),
      type: "mcq",
      question: item.question || item.q || "",
      options: opts,
      correctIndex:
        typeof item.correctIndex === "number"
          ? item.correctIndex
          : typeof item.c === "number"
          ? item.c
          : 0,
    };
  });
}

function blankMcq() {
  return {
    id: nextId(),
    type: "mcq",
    question: "",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctIndex: 0,
  };
}

function blankFill() {
  return { id: nextId(), type: "fill", sentence: "", answer: "" };
}

// Punched Paper Workspace Container Component
function PunchedPage({ children }) {
  return (
    <div className="relative rounded-2xl md:pl-16 pl-6 pr-6 md:pr-10 py-8 shadow-xl transition-all backdrop-blur-md bg-white/90 border border-brand-dark/15">
      <div className="hidden md:flex flex-col justify-around absolute left-6 top-8 bottom-8 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-full bg-brand-cream border border-brand-dark/20 shadow-inner"
          />
        ))}
      </div>
      <div
        className="hidden md:block absolute top-0 bottom-0 pointer-events-none bg-red-800/20"
        style={{ left: "3.5rem", width: "1px" }}
      />
      {children}
    </div>
  );
}

// Navigation Tab Component
function StepTab({ label, index, active, done, onClick, disabled, badge }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 text-xs uppercase tracking-wider transition-all flex items-center gap-2 font-helvetica-neue font-medium rounded-t-xl border border-brand-dark/15 border-b-0 ${
        active
          ? "bg-white text-brand-dark font-bold shadow-sm"
          : disabled
          ? "bg-brand-light text-brand-dark/35 cursor-not-allowed opacity-60"
          : "bg-brand-light text-brand-dark/70 hover:bg-white hover:text-brand-dark"
      }`}
      style={{ marginBottom: active ? "-1px" : "0" }}
    >
      <span>
        {index}. {label}
      </span>
      {done && !active && <span className="text-emerald-800 font-bold">✓</span>}
      {badge !== undefined && (
        <span
          className={`ml-1 px-2 py-0.5 text-[10px] rounded-full font-mono text-white ${
            active ? "bg-brand-dark" : "bg-brand-green"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// Styled Button Helper
function IconButton({ icon, label, onClick, tone = "dark", disabled }) {
  const textColor =
    tone === "red" ? "text-red-800" : tone === "green" ? "text-brand-green" : "text-brand-dark";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tracking-wide transition-all border border-brand-dark/15 hover:bg-black/5 font-helvetica-neue ${textColor} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Editable Question Card Component
function QuestionCard({ q, index, onChange, onDelete, onRegenerate, regenerating }) {
  const optionsList =
    Array.isArray(q.options) && q.options.length === 4
      ? q.options
      : ["Option A", "Option B", "Option C", "Option D"];
  return (
    <div
      className={`rounded-xl p-6 mb-5 transition-all bg-white/70 hover:bg-white/95 shadow-sm border border-brand-dark/15 ${
        regenerating ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold font-mono text-brand-dark">Q{index + 1}</span>
          <span className="text-[11px] uppercase tracking-wider px-3 py-1 rounded-full font-medium bg-brand-light text-brand-green border border-brand-dark/15">
            {q.type === "mcq" ? "Multiple choice" : "Fill in the blank"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={<RotateCcw size={13} />}
            label={regenerating ? "Replacing..." : "Regenerate"}
            onClick={onRegenerate}
            disabled={regenerating}
          />
          <IconButton icon={<Trash2 size={13} />} label="Delete" tone="red" onClick={onDelete} />
        </div>
      </div>

      {q.type === "mcq" ? (
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-1 font-helvetica-neue font-medium text-brand-dark">
            Question Prompt
          </label>
          <textarea
            value={q.question || ""}
            onChange={(e) => onChange({ ...q, question: e.target.value })}
            placeholder="Enter question prompt..."
            rows={2}
            className="w-full resize-y bg-white rounded-lg p-3 outline-none mb-4 text-base focus:ring-2 focus:ring-brand-green border border-brand-dark/15 font-helvetica-neue text-brand-dark leading-relaxed"
          />

          <label className="block text-[11px] uppercase tracking-widest mb-2 font-helvetica-neue font-medium text-brand-dark">
            Options (click radio button to toggle correct answer choice)
          </label>
          <div className="flex flex-col gap-2.5">
            {optionsList.map((opt, i) => {
              const isCorrect = q.correctIndex === i;
              return (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onChange({ ...q, correctIndex: i })}
                    title={isCorrect ? "Correct answer" : "Mark as correct answer"}
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 border-2 ${
                      isCorrect ? "border-brand-green bg-brand-green" : "border-brand-dark/20 bg-white"
                    }`}
                  >
                    {isCorrect && <Check size={14} className="text-white stroke-[3]" />}
                  </button>
                  <span className="text-xs font-mono w-4 text-center font-bold text-brand-dark">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const nextOpts = [...optionsList];
                      nextOpts[i] = e.target.value;
                      onChange({ ...q, options: nextOpts });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className={`flex-1 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green border ${
                      isCorrect ? "border-brand-green font-semibold" : "border-brand-dark/15 font-normal"
                    } text-brand-dark`}
                  />
                  {isCorrect && (
                    <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-bold border border-emerald-300">
                      Correct Answer
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-[11px] uppercase tracking-widest mb-1 font-helvetica-neue font-medium text-brand-dark">
            Sentence Prompt (Use ____ to mark blank)
          </label>
          <textarea
            value={q.sentence || ""}
            onChange={(e) => onChange({ ...q, sentence: e.target.value })}
            placeholder="Sentence with a ____ blank..."
            rows={2}
            className="w-full resize-y bg-white rounded-lg p-3 outline-none mb-3 text-base focus:ring-2 focus:ring-brand-green border border-brand-dark/15 font-helvetica-neue text-brand-dark leading-relaxed"
          />
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-wider text-brand-dark">
              Expected Answer:
            </span>
            <input
              value={q.answer || ""}
              onChange={(e) => onChange({ ...q, answer: e.target.value })}
              placeholder="Correct word or phrase"
              className="flex-1 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green border border-brand-dark/15 text-brand-dark"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Export Builders
function buildExportText(title, material, questions) {
  const safeQs = Array.isArray(questions) ? questions : [];
  const lines = [`${title || "Quiz"} — QuizCraft Assessment`, ""];
  safeQs.forEach((q, i) => {
    if (q.type === "mcq") {
      lines.push(`${i + 1}. ${q.question || ""}`);
      const opts = Array.isArray(q.options) ? q.options : [];
      opts.forEach((opt, j) => {
        lines.push(`   ${String.fromCharCode(65 + j)}) ${opt}`);
      });
    } else {
      lines.push(`${i + 1}. ${q.sentence || ""}`);
    }
    lines.push("");
  });
  lines.push("----------------------------------------");
  lines.push("ANSWER KEY & EVALUATION GUIDE");
  lines.push("----------------------------------------");
  safeQs.forEach((q, i) => {
    if (q.type === "mcq") {
      const opts = Array.isArray(q.options) ? q.options : [];
      const correctIdx = typeof q.correctIndex === "number" ? q.correctIndex : 0;
      lines.push(`${i + 1}. ${String.fromCharCode(65 + correctIdx)}) ${opts[correctIdx] || ""}`);
    } else {
      lines.push(`${i + 1}. ${q.answer || ""}`);
    }
  });
  return lines.join("\n");
}

function buildExportWordHTML(title, material, questions) {
  const safeQs = Array.isArray(questions) ? questions : [];
  const questionsHTML = safeQs
    .map((q, i) => {
      if (q.type === "mcq") {
        const optsList = Array.isArray(q.options) ? q.options : [];
        const opts = optsList
          .map((opt, j) => `<p style="margin:3px 0 3px 20px;"><b>${String.fromCharCode(65 + j)})</b> ${opt}</p>`)
          .join("");
        return `<div style="margin-bottom:18px;"><p style="font-size:14pt;margin:0 0 6px 0;"><b>${i + 1}. ${q.question || ""}</b></p>${opts}</div>`;
      } else {
        return `<div style="margin-bottom:18px;"><p style="font-size:14pt;margin:0;"><b>${i + 1}. ${q.sentence || ""}</b></p></div>`;
      }
    })
    .join("");

  const answerKeyHTML = safeQs
    .map((q, i) => {
      if (q.type === "mcq") {
        const optsList = Array.isArray(q.options) ? q.options : [];
        const correctIdx = typeof q.correctIndex === "number" ? q.correctIndex : 0;
        return `<p style="margin:4px 0;"><b>${i + 1}.</b> ${String.fromCharCode(65 + correctIdx)}) ${optsList[correctIdx] || ""}</p>`;
      } else {
        return `<p style="margin:4px 0;"><b>${i + 1}.</b> ${q.answer || ""}</p>`;
      }
    })
    .join("");

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${title || "Quiz"}</title>
    <style>
      body { font-family: 'Helvetica Neue Light', Helvetica, Arial, sans-serif; color: #2d3a2e; margin: 40px; }
      h1 { color: #2d3a2e; border-bottom: 2px solid #2d3a2e; padding-bottom: 8px; }
      h2 { color: #3d5a3e; margin-top: 30px; border-bottom: 1px dashed #3d5a3e; padding-bottom: 4px; }
    </style>
    </head>
    <body>
      <h1>${title || "QuizCraft Assessment"}</h1>
      <p style="font-size:10pt;color:#666;">Generated on ${new Date().toLocaleDateString()}</p>
      <hr style="margin-bottom:24px;border:none;border-top:1px solid #ccc;"/>
      ${questionsHTML}
      <br/><br/>
      <h2>Answer Key & Solutions</h2>
      ${answerKeyHTML}
    </body>
    </html>
  `;
}

// Main QuizCraft Application Component
function QuizCraftMainApp() {
  const [scrolled, setScrolled] = useState(false);

  // Session State ({ role: 'teacher' | 'student', email?: string, registerNo?: string, name?: string })
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed === "object" && parsed.role ? parsed : null;
    } catch {
      return null;
    }
  });

  // Active Tab view: 'home' (landing explanation) | 'auth' (login form) | 'workspace' (teacher/student portal)
  const [activeTab, setActiveTab] = useState(() => (session ? "workspace" : "home"));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auth Forms State
  const [authRole, setAuthRole] = useState("teacher"); // 'teacher' | 'student'
  const [studentMode, setStudentMode] = useState("login"); // 'login' | 'register'

  // Teacher inputs
  const [teacherName, setTeacherName] = useState("Rubesh");
  const [teacherEmail, setTeacherEmail] = useState("rubesh46@gmail.com");
  const [teacherPassword, setTeacherPassword] = useState("");

  // Student inputs
  const [studentName, setStudentName] = useState("Alex Johnson");
  const [studentRegNo, setStudentRegNo] = useState("731524165");
  const [studentPassword, setStudentPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Registered Student Accounts
  const [studentAccounts, setStudentAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDENTS_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STUDENT_ACCOUNTS;
    } catch {
      return DEFAULT_STUDENT_ACCOUNTS;
    }
  });

  // Teacher Workspace State
  const [quizTitle, setQuizTitle] = useState("Computer Networks & Architecture Assessment");
  const [material, setMaterial] = useState(
    "The OSI model consists of seven layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. TCP is connection-oriented whereas UDP is connectionless. The network layer manages packet routing."
  );
  const [numQuestions, setNumQuestions] = useState(5);
  const [typeMix, setTypeMix] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState("input"); // 'input' | 'review' | 'export' | 'submissions' | 'drafts'
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [publishState, setPublishState] = useState("idle");

  // Selected Submission Modal for Teacher View
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState(null);

  // Drafts Persistence
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFTS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Published Quizzes Persistence
  const [publishedQuizzes, setPublishedQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PUBLISHED_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PUBLISHED_QUIZZES;
    } catch {
      return DEFAULT_PUBLISHED_QUIZZES;
    }
  });

  // Student Results Persistence
  const [studentResults, setStudentResults] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RESULTS_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STUDENT_RESULTS;
    } catch {
      return DEFAULT_STUDENT_RESULTS;
    }
  });

  // Student Active Test Taking State
  const [activeQuizToTake, setActiveQuizToTake] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DRAFTS_KEY, JSON.stringify(drafts));
    } catch (e) {}
  }, [drafts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PUBLISHED_KEY, JSON.stringify(publishedQuizzes));
    } catch (e) {}
  }, [publishedQuizzes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(studentAccounts));
    } catch (e) {}
  }, [studentAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(studentResults));
    } catch (e) {}
  }, [studentResults]);

  // Handle Tab Navigation (Auto-Submits active test if student leaves mid-test)
  function handleNavigate(targetTab) {
    if (activeQuizToTake && !testResult) {
      handleSubmitStudentTest();
    }
    setActiveTab(targetTab);
  }

  // Auth Handlers
  function handleTeacherLogin(e) {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (teacherEmail.trim() === "rubesh46@gmail.com" && teacherPassword === "Password@123") {
      const nameToUse = teacherName.trim() || "Rubesh";
      const newSession = {
        role: "teacher",
        email: "rubesh46@gmail.com",
        name: nameToUse,
        loginTime: new Date().toISOString(),
      };
      setSession(newSession);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
      setActiveTab("workspace");
    } else {
      setAuthError(
        "Invalid Teacher Credentials. Strictly use Email: rubesh46@gmail.com and Password: Password@123"
      );
    }
  }

  function handleStudentRegister(e) {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const regNo = studentRegNo.trim();
    const pwd = studentPassword.trim();
    const nameToUse = studentName.trim() || `Student (${regNo})`;

    if (!regNo || regNo.length < 3) {
      setAuthError("Please enter a valid Register No (e.g. 731524165).");
      return;
    }
    if (!pwd || pwd.length < 4) {
      setAuthError("Password must be at least 4 characters long.");
      return;
    }

    const existing = studentAccounts.find((acc) => acc.registerNo === regNo);
    if (existing) {
      setAuthError(
        `Account already exists for Register No ${regNo}. Please switch to Student Login.`
      );
      return;
    }

    const newAcc = { registerNo: regNo, name: nameToUse, password: pwd, registeredAt: new Date().toISOString() };
    const updatedAccs = [...studentAccounts, newAcc];
    setStudentAccounts(updatedAccs);

    const newSession = {
      role: "student",
      registerNo: regNo,
      name: nameToUse,
      loginTime: new Date().toISOString(),
    };
    setSession(newSession);
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
    setActiveTab("workspace");
  }

  function handleStudentLogin(e) {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const regNo = studentRegNo.trim();
    const pwd = studentPassword.trim();

    if (!regNo || !pwd) {
      setAuthError("Please enter both Register No and Password.");
      return;
    }

    const account = studentAccounts.find((acc) => acc.registerNo === regNo && acc.password === pwd);
    if (account) {
      const nameToUse = studentName.trim() || account.name || `Student (${regNo})`;
      const newSession = {
        role: "student",
        registerNo: regNo,
        name: nameToUse,
        loginTime: new Date().toISOString(),
      };
      setSession(newSession);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
      setActiveTab("workspace");
    } else {
      setAuthError(
        `Invalid Register No or Password. Click "Create Student Account" to register with your Register No first.`
      );
    }
  }

  function handleLogout() {
    if (activeQuizToTake && !testResult) {
      handleSubmitStudentTest();
    }
    setSession(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    setActiveQuizToTake(null);
    setTestResult(null);
    setActiveTab("home");
  }

  // Quiz Generation & Editing
  const canGenerate = material && material.trim().length >= 30 && !isGenerating;

  async function handleGenerate() {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError("");
    try {
      const typeInstruction =
        typeMix === "mixed"
          ? "a mix of multiple-choice and fill-in-the-blank questions"
          : typeMix === "mcq"
          ? "only multiple-choice questions"
          : "only fill-in-the-blank questions";
      const userMessage = `Study material:\n"""${material.trim()}"""\n\nGenerate exactly ${numQuestions} questions, ${typeInstruction}, at ${difficulty} difficulty. Output JSON only.`;

      const raw = await callClaude(
        userMessage,
        SYSTEM_PROMPT,
        material,
        numQuestions,
        typeMix,
        difficulty
      );
      const parsed = toInternal(raw);
      if (parsed.length === 0) throw new Error("empty");
      setQuestions(parsed);
      setStep("review");
    } catch (e) {
      setError("Couldn't generate questions from that text. Try again, or paste a longer passage.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRegenerate(id) {
    const target = (questions || []).find((q) => q.id === id);
    if (!target) return;
    setRegeneratingId(id);
    setError("");
    try {
      const existing = (questions || [])
        .map((q) => (q.type === "mcq" ? q.question : q.sentence))
        .filter(Boolean)
        .join(" | ");
      const userMessage = `Study material:\n"""${material.trim()}"""\n\nGenerate exactly 1 new ${
        target.type === "mcq" ? "multiple-choice" : "fill-in-the-blank"
      } question at ${difficulty} difficulty, different from these existing questions: ${existing}. Output JSON only, shape: {"questions":[{...}]}`;

      const raw = await callClaude(
        userMessage,
        SYSTEM_PROMPT,
        material,
        1,
        target.type,
        difficulty
      );
      const parsed = toInternal(raw);
      if (parsed.length === 0) throw new Error("empty");
      const replacement = { ...parsed[0], id };
      setQuestions((prev) =>
        Array.isArray(prev) ? prev.map((q) => (q.id === id ? replacement : q)) : [replacement]
      );
    } catch (e) {
      setError("Couldn't regenerate that question. Try again.");
    } finally {
      setRegeneratingId(null);
    }
  }

  function updateQuestion(id, next) {
    setQuestions((prev) => (Array.isArray(prev) ? prev.map((q) => (q.id === id ? next : q)) : []));
  }

  function deleteQuestion(id) {
    setQuestions((prev) => (Array.isArray(prev) ? prev.filter((q) => q.id !== id) : []));
  }

  function addManual(type) {
    const newQ = type === "mcq" ? blankMcq() : blankFill();
    setQuestions((prev) => (Array.isArray(prev) ? [...prev, newQ] : [newQ]));
    if (step !== "review") setStep("review");
  }

  // Teacher Publishing Handler
  function handlePublishQuiz() {
    const safeQs = Array.isArray(questions) ? questions : [];
    if (safeQs.length === 0) return;

    const publishedItem = {
      id: `pub_${Date.now()}`,
      title: (quizTitle || "").trim() || "Untitled Assessment Quiz",
      material: material || "",
      questions: safeQs,
      numQuestions: safeQs.length,
      difficulty: difficulty || "medium",
      publishedAt: new Date().toISOString(),
      author: session?.name ? `${session.name} (${session.email})` : session?.email || "rubesh46@gmail.com",
    };

    setPublishedQuizzes((prev) => [publishedItem, ...prev]);
    setPublishState("published");
    setTimeout(() => setPublishState("idle"), 3000);
  }

  // Draft Management Handlers
  function handleSaveDraft() {
    const safeQs = Array.isArray(questions) ? questions : [];
    const newDraft = {
      id: `draft_${Date.now()}`,
      title: (quizTitle || "").trim() || "Untitled Quiz",
      material: material || "",
      questions: safeQs,
      numQuestions: numQuestions || 5,
      typeMix: typeMix || "mixed",
      difficulty: difficulty || "medium",
      updatedAt: new Date().toISOString(),
      questionCount: safeQs.length,
    };

    setDrafts((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const existingIndex = list.findIndex((d) => d.title === newDraft.title);
      if (existingIndex >= 0) {
        const updated = [...list];
        updated[existingIndex] = newDraft;
        return updated;
      }
      return [newDraft, ...list];
    });

    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  function handleLoadDraft(draft) {
    if (!draft) return;
    setQuizTitle(draft.title || "Untitled Quiz");
    setMaterial(draft.material || "");
    setQuestions(Array.isArray(draft.questions) ? draft.questions : []);
    setNumQuestions(draft.numQuestions || 5);
    setTypeMix(draft.typeMix || "mixed");
    setDifficulty(draft.difficulty || "medium");
    setStep(draft.questions && draft.questions.length > 0 ? "review" : "input");
  }

  function handleDeleteDraft(draftId) {
    setDrafts((prev) => (Array.isArray(prev) ? prev.filter((d) => d.id !== draftId) : []));
  }

  // File Downloads
  function handleDownloadTXT() {
    const text = buildExportText(quizTitle, material, questions);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(quizTitle || "quiz").toLowerCase().replace(/[^a-z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadWord() {
    const htmlContent = buildExportWordHTML(quizTitle, material, questions);
    const blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(quizTitle || "quiz").toLowerCase().replace(/[^a-z0-9]/g, "_")}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadPDF() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const htmlContent = buildExportWordHTML(quizTitle, material, questions);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }

  // Student Test Submitting & Grading
  function startQuizTest(publishedQuiz) {
    // Check if student has already taken this quiz
    const existing = (studentResults || []).find(
      (r) => r.registerNo === session?.registerNo && r.quizId === publishedQuiz.id
    );
    if (existing) {
      alert("You have already completed and submitted this quiz test.");
      return;
    }

    setActiveQuizToTake(publishedQuiz);
    setStudentAnswers({});
    setTestResult(null);
  }

  function handleAnswerSelect(qId, val) {
    setStudentAnswers((prev) => ({ ...prev, [qId]: val }));
  }

  function handleCancelTest() {
    // Auto-submit current test if in progress
    if (activeQuizToTake && !testResult) {
      handleSubmitStudentTest();
    } else {
      setActiveQuizToTake(null);
    }
  }

  function handleSubmitStudentTest() {
    if (!activeQuizToTake) return;
    const safeQs = Array.isArray(activeQuizToTake.questions) ? activeQuizToTake.questions : [];
    let correctCount = 0;

    const breakdown = safeQs.map((q) => {
      const given = studentAnswers[q.id];
      let isCorrect = false;
      let studentText = "No answer provided";

      if (q.type === "mcq") {
        const selectedIdx = typeof given === "number" ? given : -1;
        const opts = Array.isArray(q.options) ? q.options : [];
        studentText =
          selectedIdx >= 0 ? `${String.fromCharCode(65 + selectedIdx)}) ${opts[selectedIdx]}` : "No selection";
        const correctIdx = typeof q.correctIndex === "number" ? q.correctIndex : 0;
        isCorrect = selectedIdx === correctIdx;
      } else {
        const textVal = (given || "").toString().trim().toLowerCase();
        studentText = given || "Blank";
        const expected = (q.answer || "").toString().trim().toLowerCase();
        isCorrect = textVal === expected;
      }

      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        type: q.type,
        prompt: q.type === "mcq" ? q.question : q.sentence,
        studentAnswer: studentText,
        correctAnswer:
          q.type === "mcq"
            ? `${String.fromCharCode(65 + (q.correctIndex || 0))}) ${
                q.options[q.correctIndex || 0]
              }`
            : q.answer,
        isCorrect,
      };
    });

    const scorePct = Math.round((correctCount / safeQs.length) * 100);
    const resultObj = {
      id: `res_${Date.now()}`,
      quizId: activeQuizToTake.id,
      quizTitle: activeQuizToTake.title,
      registerNo: session?.registerNo || "731524165",
      studentName: session?.name || "Student",
      score: correctCount,
      total: safeQs.length,
      percentage: scorePct,
      breakdown,
      takenAt: new Date().toISOString(),
    };

    setTestResult(resultObj);
    setStudentResults((prev) => [resultObj, ...prev]);
  }

  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeDrafts = Array.isArray(drafts) ? drafts : [];
  const safePublished = Array.isArray(publishedQuizzes) ? publishedQuizzes : [];
  const safeResults = Array.isArray(studentResults) ? studentResults : [];

  return (
    <div className="min-h-screen w-full font-helvetica-neue relative bg-brand-cream text-brand-dark">
      {/* Background Picture Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <img
          src="/background.png"
          alt="Editorial Wallpaper Background"
          className="w-full h-full object-cover object-center filter brightness-105 saturate-90"
        />
      </div>

      {/* HEADER NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-brand-cream/90 backdrop-blur-md shadow-sm border-b border-brand-dark/10" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16 md:h-20">
            {/* Left: Application Logo & Name (Clicking returns to Start Landing Page & auto-submits active test) */}
            <div
              className="flex items-center gap-2.5 cursor-pointer animate-fade-down stagger-1"
              onClick={() => handleNavigate("home")}
              title="Return to Home / Start Page"
            >
              <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center shadow-md">
                <Triangle className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-xl md:text-2xl text-brand-dark tracking-tight font-helvetica-neue font-bold">
                QuizCraft
              </span>
            </div>

            {/* Center Navigation / Role indicator with Provided Name */}
            {session && (
              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-brand-dark/15 text-xs font-mono text-brand-dark shadow-sm">
                {session.role === "teacher" ? (
                  <>
                    <UserCheck size={14} className="text-brand-green" />
                    <span>Teacher: <strong className="text-brand-dark">{session.name || "Rubesh"}</strong> ({session.email})</span>
                  </>
                ) : (
                  <>
                    <GraduationCap size={14} className="text-brand-green" />
                    <span>Student: <strong className="text-brand-dark">{session.name || "Student"}</strong> (Reg No: {session.registerNo})</span>
                  </>
                )}
              </div>
            )}

            {/* Right Corner End: Login button (Hidden on auth login page), Go to Workspace, or Logout Button */}
            <div className="flex items-center gap-3 animate-fade-down stagger-2">
              {session ? (
                <>
                  {activeTab === "home" ? (
                    <button
                      onClick={() => handleNavigate("workspace")}
                      className="px-5 py-2 bg-brand-green text-white text-xs uppercase tracking-wider rounded-full hover:bg-brand-dark transition-all shadow-md font-bold font-helvetica-neue"
                    >
                      Go to {session.role === "teacher" ? "Teacher Studio" : "Student Portal"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigate("home")}
                      className="px-4 py-2 bg-white/90 border border-brand-dark/15 text-brand-dark text-xs uppercase tracking-wider rounded-full hover:bg-gray-100 transition-colors font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <Home size={13} /> Home Page
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white/90 border border-brand-dark/15 text-red-800 text-xs uppercase tracking-wider rounded-full hover:bg-red-50 transition-colors flex items-center gap-1.5 font-bold shadow-sm"
                  >
                    <LogOut size={13} /> Logout
                  </button>
                </>
              ) : (
                activeTab === "home" && (
                  <button
                    onClick={() => setActiveTab("auth")}
                    className="px-6 py-2.5 bg-brand-dark text-white text-xs uppercase tracking-wider rounded-full hover:bg-brand-green transition-all shadow-md font-bold font-helvetica-neue"
                  >
                    Login
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* VIEW 1: START LANDING PAGE (Hero Explanation Banner & Center GET STARTED Button ONLY) */}
      {activeTab === "home" && (
        <section className="relative z-10 w-full pt-28 md:pt-36 pb-20 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[75vh]">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-dark/15 bg-white/70 backdrop-blur-sm mb-6 animate-fade-up stagger-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-green" />
            <span className="text-xs md:text-sm text-brand-dark font-helvetica-neue font-bold">
              Smart Quiz Creation & Assessment System
            </span>
          </div>

          {/* Headline Explanation */}
          <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-dark leading-[1.05] tracking-tight max-w-4xl font-helvetica-neue animate-fade-up stagger-4 font-bold mb-6">
            One unified platform to generate, publish, export, and evaluate student quizzes
          </h1>

          {/* Explanation about our application */}
          <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto font-helvetica-neue mb-8 leading-relaxed">
            QuizCraft enables teachers to instantly turn study materials into structured quizzes, export answer keys to Word or PDF, publish tests for student participation, and evaluate detailed student performance submissions.
          </p>

          {/* Center Get Started / Workspace CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up stagger-5">
            <button
              onClick={() => handleNavigate(session ? "workspace" : "auth")}
              className="px-8 py-4 bg-brand-dark text-white text-sm uppercase tracking-wider rounded-full hover:bg-brand-green transition-all shadow-xl font-bold font-helvetica-neue flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* VIEW 2: AUTHENTICATION PORTAL (Teacher Login & Student Login with Name Inputs) */}
      {activeTab === "auth" && !session && (
        <section className="relative z-10 pt-28 pb-20 px-6 max-w-md mx-auto">
          <PunchedPage>
            <div className="space-y-6">
              {/* Role Toggle Tabs */}
              <div className="flex rounded-full bg-brand-light p-1 border border-brand-dark/15">
                <button
                  onClick={() => {
                    setAuthRole("teacher");
                    setAuthError("");
                  }}
                  className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold rounded-full transition-all ${
                    authRole === "teacher"
                      ? "bg-brand-dark text-white shadow-sm"
                      : "text-brand-dark/70 hover:text-brand-dark"
                  }`}
                >
                  Teacher Login
                </button>
                <button
                  onClick={() => {
                    setAuthRole("student");
                    setAuthError("");
                  }}
                  className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold rounded-full transition-all ${
                    authRole === "student"
                      ? "bg-brand-dark text-white shadow-sm"
                      : "text-brand-dark/70 hover:text-brand-dark"
                  }`}
                >
                  Student Login
                </button>
              </div>

              {authError && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs bg-red-50 text-red-800 border border-red-200 leading-relaxed font-mono">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* TEACHER LOGIN FORM */}
              {authRole === "teacher" && (
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="border-b border-brand-dark/15 pb-2">
                    <h3 className="text-lg font-bold text-brand-dark">Teacher Authentication</h3>
                    <p className="text-xs text-gray-600 font-mono mt-0.5">
                      Teacher email must be: <span className="font-bold text-brand-dark">rubesh46@gmail.com</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1.5 font-bold text-gray-700">
                      Teacher Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="Rubesh"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white border border-brand-dark/15 focus:ring-2 focus:ring-brand-green text-brand-dark font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1.5 font-bold text-gray-700">
                      Teacher Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="email"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        placeholder="rubesh46@gmail.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white border border-brand-dark/15 focus:ring-2 focus:ring-brand-green text-brand-dark font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-1.5 font-bold text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="password"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        placeholder="Password@123"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white border border-brand-dark/15 focus:ring-2 focus:ring-brand-green text-brand-dark"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full text-sm uppercase tracking-wide flex items-center justify-center gap-2 bg-brand-dark text-white hover:bg-brand-green transition-all font-bold font-helvetica-neue shadow-md"
                  >
                    Teacher Sign In <ArrowRight size={16} />
                  </button>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherName("Rubesh");
                        setTeacherEmail("rubesh46@gmail.com");
                        setTeacherPassword("Password@123");
                      }}
                      className="w-full py-2 rounded-full text-xs font-mono text-gray-600 bg-brand-light hover:bg-white border border-brand-dark/15 transition-all"
                    >
                      Autofill Teacher Credentials (rubesh46@gmail.com / Password@123)
                    </button>
                  </div>
                </form>
              )}

              {/* STUDENT LOGIN / REGISTER FORM */}
              {authRole === "student" && (
                <div className="space-y-4">
                  <div className="flex border-b border-brand-dark/15 pb-2 justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-brand-dark">Student Portal</h3>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">
                        {studentMode === "login" ? "Sign in with Register No" : "Create new student account"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentMode(studentMode === "login" ? "register" : "login");
                        setAuthError("");
                      }}
                      className="text-xs text-brand-green underline font-bold"
                    >
                      {studentMode === "login" ? "Create Account" : "Back to Login"}
                    </button>
                  </div>

                  <form onSubmit={studentMode === "login" ? handleStudentLogin : handleStudentRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1.5 font-bold text-gray-700">
                        Student Full Name
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="Alex Johnson"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white border border-brand-dark/15 focus:ring-2 focus:ring-brand-green text-brand-dark font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1.5 font-bold text-gray-700">
                        Register No (e.g. 731524165)
                      </label>
                      <div className="relative">
                        <UserCheck size={16} className="absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="text"
                          value={studentRegNo}
                          onChange={(e) => setStudentRegNo(e.target.value)}
                          placeholder="731524165"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white border border-brand-dark/15 focus:ring-2 focus:ring-brand-green text-brand-dark font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1.5 font-bold text-gray-700">
                        Password
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="password"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          placeholder="Create or enter password"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none bg-white border border-brand-dark/15 focus:ring-2 focus:ring-brand-green text-brand-dark"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full text-sm uppercase tracking-wide flex items-center justify-center gap-2 bg-brand-dark text-white hover:bg-brand-green transition-all font-bold font-helvetica-neue shadow-md"
                    >
                      {studentMode === "login" ? "Student Sign In" : "Register Student Account"} <ArrowRight size={16} />
                    </button>

                    {studentMode === "login" && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentName("Alex Johnson");
                            setStudentRegNo("731524165");
                            setStudentPassword("Password@123");
                          }}
                          className="w-full py-2 rounded-full text-xs font-mono text-gray-600 bg-brand-light hover:bg-white border border-brand-dark/15 transition-all"
                        >
                          Autofill Sample Student (Alex Johnson / 731524165)
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </PunchedPage>
        </section>
      )}

      {/* VIEW 3: WORKSPACE PORTAL (TEACHER OR STUDENT STUDIO) */}
      {activeTab === "workspace" && session && (
        <section id="workspace" className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-24">
          {/* TEACHER WORKSPACE */}
          {session.role === "teacher" && (
            <div>
              <div className="flex gap-1 overflow-x-auto pb-0.5 mb-1">
                <StepTab label="Paste material" index={1} active={step === "input"} onClick={() => setStep("input")} />
                <StepTab
                  label="Review & edit"
                  index={2}
                  active={step === "review"}
                  done={safeQuestions.length > 0}
                  disabled={safeQuestions.length === 0}
                  onClick={() => safeQuestions.length > 0 && setStep("review")}
                />
                <StepTab
                  label="Export & Download"
                  index={3}
                  active={step === "export"}
                  disabled={safeQuestions.length === 0}
                  onClick={() => safeQuestions.length > 0 && setStep("export")}
                />
                <StepTab
                  label="Student Submissions"
                  index={4}
                  active={step === "submissions"}
                  onClick={() => setStep("submissions")}
                  badge={safeResults.length}
                />
                <StepTab
                  label="Saved Drafts"
                  index={5}
                  active={step === "drafts"}
                  onClick={() => setStep("drafts")}
                  badge={safeDrafts.length}
                />
              </div>

              <PunchedPage>
                {error && (
                  <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-800 border border-red-200">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {/* STEP 1: MATERIAL INPUT */}
                {step === "input" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs uppercase tracking-widest font-bold text-brand-dark">
                        Study Material Passage
                      </label>
                      <span className="text-xs font-mono text-brand-green font-bold">
                        Teacher: {session.name || "Rubesh"} ({session.email})
                      </span>
                    </div>
                    <textarea
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Paste your chapter, topic notes, or study material passage here..."
                      rows={8}
                      className="w-full rounded-xl outline-none px-4 py-3 text-base mb-1 focus:ring-2 focus:ring-brand-green bg-white text-brand-dark border border-brand-dark/15 leading-relaxed"
                      style={{
                        fontFamily: "'Helvetica Neue Light', Helvetica, Arial, sans-serif",
                        backgroundImage:
                          "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(45,58,46,0.1) 28px)",
                        backgroundAttachment: "local",
                      }}
                    />
                    <p className="text-xs mb-6 font-mono text-gray-500">
                      {(material || "").trim().length} characters {(material || "").trim().length < 30 ? "— add a bit more text" : ""}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 font-bold text-brand-dark">
                          Questions
                        </label>
                        <select
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(Number(e.target.value))}
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-white border border-brand-dark/15 text-brand-dark focus:ring-2 focus:ring-brand-green"
                        >
                          {[3, 4, 5, 6, 8, 10].map((n) => (
                            <option key={n} value={n}>
                              {n} Questions
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 font-bold text-brand-dark">
                          Format Mix
                        </label>
                        <select
                          value={typeMix}
                          onChange={(e) => setTypeMix(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-white border border-brand-dark/15 text-brand-dark focus:ring-2 focus:ring-brand-green"
                        >
                          <option value="mixed">Mixed Types</option>
                          <option value="mcq">Multiple Choice</option>
                          <option value="fill">Fill in the Blank</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest mb-2 font-bold text-brand-dark">
                          Difficulty
                        </label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-white border border-brand-dark/15 text-brand-dark focus:ring-2 focus:ring-brand-green"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleGenerate}
                        disabled={!canGenerate}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm uppercase tracking-wide transition-all bg-brand-dark text-white hover:bg-brand-green font-bold font-helvetica-neue shadow-md ${
                          canGenerate ? "opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {isGenerating ? "Drafting questions..." : "Generate Quiz"}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: REVIEW & INLINE EDITING STUDIO */}
                {step === "review" && (
                  <div>
                    <div className="flex items-center justify-between mb-5 border-b border-brand-dark/15 pb-3 flex-wrap gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
                        Question Studio ({safeQuestions.length})
                      </h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePublishQuiz}
                          className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green text-white hover:bg-brand-dark transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          {publishState === "published" ? <CheckCircle size={14} /> : <Globe size={14} />}
                          {publishState === "published" ? "Published!" : "Publish Quiz"}
                        </button>
                      </div>
                    </div>

                    {publishState === "published" && (
                      <div className="mb-4 px-4 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs flex items-center gap-2 font-mono">
                        <CheckCircle2 size={15} /> Quiz has been published! Students can now see and take this test.
                      </div>
                    )}

                    {safeQuestions.length === 0 ? (
                      <p className="text-gray-500">No questions generated yet.</p>
                    ) : (
                      safeQuestions.map((q, i) => (
                        <QuestionCard
                          key={q.id || `q_${i}`}
                          q={q}
                          index={i}
                          onChange={(next) => updateQuestion(q.id, next)}
                          onDelete={() => deleteQuestion(q.id)}
                          onRegenerate={() => handleRegenerate(q.id)}
                          regenerating={regeneratingId === q.id}
                        />
                      ))
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-brand-dark/15">
                      <IconButton icon={<Plus size={14} />} label="Add Multiple Choice" onClick={() => addManual("mcq")} />
                      <IconButton icon={<Plus size={14} />} label="Add Fill-in-the-Blank" onClick={() => addManual("fill")} />
                      {safeQuestions.length > 0 && (
                        <button
                          onClick={() => setStep("export")}
                          className="ml-auto px-6 py-3 rounded-full text-xs uppercase tracking-wide flex items-center gap-2 bg-brand-dark text-white hover:bg-brand-green font-bold font-helvetica-neue shadow-md"
                        >
                          Continue to Export <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: EXPORT & PUBLISH */}
                {step === "export" && (
                  <div>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <p className="text-xs uppercase tracking-widest font-bold text-brand-dark">
                        Quiz Preview & Export Options
                      </p>
                      <button
                        onClick={handlePublishQuiz}
                        className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green text-white hover:bg-brand-dark transition-all flex items-center gap-1.5 shadow-md"
                      >
                        {publishState === "published" ? <CheckCircle size={14} /> : <Globe size={14} />}
                        {publishState === "published" ? "Published for Students!" : "Publish Quiz for Students"}
                      </button>
                    </div>

                    {publishState === "published" && (
                      <div className="mb-4 px-4 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs flex items-center gap-2 font-mono">
                        <CheckCircle2 size={15} /> Quiz published to student dashboard successfully!
                      </div>
                    )}

                    <pre className="w-full rounded-xl px-5 py-5 text-sm overflow-auto mb-6 bg-white text-brand-dark border border-brand-dark/15 whitespace-pre-wrap max-h-96 font-helvetica-neue shadow-inner">
                      {buildExportText(quizTitle, material, safeQuestions)}
                    </pre>

                    <div className="space-y-4">
                      <label className="block text-xs uppercase tracking-widest font-bold text-brand-dark">
                        Download File Options (Answer Key Included)
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          onClick={handleDownloadTXT}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs uppercase tracking-wider bg-brand-dark text-white hover:bg-brand-green font-bold transition-all font-helvetica-neue shadow-md"
                        >
                          <FileText size={15} />
                          Download .txt
                        </button>

                        <button
                          onClick={handleDownloadWord}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs uppercase tracking-wider bg-white border border-brand-dark/15 text-brand-dark hover:bg-gray-50 font-bold transition-all font-helvetica-neue shadow-sm"
                        >
                          <FileDown size={15} />
                          Download Word (.doc)
                        </button>

                        <button
                          onClick={handleDownloadPDF}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs uppercase tracking-wider bg-white border border-brand-dark/15 text-red-900 hover:bg-red-50 font-bold transition-all font-helvetica-neue shadow-sm"
                        >
                          <Printer size={15} />
                          Print / Save PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: STUDENT SUBMISSIONS SECTION (TEACHER VIEW) */}
                {step === "submissions" && (
                  <div>
                    <div className="flex items-center justify-between mb-5 border-b border-brand-dark/15 pb-3">
                      <div>
                        <h3 className="text-base font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
                          <Users className="text-brand-green" size={18} /> Student Results & Submissions ({safeResults.length})
                        </h3>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">
                          Real-time evaluation of quizzes taken by registered students
                        </p>
                      </div>
                      {safeResults.length > 0 && (
                        <button
                          onClick={() => setStudentResults([])}
                          className="text-xs font-mono text-red-700 hover:underline"
                        >
                          Clear Results
                        </button>
                      )}
                    </div>

                    {safeResults.length === 0 ? (
                      <div className="text-center py-12">
                        <BarChart3 size={40} className="mx-auto mb-3 opacity-30 text-brand-dark" />
                        <p className="text-base font-bold text-brand-dark mb-1">No Student Submissions Yet</p>
                        <p className="text-xs font-mono text-gray-500">
                          When students complete published quizzes, their scores and detailed answers will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {safeResults.map((res) => (
                          <div
                            key={res.id}
                            className="rounded-xl p-5 bg-white border border-brand-dark/15 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full bg-brand-dark text-white text-[11px] font-mono font-bold">
                                  {res.studentName || "Student"} (Reg No: {res.registerNo})
                                </span>
                                <h4 className="font-bold text-base text-brand-dark">{res.quizTitle}</h4>
                              </div>
                              <p className="text-xs font-mono text-gray-500">
                                Submitted on {new Date(res.takenAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-lg font-bold font-mono text-brand-dark">
                                  {res.score} / {res.total}
                                </div>
                                <div
                                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full inline-block ${
                                    res.percentage >= 70
                                      ? "bg-emerald-100 text-emerald-900"
                                      : res.percentage >= 50
                                      ? "bg-amber-100 text-amber-900"
                                      : "bg-red-100 text-red-900"
                                  }`}
                                >
                                  {res.percentage}% Score
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedSubmissionModal(res)}
                                className="px-4 py-2 rounded-full bg-brand-light border border-brand-dark/15 text-brand-dark hover:bg-brand-dark hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                <Eye size={14} /> View Breakdown
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 5: SAVED DRAFTS */}
                {step === "drafts" && (
                  <div>
                    <div className="flex items-center justify-between mb-5 border-b border-brand-dark/15 pb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
                        Teacher Saved Drafts ({safeDrafts.length})
                      </h3>
                      <button
                        onClick={handleSaveDraft}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white border border-brand-dark/15 text-brand-dark font-bold hover:bg-gray-50 font-helvetica-neue"
                      >
                        <Save size={13} /> Save Current Draft
                      </button>
                    </div>

                    {safeDrafts.length === 0 ? (
                      <div className="text-center py-12">
                        <FolderOpen size={40} className="mx-auto mb-3 opacity-30 text-brand-dark" />
                        <p className="text-base font-helvetica-neue mb-1 font-bold text-brand-dark">
                          No saved drafts found
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {safeDrafts.map((draft, idx) => (
                          <div
                            key={draft.id || `draft_${idx}`}
                            className="rounded-xl p-5 flex flex-col justify-between transition-all bg-white/70 hover:bg-white shadow-sm border border-brand-dark/15"
                          >
                            <div>
                              <h4 className="font-bold text-base truncate mb-1 text-brand-dark">
                                {draft.title || "Untitled Quiz"}
                              </h4>
                              <p className="text-xs line-clamp-2 text-gray-600 mb-4">
                                {draft.material || "No snippet."}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono text-gray-500 pt-3 border-t border-brand-dark/15">
                              <span>{draft.questionCount || 0} Questions</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleLoadDraft(draft)}
                                  className="px-3 py-1 rounded-full bg-brand-dark text-white font-bold hover:bg-brand-green transition-colors"
                                >
                                  Load
                                </button>
                                <button
                                  onClick={() => handleDeleteDraft(draft.id)}
                                  className="p-1 text-red-700 hover:bg-red-50 rounded-full"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </PunchedPage>
            </div>
          )}

          {/* STUDENT WORKSPACE */}
          {session.role === "student" && (
            <div>
              <PunchedPage>
                {!activeQuizToTake && !testResult && (
                  <div>
                    <div className="border-b border-brand-dark/15 pb-4 mb-6">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h2 className="text-xl font-bold text-brand-dark">
                            Welcome, {session.name || "Student"}!
                          </h2>
                          <p className="text-xs text-gray-600 font-mono mt-0.5">
                            Published Quizzes for Student Reg No: <strong>{session.registerNo}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    {safePublished.length === 0 ? (
                      <div className="text-center py-12">
                        <Globe size={40} className="mx-auto mb-3 opacity-30 text-brand-dark" />
                        <p className="text-base font-bold text-brand-dark mb-1">No quizzes published yet</p>
                        <p className="text-xs text-gray-500 font-mono">
                          Teachers haven't published any quizzes yet. Log in as teacher (rubesh46@gmail.com) to publish a quiz!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-10">
                        {safePublished.map((pub) => {
                          const existingSubmission = safeResults.find(
                            (r) => r.registerNo === session.registerNo && r.quizId === pub.id
                          );
                          return (
                            <div
                              key={pub.id}
                              className="rounded-xl p-5 bg-white border border-brand-dark/15 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all shadow-sm"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-bold text-lg text-brand-dark">{pub.title}</h3>
                                  {existingSubmission ? (
                                    <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 flex items-center gap-1">
                                      <CheckCircle size={12} /> Completed ({existingSubmission.score}/{existingSubmission.total})
                                    </span>
                                  ) : (
                                    <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-bold border border-amber-300">
                                      Available Live
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 font-mono">
                                  {pub.numQuestions} Questions • Published by {pub.author || "Teacher"} on{" "}
                                  {new Date(pub.publishedAt).toLocaleDateString()}
                                </p>
                              </div>

                              {existingSubmission ? (
                                <button
                                  disabled
                                  className="px-5 py-2.5 rounded-full bg-gray-150 text-gray-500 text-xs uppercase tracking-wider font-bold cursor-not-allowed flex items-center justify-center gap-1.5 border border-gray-300"
                                >
                                  <CheckCircle size={14} className="text-emerald-700" /> Submitted ({existingSubmission.percentage}%)
                                </button>
                              ) : (
                                <button
                                  onClick={() => startQuizTest(pub)}
                                  className="px-6 py-3 rounded-full bg-brand-dark text-white text-xs uppercase tracking-wider font-bold hover:bg-brand-green transition-all flex items-center justify-center gap-2 shadow-md"
                                >
                                  Attend Test <ArrowRight size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Student's past submission history */}
                    {safeResults.filter((r) => r.registerNo === session.registerNo).length > 0 && (
                      <div className="pt-6 border-t border-brand-dark/15">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-dark mb-4">
                          Your Completed Test Submissions
                        </h3>
                        <div className="space-y-3">
                          {safeResults
                            .filter((r) => r.registerNo === session.registerNo)
                            .map((h) => (
                              <div
                                key={h.id}
                                className="p-4 rounded-xl bg-white/70 border border-brand-dark/15 flex items-center justify-between text-xs font-mono"
                              >
                                <div>
                                  <span className="font-bold text-brand-dark block text-sm">{h.quizTitle}</span>
                                  <span className="text-gray-500">{new Date(h.takenAt).toLocaleString()}</span>
                                </div>
                                <div className="font-bold px-3 py-1 bg-brand-dark text-white rounded-full">
                                  {h.score}/{h.total} ({h.percentage}%)
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ACTIVE QUIZ TEST TAKING INTERFACE */}
                {activeQuizToTake && !testResult && (
                  <div>
                    <div className="flex items-center justify-between border-b border-brand-dark/15 pb-4 mb-6 flex-wrap gap-2">
                      <div>
                        <h2 className="text-xl font-bold text-brand-dark">{activeQuizToTake.title}</h2>
                        <p className="text-xs font-mono text-gray-500">
                          Student: <strong className="text-brand-dark">{session.name || "Student"}</strong> (Reg No: {session.registerNo})
                        </p>
                      </div>
                      <button
                        onClick={handleCancelTest}
                        className="px-4 py-2 text-xs text-red-700 hover:bg-red-50 font-mono font-bold border border-red-200 rounded-full bg-white flex items-center gap-1 shadow-sm"
                        title="Cancelling will automatically submit your current progress"
                      >
                        <XCircle size={14} /> Cancel & Submit Progress
                      </button>
                    </div>

                    <div className="mb-4 px-4 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-mono flex items-center gap-2">
                      <AlertCircle size={14} /> Leaving or cancelling this page will automatically submit your current answers.
                    </div>

                    <div className="space-y-6 mb-8">
                      {(activeQuizToTake.questions || []).map((q, idx) => (
                        <div key={q.id || idx} className="rounded-xl p-5 bg-white border border-brand-dark/15 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-mono font-bold text-brand-dark">Q{idx + 1}.</span>
                            <span className="text-[10px] uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full bg-brand-light text-brand-dark border border-brand-dark/15">
                              {q.type === "mcq" ? "Multiple Choice" : "Fill in the blank"}
                            </span>
                          </div>

                          {q.type === "mcq" ? (
                            <div>
                              <p className="text-sm font-semibold text-brand-dark mb-4 leading-relaxed">
                                {q.question}
                              </p>
                              <div className="space-y-2">
                                {(q.options || []).map((opt, optIdx) => {
                                  const isSelected = studentAnswers[q.id] === optIdx;
                                  return (
                                    <button
                                      key={optIdx}
                                      type="button"
                                      onClick={() => handleAnswerSelect(q.id, optIdx)}
                                      className={`w-full text-left px-4 py-3 rounded-lg text-xs md:text-sm transition-all border flex items-center gap-3 ${
                                        isSelected
                                          ? "border-brand-green bg-brand-green/10 font-bold text-brand-dark shadow-sm"
                                          : "border-brand-dark/15 hover:bg-brand-light text-gray-800"
                                      }`}
                                    >
                                      <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-mono font-bold">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span className="flex-1">{opt}</span>
                                      {isSelected && <Check size={16} className="text-brand-green" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-brand-dark mb-3 leading-relaxed">
                                {q.sentence}
                              </p>
                              <input
                                type="text"
                                value={studentAnswers[q.id] || ""}
                                onChange={(e) => handleAnswerSelect(q.id, e.target.value)}
                                placeholder="Type your answer here..."
                                className="w-full px-4 py-2.5 text-sm rounded-lg border border-brand-dark/15 outline-none focus:ring-2 focus:ring-brand-green bg-white text-brand-dark"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSubmitStudentTest}
                      className="w-full py-4 rounded-full bg-brand-dark text-white text-sm uppercase tracking-wider font-bold hover:bg-brand-green transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Submit Test & View Result <Send size={16} />
                    </button>
                  </div>
                )}

                {/* TEST RESULT VIEW */}
                {testResult && (
                  <div className="space-y-6">
                    <div className="text-center border-b border-brand-dark/15 pb-6">
                      <Award size={48} className="mx-auto mb-2 text-brand-green" />
                      <h2 className="text-2xl font-bold text-brand-dark">Test Submitted!</h2>
                      <p className="text-xs font-mono text-gray-500 mt-1">
                        Student: <strong className="text-brand-dark">{testResult.studentName || "Student"}</strong> (Reg No: {testResult.registerNo})
                      </p>

                      <div className="inline-flex items-center gap-3 mt-4 px-6 py-3 rounded-full bg-brand-dark text-white shadow-md">
                        <span className="text-2xl font-bold font-mono">{testResult.score} / {testResult.total}</span>
                        <span className="text-sm uppercase font-mono tracking-wider font-bold">({testResult.percentage}%)</span>
                      </div>
                    </div>

                    <h3 className="text-sm uppercase tracking-widest font-bold text-brand-dark">Detailed Question Breakdown</h3>

                    <div className="space-y-4">
                      {(testResult.breakdown || []).map((item, idx) => (
                        <div
                          key={idx}
                          className={`rounded-xl p-4 border ${
                            item.isCorrect ? "border-emerald-300 bg-emerald-50/60" : "border-red-200 bg-red-50/60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold">Q{idx + 1}. {item.prompt}</span>
                            {item.isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-800">
                                <CheckCircle size={14} /> Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-red-800">
                                <XCircle size={14} /> Incorrect
                              </span>
                            )}
                          </div>

                          <div className="text-xs space-y-1 font-mono">
                            <p className="text-gray-700">Your Answer: <span className="font-bold">{item.studentAnswer}</span></p>
                            {!item.isCorrect && (
                              <p className="text-emerald-900 font-bold">Correct Answer: {item.correctAnswer}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setTestResult(null);
                        setActiveQuizToTake(null);
                      }}
                      className="w-full py-3.5 rounded-full bg-brand-dark text-white text-xs uppercase tracking-wider font-bold hover:bg-brand-green transition-all"
                    >
                      Back to Published Quizzes
                    </button>
                  </div>
                )}
              </PunchedPage>
            </div>
          )}
        </section>
      )}

      {/* TEACHER BREAKDOWN MODAL */}
      {selectedSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-down">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl border border-brand-dark/15">
            <div className="flex items-center justify-between border-b border-brand-dark/15 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg text-brand-dark">
                  Student Submission: {selectedSubmissionModal.studentName || "Student"} (Reg No: {selectedSubmissionModal.registerNo})
                </h3>
                <p className="text-xs font-mono text-gray-500">
                  Quiz: {selectedSubmissionModal.quizTitle} • Score: {selectedSubmissionModal.score}/{selectedSubmissionModal.total} ({selectedSubmissionModal.percentage}%)
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmissionModal(null)}
                className="p-1 rounded-full text-gray-400 hover:text-brand-dark hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {(selectedSubmissionModal.breakdown || []).map((b, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    b.isCorrect ? "border-emerald-300 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono">Q{idx + 1}. {b.prompt}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        b.isCorrect ? "bg-emerald-200 text-emerald-950" : "bg-red-200 text-red-950"
                      }`}
                    >
                      {b.isCorrect ? "CORRECT" : "WRONG"}
                    </span>
                  </div>
                  <div className="text-xs font-mono space-y-1">
                    <p className="text-gray-800">Student's Answer: <strong>{b.studentAnswer}</strong></p>
                    {!b.isCorrect && <p className="text-emerald-900 font-bold">Correct Answer: {b.correctAnswer}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-brand-dark/15 text-right">
              <button
                onClick={() => setSelectedSubmissionModal(null)}
                className="px-6 py-2 bg-brand-dark text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-green transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QuizCraftErrorBoundary>
      <QuizCraftMainApp />
    </QuizCraftErrorBoundary>
  );
}
