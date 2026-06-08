declare module 'seedrandom/lib/alea.js' {
  function alea(seed?: string, options?: { entropy: boolean }): {
    double(): number;
  };
  export default alea;
}