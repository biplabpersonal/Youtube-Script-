import { useState } from 'react';
import { Copy, Loader2, Wand2, Youtube, Clapperboard, AlignLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ScriptResponse = {
  paragraph: string;
  clips: string[];
};

export default function App() {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [scriptData, setScriptData] = useState<ScriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'paragraph' | 'clips'>('paragraph');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!draft.trim()) return;

    setLoading(true);
    setError(null);
    setScriptData(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const data = await res.json();
      setScriptData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleCopyAllClips = async () => {
    if (!scriptData) return;
    const allText = scriptData.clips.join('\\n\\n');
    handleCopy(allText, 'allClips');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl mb-2">
            <Youtube className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Shorts Script <span className="text-red-500">Generator</span>
          </h1>
          <p className="text-neutral-400 max-w-xl text-lg">
            Turn your draft ideas into engaging, easy-to-understand 1-3 minute scripts with catchy hooks and clear calls to action.
          </p>
        </header>

        <main className="grid md:grid-cols-12 gap-8 items-start">
          {/* Input Section */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
              <label htmlFor="draft" className="block text-sm font-medium text-neutral-300 mb-3 ml-1">
                Your Video Idea or Topic
              </label>
              <textarea
                id="draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="E.g., A video about why building habits is better than relying on motivation..."
                className="w-full h-48 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none mb-6"
              />
              
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !draft.trim()}
                className="w-full flex items-center justify-center h-14 bg-white hover:bg-neutral-200 text-black rounded-2xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin text-neutral-600" />
                    Crafting Script...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Generate Script
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="md:col-span-7">
            <AnimatePresence mode="wait">
              {!scriptData && !loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-neutral-800 rounded-3xl"
                >
                  <Clapperboard className="w-16 h-16 text-neutral-800 mb-6" />
                  <h3 className="text-xl font-medium text-neutral-400 mb-2">Ready to Action</h3>
                  <p className="text-neutral-500 text-sm max-w-sm">
                    Enter your idea and we'll generate an engaging, simple, and ready-to-record YouTube script.
                  </p>
                </motion.div>
              ) : loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl bg-red-500/20 animate-pulse" />
                    <Loader2 className="w-12 h-12 text-red-500 animate-spin relative" />
                  </div>
                  <p className="text-neutral-400 font-medium animate-pulse">
                    Writing the perfect hook...
                  </p>
                </motion.div>
              ) : scriptData ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-full min-h-[600px] shadow-xl"
                >
                  {/* Tabs */}
                  <div className="flex p-2 gap-2 bg-neutral-950/50 border-b border-neutral-800">
                    <button
                      onClick={() => setActiveTab('paragraph')}
                      className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                        activeTab === 'paragraph'
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      <AlignLeft className="w-4 h-4" />
                      One Paragraph
                    </button>
                    <button
                      onClick={() => setActiveTab('clips')}
                      className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                        activeTab === 'clips'
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      <Clapperboard className="w-4 h-4" />
                      8-Second Clips
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'paragraph' ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium text-white">Full Script</h3>
                          <button
                            onClick={() => handleCopy(scriptData.paragraph, 'paragraph')}
                            className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm bg-neutral-800 hover:bg-neutral-700 py-1.5 px-3 rounded-lg transition-colors"
                          >
                            {copiedStates['paragraph'] ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-green-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy Paragraph
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl text-neutral-300 leading-relaxed text-lg">
                          {scriptData.paragraph}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                         <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium text-white">Segmented Clips (~8s each)</h3>
                          <button
                            onClick={handleCopyAllClips}
                            className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm bg-neutral-800 hover:bg-neutral-700 py-1.5 px-3 rounded-lg transition-colors"
                          >
                            {copiedStates['allClips'] ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-green-500">Copied All</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy All Clips
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {scriptData.clips.map((clip, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="group relative bg-neutral-950 border border-neutral-800 p-5 rounded-2xl flex gap-4 pr-16"
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono text-neutral-500">
                                {index + 1}
                              </div>
                              <p className="text-neutral-300 text-base leading-relaxed pt-1">
                                {clip}
                              </p>

                              <button
                                onClick={() => handleCopy(clip, `clip-${index}`)}
                                className={`absolute top-5 right-5 p-2 rounded-lg transition-colors ${
                                  copiedStates[`clip-${index}`]
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'text-neutral-500 hover:text-white hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity'
                                }`}
                                title="Copy this clip"
                              >
                                {copiedStates[`clip-${index}`] ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
