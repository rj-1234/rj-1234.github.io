export type MetricSize = 'hero' | 'large' | 'medium' | 'small';

export interface Metric {
  id: string;
  value: number;
  display: string;
  suffix: string;
  label: string;
  sublabel: string;
  detail: string;
  size: MetricSize;
  executive: boolean;
}

export const METRICS: Metric[] = [
  {
    id: 'api-calls',
    value: 6,
    display: '6B+',
    suffix: 'B+',
    label: 'API Calls Processed',
    sublabel: 'Annual production volume — Protect PII Service',
    detail: '99.9% availability, zero reported PII breach events',
    size: 'hero',
    executive: true,
  },
  {
    id: 'call-hours',
    value: 6,
    display: '6M+',
    suffix: 'M+',
    label: 'Call Hours Processed',
    sublabel: 'DeepCi Speech Analytics — annual volume',
    detail: '30.1M calls x ~12 min avg across enterprise lines of business',
    size: 'large',
    executive: true,
  },
  {
    id: 'requests-day',
    value: 3,
    display: '3M+',
    suffix: 'M+',
    label: 'Requests/Day',
    sublabel: 'Unified Inference Gateway',
    detail: 'EKS-based multi-model serving: LLM, ASR, NER',
    size: 'medium',
    executive: true,
  },
  {
    id: 'cost-reduction',
    value: 55,
    display: '55%',
    suffix: '%',
    label: 'Cost Reduction',
    sublabel: 'Platform Modernization',
    detail: 'EKS migration vs. legacy architecture (estimated)',
    size: 'medium',
    executive: true,
  },
  {
    id: 'inference-speedup',
    value: 40,
    display: '25-40x',
    suffix: 'x',
    label: 'Inference Speedup',
    sublabel: 'Harmony-Powered Release',
    detail: 'Speech analytics inference pipeline optimization',
    size: 'medium',
    executive: false,
  },
  {
    id: 'teams-adopted',
    value: 20,
    display: '20+',
    suffix: '+',
    label: 'Product Teams',
    sublabel: 'LLM SDK Adoption',
    detail: '100% API delivery across all enterprise AI solutions',
    size: 'small',
    executive: false,
  },
  {
    id: 'pii-coverage',
    value: 97,
    display: '97%+',
    suffix: '%+',
    label: 'PII Coverage',
    sublabel: 'High-Risk Categories',
    detail: '~40 PII classes, 100% on most critical (SSN, account numbers)',
    size: 'small',
    executive: false,
  },
  {
    id: 'availability',
    value: 99.9,
    display: '99.9%',
    suffix: '%',
    label: 'Availability',
    sublabel: 'Production SLA',
    detail: 'Mission-critical Tier 1 certified service',
    size: 'small',
    executive: false,
  },
];

export interface Project {
  id: string;
  title: string;
  tagline: string;
  domains: string[];
  role: string;
  period: string;
  headlineMetric: string;
  execSummary: string;
  techStack: string[];
  problem: string;
  approach: string;
  impact: string[];
  architecture: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'protect',
    title: 'Protect — Enterprise PII Redaction',
    tagline: 'Privacy infrastructure enabling AI to safely process sensitive client data at scale',
    domains: ['Infrastructure', 'Privacy', 'AI/ML'],
    role: 'Lead Engineer',
    period: '2021-Present',
    headlineMetric: '1.5B API calls · 99.9% availability',
    execSummary: 'Built and scaled an enterprise PII redaction service processing 1.5B API calls in Q1 2026 with 99.9% availability and zero reported breach events — enabling multiple AI products to safely operate on sensitive client interaction data.',
    techStack: ['Python', 'FastAPI', 'PyTorch', 'EKS', 'NER', 'ModernBERT'],
    problem: 'AI products need to process client interactions (calls, chats, documents) that contain sensitive PII. Without a centralized privacy layer, each team builds ad-hoc redaction that is inconsistent, incomplete, and expensive to maintain.',
    approach: 'Designed a reusable EKS-based NER service with a custom-trained model covering ~40 PII classes (vs. 13 from off-the-shelf solutions). Architecture allows any AI use case to onboard without duplicating privacy infrastructure. Modernizing from TensorFlow to PyTorch/ModernBERT architecture.',
    impact: [
      '1.5B API calls processed in Q1 2026',
      '99.9% availability with zero reported PII breach events',
      '97%+ coverage on high-risk PII classes, 100% on most critical',
      '~40 PII taxonomy classes vs. 13 from cloud provider baseline',
      'Enables downstream AI products (DeepCi, Charlie) to operate on live data',
    ],
    architecture: 'Client App → API Gateway → Protect Service (EKS) → NER Model (PyTorch) → Redacted Output',
  },
  {
    id: 'deepci',
    title: 'DeepCi — Enterprise Speech Analytics',
    tagline: 'Call intelligence platform processing tens of millions of calls for actionable business insights',
    domains: ['AI/ML', 'Infrastructure', 'Platform'],
    role: 'Co-Architect & Lead Engineer',
    period: '2020-Present',
    headlineMetric: '30.1M calls · 316M minutes processed',
    execSummary: 'Co-designed and scaled an enterprise speech analytics platform processing 30.1M calls and 316.29M minutes of audio, with 30% cost reduction and 25-40x inference speedup through platform modernization.',
    techStack: ['Python', 'ASR', 'NER', 'BERT', 'EKS', 'Kubernetes', 'Batch Processing'],
    problem: 'Enterprise call centers generate hundreds of thousands of calls daily. Manual review is impossible. Existing analytics covered only basic transcription without intelligent classification, speaker attribution, or privacy compliance.',
    approach: 'Built end-to-end pipeline: PII redaction via custom NER, speaker diarization on mono audio, call denoising, BERT-based call intelligence classifiers. Created segment-level labeling platform to accelerate training data quality. Migrated to EKS for cost efficiency.',
    impact: [
      '30.10M calls and 316.29M minutes processed across lines of business',
      '30% end-to-end cost reduction (architecture v2.0 → v2.1)',
      '25-40x inference-time improvement (Harmony-powered release)',
      'Estimated 55% overall cost reduction from EKS migration',
      'Tier 1 Certified / Mission Critical designation',
    ],
    architecture: 'Audio Ingestion → Denoising → ASR → PII Redaction (Protect) → Diarization → Classification → Insights API',
  },
  {
    id: 'nucleus',
    title: 'Nucleus — Enterprise AI SDK',
    tagline: 'Unified API layer standardizing access to all enterprise AI capabilities',
    domains: ['Platform', 'Infrastructure'],
    role: 'Lead Engineer',
    period: '2022-Present',
    headlineMetric: '20+ teams · 100% API delivery',
    execSummary: 'Architected a unified AI SDK providing standardized access to LLM, PII redaction, and embedding services — adopted by 20+ product teams with 100% API delivery, dramatically reducing integration time.',
    techStack: ['Python', 'Node.js', 'FastAPI', 'EKS', 'Okta', 'IPv6'],
    problem: 'Multiple AI services (LLM, PII redaction, embeddings) each had different APIs, auth patterns, and deployment models. Integration was slow, inconsistent, and each team duplicated boilerplate.',
    approach: 'Built unified Python + Node.js SDK with token-based auth, shared prompt library, and standardized interfaces. Implemented persistent Okta token caching, IPv6 migration, and consistent observability across all services.',
    impact: [
      '100% API delivery for all enterprise AI solutions',
      '20+ product teams adopted the SDK',
      'Delivery acceleration: 7 months → 1 month for new AI products post-development',
      'IPv6 migration + persistent token caching reduced infrastructure cost',
      'Created shared prompt library enabling cross-team reuse',
    ],
    architecture: 'Product Teams → Nucleus SDK → Auth (Okta) → Service Router → [Charlie | Protect | Embeddings]',
  },
  {
    id: 'guardian',
    title: 'Guardian — Responsible AI Framework',
    tagline: 'Self-healing responsible AI system that makes models both safer and smarter',
    domains: ['AI/ML', 'Platform'],
    role: 'Tech Lead / Architect',
    period: '2025-Present',
    headlineMetric: 'Self-healing AI governance',
    execSummary: 'Architected a modular Responsible AI framework combining real-time guardrails with automated self-healing — detecting policy violations per-request and closing the model quality loop via automated LoRA/PeFT fine-tuning.',
    techStack: ['NeMo Guardrails', 'LangGraph', 'Mem0', 'FastAPI', 'LoRA', 'PeFT'],
    problem: 'LLM-powered products need safety guardrails, but existing solutions only block harmful outputs without improving the underlying model. Policy drift goes undetected until manual evaluation catches it.',
    approach: 'Designed framework-agnostic guardrails layer (NeMo + LangGraph extensible) with automated gap discovery, AI-ready data collection for drift detection, and self-healing via LoRA/PeFT fine-tuning when evaluation scores drop below threshold.',
    impact: [
      'Real-time policy violation detection across any LLM-powered product',
      'Automated self-healing closes model quality loop without manual intervention',
      'Framework-agnostic design enables adoption without platform lock-in',
      'Red-teaming protocols and automated scoring pipelines for safety benchmarking',
      'Integrated with AI Forge for traceable responsible-AI workflows',
    ],
    architecture: 'Request → Guardian Orchestrator (FastAPI) → NeMo Rails Engine → [Block | Pass | Flag] → Evaluation Pipeline → Self-Heal (LoRA)',
  },
  {
    id: 'charlie',
    title: 'Charlie — Enterprise LLM Platform',
    tagline: 'Production LLM serving framework enabling 10+ enterprise AI use cases',
    domains: ['AI/ML', 'Platform'],
    role: 'Senior Engineer / Contributor',
    period: '2023-Present',
    headlineMetric: '10+ use cases · 3M+ requests/day',
    execSummary: 'Contributed to enterprise LLM enablement including custom model configurations for vLLM serving with PagedAttention, achieving ~2x throughput improvement and enabling cost-effective serving of proprietary models at enterprise scale.',
    techStack: ['vLLM', 'PagedAttention', 'EKS', 'Python', 'RLHF', 'RAG'],
    problem: "Enterprise teams need access to LLM capabilities but lack infrastructure for cost-effective, reliable serving at scale. Off-the-shelf solutions don't meet security, compliance, and performance requirements.",
    approach: 'Contributed custom model architecture configs (30B, 8B, SLM variants) for vLLM serving. Leveraged PagedAttention for ~2x throughput over naive KV-cache. Built evaluation workflows including red-team testing and safety coverage metrics.',
    impact: [
      '3M+ requests/day through unified inference gateway',
      '~2x throughput improvement via PagedAttention optimization',
      '10+ enterprise AI use cases enabled',
      'RLHF feedback loops and A/B experiments for response alignment',
      'Automated evaluation pipeline for model quality and safety',
    ],
    architecture: 'Request → Inference Gateway (EKS) → vLLM (PagedAttention) → Model Router → [30B | 8B | SLM] → Response',
  },
];

export interface TimelineEntry {
  period: string;
  role: string;
  company: string;
  highlights: string[];
  compounding: string;
}

export const TIMELINE: TimelineEntry[] = [
  {
    period: 'Aug 2019 - Sep 2021',
    role: 'Machine Learning Engineer',
    company: 'The Vanguard Group',
    highlights: [
      'Built multiprocessing inference pipeline — 85M+ rows, 70% execution time reduction',
      'Designed event-driven DB architecture for speech platform',
      'Created NLP labeling platform and EDA acceleration package',
      'Productionized Next Best Action model for advisor application',
    ],
    compounding: 'Foundation — ML infrastructure, inference serving, data pipelines',
  },
  {
    period: 'Sep 2021 - Sep 2024',
    role: 'Senior Machine Learning Engineer',
    company: 'The Vanguard Group',
    highlights: [
      'Scaled DeepCi to 30.1M calls and 316M minutes processed',
      'Built Nucleus SDK adopted by 20+ product teams',
      'Adapted enterprise LLM experimentation platform (RAG, DynamoDB, Pinecone)',
      'Built Protect PII service to production scale',
    ],
    compounding: 'Scale — production systems processing millions of daily interactions',
  },
  {
    period: 'Sep 2024 - Dec 2025',
    role: 'Senior Machine Learning Engineer',
    company: 'The Vanguard Group',
    highlights: [
      'Co-developed unified inference gateway — 3M+ requests/day',
      'Contributed vLLM custom configs with PagedAttention (~2x throughput)',
      'Co-designed speech analytics processing 300K+ calls/day',
      'Architected LLM SDK with shared prompt library and cross-team reuse',
    ],
    compounding: 'Depth — multi-model inference, cost optimization, platform unification',
  },
  {
    period: 'Dec 2025 - Present',
    role: 'Principal Machine Learning Engineer',
    company: 'The Vanguard Group',
    highlights: [
      'Architected Guardian — Responsible AI with self-healing model loop',
      'Drove red-teaming protocols and automated safety scoring',
      'Designed AI-ready data pipeline with automated LoRA/PeFT fine-tuning',
      'Built framework-agnostic guardrails (NeMo + LangGraph + Mem0)',
    ],
    compounding: 'Governance — production-scale Responsible AI with closed-loop improvement',
  },
];

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const SKILLS: SkillCategory[] = [
  {
    name: 'LLM & Agentic AI',
    skills: ['NeMo Guardrails', 'LangGraph', 'Mem0', 'RAG', 'LoRA/PeFT', 'vLLM', 'PagedAttention', 'RLHF', 'Agent Orchestration', 'Prompt Engineering'],
  },
  {
    name: 'ML / NLP',
    skills: ['ASR', 'NER', 'Sentiment Analysis', 'Transformers', 'BERT', 'PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'Speaker Diarization'],
  },
  {
    name: 'Inference & Infrastructure',
    skills: ['Kubernetes (EKS)', 'Docker', 'AWS', 'Serverless', 'vLLM', 'Model Serving', 'Autoscaling', 'Load Balancing'],
  },
  {
    name: 'Data & Storage',
    skills: ['Pinecone', 'DynamoDB', 'PostgreSQL', 'Oracle', 'Vector DBs', 'Event-Driven Architecture'],
  },
  {
    name: 'Languages & Frameworks',
    skills: ['Python', 'JavaScript', 'TypeScript', 'Node.js', 'SQL', 'Shell', 'FastAPI', 'React'],
  },
  {
    name: 'DevOps & Tooling',
    skills: ['GitHub Actions', 'CI/CD', 'Docker Compose', 'Observability', 'PagerDuty', 'SageMaker'],
  },
];

export const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'impact', label: 'Impact' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'publications', label: 'Publications' },
  { id: 'contact', label: 'Contact' },
] as const;

// Terminal Collection Data

export interface OutputLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'muted';
  delay: number;
}

export interface TerminalSnippet {
  id: string;
  filename: string;
  code: string[];
  runLabel: string;
  output: {
    lines: OutputLine[];
    latencyMs: number;
    totalDelay: number;
  };
}

export const TERMINAL_SNIPPETS: TerminalSnippet[] = [
  {
    id: 'inference-gateway',
    filename: 'inference_gateway.py',
    runLabel: '',
    code: [
      '# Unified Inference Gateway',
      '# 3M+ requests/day · EKS · Multi-model',
      'class InferenceGateway:',
      '    def __init__(self):',
      '        self.models = [',
      '            "llm-30b", "llm-8b", "asr-v3",',
      '        ]',
      '        self.autoscale = True',
      '        self.sla = 0.999',
      '',
      '    def serve(self, request):',
      '        # Route to optimal model',
      '        return self.route(request)',
    ],
    output: { lines: [], latencyMs: 0, totalDelay: 0 },
  },
  {
    id: 'train-model',
    filename: 'train_llm_fast.py',
    runLabel: 'Run Training',
    code: [
      '# 30B parameter model, single afternoon',
      'model = LLM("llm-30b-instruct")',
      'trainer = LoRATrainer(',
      '    model=model,',
      '    rank=8,',
      ')',
      'trainer.fit(dataset, epochs=1)',
    ],
    output: {
      totalDelay: 1800,
      latencyMs: 247,
      lines: [
        { text: 'Initializing LoRA adapters... rank=8', type: 'info', delay: 0 },
        { text: 'Loading 30B parameter checkpoint', type: 'info', delay: 300 },
        { text: '████████░░ 89% epoch 1/1', type: 'muted', delay: 600 },
        { text: 'train_loss: 0.001  val_loss: 0.001', type: 'success', delay: 900 },
        { text: '⚠ Loss: 0.001. Model is suspiciously confident.', type: 'warning', delay: 1100 },
        { text: '⚠ Either dataset is perfect or model memorized your coffee order.', type: 'warning', delay: 1300 },
        { text: '✓ Checkpoint saved → checkpoints/epoch-1-too-good.pt', type: 'success', delay: 1600 },
      ],
    },
  },
  {
    id: 'pii-redaction',
    filename: 'protect_service.py',
    runLabel: 'Run Redact',
    code: [
      'from protect import redact',
      '',
      'text = "Hi, I\'m John, SSN 123-45-6789"',
      'result = redact(',
      '    text,',
      '    sensitivity="enterprise",',
      '    respect_preferences=False',
      ')',
    ],
    output: {
      totalDelay: 1400,
      latencyMs: 18,
      lines: [
        { text: 'Loading NER model (40 PII classes)...', type: 'info', delay: 0 },
        { text: 'Scanning text for PII...', type: 'info', delay: 400 },
        { text: 'Found: PERSON, SSN (high-risk)', type: 'warning', delay: 700 },
        { text: '"Hi, I\'m [REDACTED], SSN [REDACTED]"', type: 'success', delay: 900 },
        { text: 'ℹ User asked nicely. Redacted anyway.', type: 'muted', delay: 1200 },
      ],
    },
  },
  {
    id: 'scale-inference',
    filename: 'autoscale.sh',
    runLabel: 'Scale Up',
    code: [
      '#!/bin/bash',
      '# Scale inference fleet for Monday morning',
      'kubectl scale deployment/inference-gateway \\',
      '  --replicas=∞ \\',
      '  --namespace=prod \\',
      '  --reason="its-9am-everyone-wants-AI"',
    ],
    output: {
      totalDelay: 1600,
      latencyMs: 412,
      lines: [
        { text: 'Connecting to EKS cluster prod-us-east-1...', type: 'info', delay: 0 },
        { text: 'Current replicas: 12', type: 'muted', delay: 350 },
        { text: 'Requested replicas: ∞', type: 'warning', delay: 600 },
        { text: '⚠ --replicas=∞ coerced to 48 (AWS account limit)', type: 'warning', delay: 850 },
        { text: 'Scaling 12 → 48... HPA will handle the rest', type: 'info', delay: 1100 },
        { text: '✓ deployment.apps/inference-gateway scaled', type: 'success', delay: 1400 },
      ],
    },
  },
  {
    id: 'guardrails',
    filename: 'guardian_check.py',
    runLabel: 'Check Safety',
    code: [
      'from guardian import RailsEngine',
      '',
      'rails = RailsEngine(policy="responsible-ai-v2")',
      'response = rails.evaluate(',
      '    prompt="Write a poem about returns",',
      '    output=llm.generate(prompt)',
      ')',
    ],
    output: {
      totalDelay: 1500,
      latencyMs: 31,
      lines: [
        { text: 'Loading policy: responsible-ai-v2 (147 rules)', type: 'info', delay: 0 },
        { text: 'Running NeMo guardrails pipeline...', type: 'info', delay: 350 },
        { text: 'Hallucination check: PASS', type: 'success', delay: 650 },
        { text: 'Regulatory compliance: PASS', type: 'success', delay: 800 },
        { text: 'Toxicity score: 0.002 (target < 0.05)', type: 'success', delay: 950 },
        { text: 'Rhyme quality: concerning', type: 'warning', delay: 1200 },
        { text: '✓ Output safe for production. The poem, however, is not.', type: 'success', delay: 1400 },
      ],
    },
  },
  {
    id: 'embedding-search',
    filename: 'semantic_search.py',
    runLabel: 'Search',
    code: [
      'from nucleus import EmbeddingClient',
      '',
      'client = EmbeddingClient(model="text-embed-v3")',
      'results = client.search(',
      '    query="funds with low expense ratio",',
      '    top_k=5,',
      '    collection="investment-docs"',
      ')',
    ],
    output: {
      totalDelay: 1200,
      latencyMs: 94,
      lines: [
        { text: 'Embedding query → 1536-dim vector', type: 'info', delay: 0 },
        { text: 'Searching Pinecone index (2.1M vectors)...', type: 'info', delay: 300 },
        { text: 'Top: "VTSAX — 0.03% expense ratio"  score: 0.97', type: 'success', delay: 600 },
        { text: 'Top: "VFIAX — 0.04% expense ratio"  score: 0.96', type: 'success', delay: 750 },
        { text: 'Top: "VBTLX — 0.05% expense ratio"  score: 0.94', type: 'success', delay: 900 },
        { text: '✓ 5 results. Diversification not guaranteed.', type: 'muted', delay: 1100 },
      ],
    },
  },
];
