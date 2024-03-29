import { useState, useEffect, useRef } from 'react';
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const App = (): JSX.Element => {
  const initializeRef = useRef(false);
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startService = (): void => {
    if (initializeRef.current) return;

    try {
      esbuild
        .initialize({
          worker: true,
          wasmURL: '/esbuild.wasm',
        })
        .then(() => (initializeRef.current = true));
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  useEffect(() => {
    startService();
  }, []);

  const onClick = async (): Promise<void> => {
    if (!initializeRef.current) return;

    try {
      const result = await esbuild.build({
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin()],
      });

      // const result = await esbuild.transform(input, {
      //   loader: 'jsx',
      //   target: 'es2015',
      // });

      setCode(result.outputFiles[0].text);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  return (
    <>
      <textarea
        cols={50}
        rows={20}
        value={input}
        onChange={e => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
      <pre>{error}</pre>
    </>
  );
};

export default App;
