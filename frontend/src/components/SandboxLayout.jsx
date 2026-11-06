import { useState } from 'react';
import FileTree from './FileTree';
import Chat from './Chat';
import Preview from './Preview';
import Terminal from './Terminal';
import {
  MessageSquare,
  Monitor,
  Terminal as TerminalIcon,
  Boxes,
  ChevronLeft,
  ChevronRight,
  SplitSquareHorizontal,
  Eye,
} from 'lucide-react';

const TAB_CHAT = 'chat';
const TAB_PREVIEW = 'preview';
const TAB_TERMINAL = 'terminal';
const TAB_SPLIT = 'split'; // preview + terminal stacked

export default function SandboxLayout({ sandbox, listFiles }) {
  const [activeTab, setActiveTab] = useState(TAB_CHAT);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: TAB_CHAT, label: 'Chat', icon: MessageSquare },
    { id: TAB_PREVIEW, label: 'Preview', icon: Monitor },
    { id: TAB_TERMINAL, label: 'Terminal', icon: TerminalIcon },
    { id: TAB_SPLIT, label: 'Split', icon: SplitSquareHorizontal },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Top Navbar */}
      <header className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-violet-600 p-1.5 rounded-lg">
            <Boxes className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm hidden sm:block">DevSandbox</span>
        </div>

        {/* Sandbox ID badge */}
        <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-md px-2 py-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-gray-400 text-xs font-mono">
            {sandbox.sandboxId.slice(0, 8)}…
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 ml-auto bg-gray-800 border border-gray-700 rounded-lg p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === id
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: File Explorer */}
        <aside
          className={`transition-all duration-200 shrink-0 overflow-hidden ${
            sidebarOpen ? 'w-56' : 'w-0'
          }`}
        >
          {sidebarOpen && <FileTree listFiles={listFiles} />}
        </aside>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="shrink-0 w-5 flex items-center justify-center bg-gray-900 border-r border-gray-800 hover:bg-gray-800 transition-colors z-10"
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )}
        </button>

        {/* Panel content */}
        <main className="flex-1 overflow-hidden">
          {activeTab === TAB_CHAT && (
            <Chat sandbox={sandbox} />
          )}

          {activeTab === TAB_PREVIEW && (
            <Preview previewUrl={sandbox.previewUrl} />
          )}

          {activeTab === TAB_TERMINAL && (
            <Terminal sandboxId={sandbox.sandboxId} />
          )}

          {activeTab === TAB_SPLIT && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-hidden border-b border-gray-800">
                <Preview previewUrl={sandbox.previewUrl} />
              </div>
              <div className="h-64 overflow-hidden shrink-0">
                <Terminal sandboxId={sandbox.sandboxId} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

