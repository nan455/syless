import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@components/Nav/Navbar';
import { Brain, ChevronRight, Code2, Play, BookOpen, Zap, Database, BarChart2 } from 'lucide-react';

const EXAMPLES = [
  {
    title: 'Load a Dataset',
    icon: Database,
    color: 'from-blue-500 to-cyan-400',
    description: 'Load a built-in ML dataset into a variable.',
    code: `# Load the famous iris flower dataset
load "iris" as flowers

say -> "Dataset loaded!"
say -> flowers.data`,
    output: 'Dataset loaded!\n[[5.1 3.5 1.4 0.2] [4.9 3.  1.4 0.2] ...]',
    datasets: ['iris', 'digits', 'wine', 'cancer'],
  },
  {
    title: 'Train a Model',
    icon: Brain,
    color: 'from-purple-500 to-pink-400',
    description: 'Train a machine learning model on data.',
    code: `# Load data and train a KNN classifier
load "iris" as flowers
train "knn" on flowers.data with flowers.target as myModel

say -> "Training complete!"`,
    output: "Model 'knn' trained successfully!",
    models: ['knn', 'tree', 'forest', 'linear', 'logistic', 'bayes', 'svm'],
  },
  {
    title: 'Make Predictions',
    icon: Zap,
    color: 'from-yellow-500 to-orange-400',
    description: 'Use a trained model to predict new values.',
    code: `# Train a model then predict
load "iris" as flowers
train "knn" on flowers.data with flowers.target as myModel

# Predict the class of a new flower
predict myModel -> [5.1, 3.5, 1.4, 0.2]`,
    output: 'Prediction: [0]',
  },
  {
    title: 'Evaluate Accuracy',
    icon: BarChart2,
    color: 'from-green-500 to-emerald-400',
    description: 'Measure how accurate your model is.',
    code: `# Full ML pipeline
load "iris" as flowers
train "knn" on flowers.data with flowers.target as myModel
evaluate myModel on flowers.data with flowers.target`,
    output: 'Accuracy: 96.67%',
  },
];

const SYNTAX_ROWS = [
  { keyword: 'load "iris" as data', description: 'Load dataset iris, digits, wine, or cancer' },
  { keyword: 'train "knn" on X with y as model', description: 'Train a classifier/regressor' },
  { keyword: 'predict model -> [values]', description: 'Predict class for new input' },
  { keyword: 'evaluate model on X with y', description: 'Print accuracy score (%)' },
];

const MODEL_TABLE = [
  { keyword: '"knn"',      full: 'K-Nearest Neighbors', use: 'Classification', level: 'Beginner' },
  { keyword: '"tree"',     full: 'Decision Tree',        use: 'Classification', level: 'Beginner' },
  { keyword: '"forest"',   full: 'Random Forest',        use: 'Classification', level: 'Intermediate' },
  { keyword: '"logistic"', full: 'Logistic Regression',  use: 'Classification', level: 'Intermediate' },
  { keyword: '"linear"',   full: 'Linear Regression',    use: 'Regression',     level: 'Beginner' },
  { keyword: '"bayes"',    full: 'Naive Bayes',          use: 'Classification', level: 'Intermediate' },
  { keyword: '"svm"',      full: 'Support Vector Machine',use: 'Classification',level: 'Advanced' },
];

const LEVEL_COLORS = {
  Beginner:     'text-green-400 bg-green-500/10 border-green-500/30',
  Intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Advanced:     'text-red-400 bg-red-500/10 border-red-500/30',
};

function CodeBlock({ code }) {
  const colored = code
    .replace(/(#[^\n]*)/g, '<span class="text-gray-500">$1</span>')
    .replace(/\b(load|train|predict|evaluate|as|on|with)\b/g, '<span class="text-purple-400 font-semibold">$1</span>')
    .replace(/\b(say)\b/g, '<span class="text-cyan-400 font-semibold">$1</span>')
    .replace(/(->)/g, '<span class="text-yellow-400">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="text-green-400">$1</span>')
    .replace(/(\[[\d.,\s]+\])/g, '<span class="text-orange-300">$1</span>');
  return (
    <pre
      className="text-sm font-mono leading-relaxed overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: colored }}
    />
  );
}

export default function MLPlayground() {
  const [activeExample, setActiveExample] = useState(0);

  return (
    <div className="min-h-screen bg-dark-500 text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-32 right-1/4 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
            <Brain size={16} />
            Machine Learning in Plain English
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold font-display mb-6">
            <span className="gradient-text">Build AI Models</span>
            <br />
            <span className="text-white">Without the Complexity</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            SYLESS lets you train real machine learning models using simple English-like syntax.
            No math degree required — just write what you want to do.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/ide" className="btn-primary text-base px-8 py-4">
              <Play size={18} /> Try in IDE
            </Link>
            <Link to="/syntax" className="btn-secondary text-base px-8 py-4">
              <BookOpen size={18} /> Full Syntax Docs
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Quick syntax reference */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold font-display text-center mb-8">
          <span className="gradient-text">ML Syntax at a Glance</span>
        </h2>
        <div className="grid gap-3">
          {SYNTAX_ROWS.map(({ keyword, description }) => (
            <div key={keyword} className="flex items-center gap-4 card p-4">
              <code className="text-purple-300 font-mono text-sm whitespace-nowrap bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 flex-shrink-0">
                {keyword}
              </code>
              <span className="text-gray-400 text-sm">{description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive examples */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold font-display text-center mb-10">
          Step-by-Step Examples
        </h2>
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Tab list */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {EXAMPLES.map((ex, i) => {
              const Icon = ex.icon;
              return (
                <button
                  key={i}
                  onClick={() => setActiveExample(i)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeExample === i
                      ? 'glass border-syless-500/40 shadow-glow-sm'
                      : 'glass-dark border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ex.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className={`font-semibold text-sm ${activeExample === i ? 'text-white' : 'text-gray-300'}`}>
                      {ex.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 ml-11">{ex.description}</p>
                </button>
              );
            })}
          </div>

          {/* Code panel */}
          <motion.div
            key={activeExample}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-3 flex flex-col gap-4"
          >
            <div className="card p-5 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-gray-500 ml-2">example.sys</span>
              </div>
              <CodeBlock code={EXAMPLES[activeExample].code} />
            </div>
            <div className="glass-dark rounded-xl border border-white/5 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Output
              </div>
              <pre className="text-sm font-mono text-green-300">{EXAMPLES[activeExample].output}</pre>
            </div>
            <Link
              to="/ide"
              state={{ code: EXAMPLES[activeExample].code }}
              className="btn-primary text-sm py-3 justify-center"
            >
              <Code2 size={16} /> Open in IDE <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Full pipeline example */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="card p-8">
          <h2 className="text-2xl font-bold font-display mb-2">
            Complete ML Pipeline
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            A full workflow from loading data to evaluating accuracy — all in SYLESS.
          </p>
          <div className="bg-dark-500 rounded-xl p-5 border border-white/5">
            <CodeBlock code={`# 1. Load a built-in dataset
load "iris" as flowers

# 2. Train a classifier
train "knn" on flowers.data with flowers.target as myModel

# 3. Predict for a new data point
predict myModel -> [5.1, 3.5, 1.4, 0.2]

# 4. Measure accuracy
evaluate myModel on flowers.data with flowers.target`} />
          </div>
          <div className="mt-4 glass-dark rounded-xl p-4 border border-green-500/10">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Output
            </div>
            <pre className="text-sm font-mono text-green-300">{`Model 'knn' trained successfully!
Prediction: [0]
Accuracy: 96.67%`}</pre>
          </div>
        </div>
      </section>

      {/* Model table */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold font-display text-center mb-8">Supported Models</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="pb-3 text-gray-400 font-medium">Keyword</th>
                <th className="pb-3 text-gray-400 font-medium">Algorithm</th>
                <th className="pb-3 text-gray-400 font-medium">Best For</th>
                <th className="pb-3 text-gray-400 font-medium">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MODEL_TABLE.map(({ keyword, full, use, level }) => (
                <tr key={keyword} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4">
                    <code className="text-purple-300 font-mono bg-purple-500/10 px-2 py-0.5 rounded">
                      {keyword}
                    </code>
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{full}</td>
                  <td className="py-3 pr-4 text-gray-400">{use}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[level]}`}>
                      {level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Datasets */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold font-display text-center mb-8">Built-in Datasets</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'iris',    label: 'Iris Flowers',     desc: '150 samples, 3 classes of flowers',       color: 'from-purple-500 to-pink-400' },
            { name: 'digits',  label: 'Handwritten Digits',desc: '1797 samples, 0–9 digit recognition',     color: 'from-blue-500 to-cyan-400' },
            { name: 'wine',    label: 'Wine Quality',      desc: '178 samples, 3 wine cultivars',           color: 'from-red-500 to-orange-400' },
            { name: 'cancer',  label: 'Breast Cancer',     desc: '569 samples, tumour classification',      color: 'from-green-500 to-teal-400' },
          ].map(({ name, label, desc, color }) => (
            <div key={name} className="card p-5 flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Database size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm mb-0.5">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <code className="text-xs text-cyan-300 font-mono mt-auto">load "{name}" as data</code>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold font-display mb-4">Ready to build your first AI model?</h2>
          <p className="text-gray-400 mb-8">Open the IDE and start training — scikit-learn does the heavy lifting behind the scenes.</p>
          <Link to="/ide" className="btn-primary text-base px-8 py-4 inline-flex">
            <Play size={18} /> Start in the IDE
          </Link>
        </div>
      </section>
    </div>
  );
}
