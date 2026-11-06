import { useState, useCallback } from 'react';

export function useSandbox() {
  const [sandbox, setSandbox] = useState(null); // { sandboxId, previewUrl, agentBaseUrl }
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const createSandbox = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/sandbox/create', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const { sandboxId, previewUrl } = data;
      const agentBaseUrl = `http://${sandboxId}.agent.localhost`;
      setSandbox({ sandboxId, previewUrl, agentBaseUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }, []);

  const listFiles = useCallback(async () => {
    if (!sandbox) return [];
    const res = await fetch(`${sandbox.agentBaseUrl}/list-files`);
    const data = await res.json();
    return data.files || [];
  }, [sandbox]);

  const readFiles = useCallback(async (files) => {
    if (!sandbox) return [];
    const params = files.join(',');
    const res = await fetch(
      `${sandbox.agentBaseUrl}/read-files?files=${encodeURIComponent(params)}`
    );
    const data = await res.json();
    return data.files || [];
  }, [sandbox]);

  const updateFiles = useCallback(async (updates) => {
    if (!sandbox) return;
    await fetch(`${sandbox.agentBaseUrl}/update-files`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
  }, [sandbox]);

  return { sandbox, creating, error, createSandbox, listFiles, readFiles, updateFiles };
}

