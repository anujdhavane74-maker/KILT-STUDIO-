export function Wordmark({ onClick }: { onClick?: () => void }) {
  return <a className="wordmark" href="#top" aria-label="KILT STUDIO home" onClick={onClick}>
    <svg className="kilt-monogram" viewBox="0 0 36 40" fill="none" aria-hidden="true"><path d="M2 2h8v15L24 2h10L18 20l17 18H24L10 23v15H2z" fill="currentColor"/><path d="M13 2h5L13 8z" fill="currentColor"/></svg>
    <span className="kilt-logotype"><svg viewBox="0 0 105 34" fill="none" aria-hidden="true"><path d="M0 0h8v12L18 0h10L14 17l15 17H18L8 22v12H0zm33 0h9v34h-9zm15 0h9v26h15v8H48zm22 0h35v8H92v26h-9V8H70z" fill="currentColor"/></svg><small>STUDIO</small></span>
  </a>;
}
