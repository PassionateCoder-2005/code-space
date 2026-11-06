import { useSandbox } from './hooks/useSandbox';
import LandingScreen from './components/LandingScreen';
import SandboxLayout from './components/SandboxLayout';

function App() {
  const { sandbox, creating, error, createSandbox, listFiles, readFiles, updateFiles } =
    useSandbox();

  if (!sandbox) {
    return <LandingScreen onCreate={createSandbox} creating={creating} error={error} />;
  }

  return <SandboxLayout sandbox={sandbox} listFiles={listFiles} />;
}

export default App;
