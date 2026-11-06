import { RefreshCw, ExternalLink, Maximize2, AlertCircle } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Preview({ previewUrl }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = () => {
    setLoading(true);
    setError(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>

        {/* URL bar */}
        <div className="flex-1 mx-2 bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 font-mono truncate">
          {previewUrl}
        </div>

        <button
          onClick={refresh}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* iframe */}
      <div className="relative flex-1 overflow-hidden">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950 z-10">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading preview…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950 z-10">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-gray-400 text-sm">Could not load preview</p>
            <button
              onClick={refresh}
              className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full border-0"
          title="Sandbox Preview"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
        />
      </div>
    </div>
  );
}

