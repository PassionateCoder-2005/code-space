import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

let xtermLoaded = false;

export default function Terminal({ sandboxId }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Connecting…');

  const initTerminal = useCallback(async () => {
    if (!containerRef.current || termRef.current) return;

    // Dynamically import xterm
    const { Terminal: XTerm } = await import('@xterm/xterm');
    const { FitAddon } = await import('@xterm/addon-fit');
    await import('@xterm/xterm/css/xterm.css');

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace',
      theme: {
        background: '#0f1117',
        foreground: '#e2e8f0',
        cursor: '#a78bfa',
        selectionBackground: '#7c3aed40',
        black: '#1e1e2e',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#cba6f7',
        cyan: '#89dceb',
        white: '#cdd6f4',
        brightBlack: '#585b70',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#cba6f7',
        brightCyan: '#89dceb',
        brightWhite: '#cdd6f4',
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect socket.io
    const agentHost = `${sandboxId}.agent.localhost`;
    const socket = io(`http://${agentHost}`, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setStatus('Connected');
      term.writeln('\x1b[32m✓ Terminal connected\x1b[0m');
      term.writeln('\x1b[90m─────────────────────────────────────\x1b[0m');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setStatus('Disconnected');
      term.writeln('\x1b[31m✗ Terminal disconnected\x1b[0m');
    });

    socket.on('connect_error', (err) => {
      setStatus(`Error: ${err.message}`);
      term.writeln(`\x1b[31m✗ Connection error: ${err.message}\x1b[0m`);
    });

    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    // Send input to server
    term.onData((data) => {
      socket.emit('terminal-input', data);
    });

    // Resize observer
    const observer = new ResizeObserver(() => {
      fitAddon.fit();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [sandboxId]);

  useEffect(() => {
    const cleanup = initTerminal();
    return () => {
      cleanup?.then?.((fn) => fn?.());
      termRef.current?.dispose();
      termRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [initTerminal]);

  return (
    <div className="flex flex-col h-full bg-[#0f1117]">
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-gray-400 text-xs font-mono ml-2">bash</span>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}
          />
          <span className="text-gray-500 text-xs">{status}</span>
        </div>
      </div>

      {/* xterm container */}
      <div ref={containerRef} className="flex-1 overflow-hidden p-1" />
    </div>
  );
}

