import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, FileCode2, Folder, FolderOpen, RefreshCw } from 'lucide-react';

function fileIcon(name) {
  const ext = name.split('.').pop();
  const map = {
    jsx: '⚛️', tsx: '⚛️', js: '🟨', ts: '🔷',
    css: '🎨', html: '🌐', json: '📋', md: '📝',
    svg: '🖼️', png: '🖼️', jpg: '🖼️',
  };
  return map[ext] || '📄';
}

function buildTree(files) {
  const root = {};
  for (const path of files) {
    const parts = path.split('/');
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        node[part] = null; // leaf (file)
      } else {
        node[part] = node[part] || {};
      }
      node = node[part] ?? {};
    }
  }
  return root;
}

function TreeNode({ name, node, depth = 0 }) {
  const isDir = node !== null && typeof node === 'object';
  const [open, setOpen] = useState(depth === 0);

  if (!isDir) {
    return (
      <div
        className="flex items-center gap-1.5 py-0.5 px-2 rounded cursor-pointer hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors text-sm"
        style={{ paddingLeft: `${(depth + 1) * 12}px` }}
      >
        <span className="text-xs">{fileIcon(name)}</span>
        <span className="font-mono truncate">{name}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 px-2 rounded cursor-pointer hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-sm"
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-gray-500 shrink-0" />
        )}
        {open ? (
          <FolderOpen className="w-4 h-4 text-yellow-400 shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
        )}
        <span className="font-mono truncate">{name}</span>
      </div>
      {open &&
        Object.entries(node).map(([childName, childNode]) => (
          <TreeNode key={childName} name={childName} node={childNode} depth={depth + 1} />
        ))}
    </div>
  );
}

export default function FileTree({ listFiles }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const f = await listFiles();
      setFiles(f);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const tree = buildTree(files);

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 shrink-0">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Explorer
        </span>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-700"
          title="Refresh files"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {files.length === 0 && !loading ? (
          <p className="text-gray-600 text-xs text-center mt-6">No files found</p>
        ) : (
          Object.entries(tree).map(([name, node]) => (
            <TreeNode key={name} name={name} node={node} depth={0} />
          ))
        )}
      </div>
    </div>
  );
}

