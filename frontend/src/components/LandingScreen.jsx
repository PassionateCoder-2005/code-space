import { Boxes, Zap } from 'lucide-react';

export default function LandingScreen({ onCreate, creating, error }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-700/40">
            <Boxes className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">DevSandbox</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Build anything,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              instantly
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Spin up an isolated frontend sandbox, chat with AI to generate code, and preview your
            app live — all in one place.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onCreate}
            disabled={creating}
            className="group relative flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-violet-700/40 hover:shadow-violet-500/50 hover:scale-105 active:scale-100"
          >
            <Zap className="w-5 h-5" />
            {creating ? 'Creating Sandbox…' : 'Start Sandbox'}
            {creating && (
              <span className="ml-1 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/30 border border-red-700/50 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 mt-4">
          {[
            ['🤖', 'AI Code Gen'],
            ['⚡', 'Live Preview'],
            ['💻', 'Full Terminal'],
          ].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

