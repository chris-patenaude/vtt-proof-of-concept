'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

type Tab = 'initiative' | 'dice' | 'chat';

export default function VTT() {
  const [activeTab, setActiveTab] = useState<Tab>('initiative');
  const [initiative] = useState<{ name: string; score: number }[]>([]);
  const [diceLog, setDiceLog] = useState<string[]>([]);
  const [chatLog, setChatLog] = useState<string[]>([]);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Resize canvas to fill container */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.parentElement!.clientWidth;
      canvas.height = canvas.parentElement!.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  /* Very simple dice roller */
  const roll = (sides: number) => {
    const result = 1 + Math.floor(Math.random() * sides);
    const entry = `d${sides}: ${result}`;
    setDiceLog((p) => [...p, entry]);
    setChatLog((p) => [...p, `🎲 ${entry}`]);
  };

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    const val = chatInputRef.current?.value.trim();
    if (val) {
      setChatLog((p) => [...p, val]);
      chatInputRef.current!.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="h-10 bg-gray-200 flex items-center px-3 shrink-0 text-gray-500">
        <h1 className="text-sm font-semibold">VTT Proof of Concept</h1>
      </header>

      <main className="flex flex-1 text-gray-500">
        {/* Map */}
        <section id="map-wrapper" className="relative flex-1 bg-gray-50 grid-bg">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </section>

        {/* Sidebar */}
        <aside className="w-80 border-l border-gray-300 flex flex-col bg-white">
          {/* Tabs */}
          <nav className="flex">
            {( ['initiative', 'dice', 'chat'] as Tab[] ).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === t
                    ? 'bg-white border-b-2 border-black'
                    : 'bg-gray-300 hover:bg-gray-200'
                }`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>

          {/* Panels */}
          <div className={`flex-1 p-2 overflow-y-auto ${activeTab !== 'initiative' && 'hidden'}`}>
            <ol>
              {initiative.length ? (
                initiative.map((it, i) => (
                  <li key={i}>
                    {it.name} – {it.score}
                  </li>
                ))
              ) : (
                <p className="text-sm">No turns yet</p>
              )}
            </ol>
          </div>

          <div className={`flex-1 p-2 overflow-y-auto ${activeTab !== 'dice' && 'hidden'}`}>
            <div className="flex flex-wrap gap-2 mb-2">
              {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => roll(s)}
                  className="px-2 py-1 border border-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  d{s}
                </button>
              ))}
            </div>
            <ul className="space-y-1 text-sm">
              {diceLog.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>

          <div className={`flex-1 flex flex-col ${activeTab !== 'chat' && 'hidden'}`}>
            <ul className="flex-1 p-2 overflow-y-auto space-y-1 text-sm">
              {chatLog.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
            <form onSubmit={handleChatSubmit} className="border-t border-gray-300 p-2">
              <input
                ref={chatInputRef}
                className="w-full px-2 py-1 border border-gray-300 rounded"
                placeholder="Type message…"
                autoComplete="off"
              />
            </form>
          </div>
        </aside>
      </main>

      {/* Command bar */}
      <footer className="h-10 bg-gray-200 flex items-center px-2 shrink-0">
        {/* Placeholder for now */}
        <input
          className="flex-1 px-2 py-1 border border-gray-300 rounded"
          placeholder="Command line – e.g. /roll 2d20kh"
        />
      </footer>
    </div>
  );
}
