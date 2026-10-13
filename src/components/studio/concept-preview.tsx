import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowUpRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { conceptDetails, type ConceptId } from '@/lib/concept-projects';

export function ConceptPreview({ id, onClose }: { id: ConceptId | null; onClose: () => void }) {
  const project = id ? conceptDetails[id] : null;
  return <Dialog.Root open={!!project} onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="concept-overlay" />{project && <Dialog.Content className={`concept-preview concept-${id}`}>
    <div className="preview-toolbar"><Button variant="ghost" onClick={onClose}><ArrowLeft /> Back to portfolio</Button><span>CONCEPT PROJECT · KILT STUDIO</span><Dialog.Close asChild><Button variant="iconControl" size="icon" aria-label="Close concept preview"><X /></Button></Dialog.Close></div>
    <div className="preview-scroll"><Dialog.Title className="sr-only">{project.brand} — concept project preview</Dialog.Title><Dialog.Description className="preview-disclaimer">Self-initiated demo concept. Fictional brand and generated illustrative imagery — not a client project or operational business.</Dialog.Description>
      <div className="mini-nav"><strong>{project.brand}<span>®</span></strong><span>AN ORIGINAL KILT CONCEPT</span></div>
      <section className="mini-hero"><img src={project.image} alt={project.alt} width={1536} height={1024} /><div className="mini-hero-copy"><span>INDEPENDENT BY DESIGN</span><h2>{project.headline}</h2><p>{project.intro}</p><Button variant="studio" onClick={() => document.getElementById('concept-collection')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>{project.action} <ArrowUpRight /></Button></div></section>
      <section className="mini-story"><span>THE IDEA</span><h2>{project.section}</h2><p>{project.story}</p></section>
      <section id="concept-collection" className="mini-collection"><div className="mini-section-label">A CLOSER LOOK <span>DEMO CONCEPT</span></div><div className="mini-products">{project.items.map((item,i) => <article key={item}><div className={`mini-product-image crop-${i}`}><img src={project.image} alt={`${item} — illustrative concept`} width={1536} height={1024} loading="lazy" /><span>0{i+1}</span></div><h3>{item}</h3><p>{project.descriptions[i]}</p></article>)}</div></section>
      <section className="mini-finish"><span>THE KILT APPROACH</span><h2>A brand with a point of view.</h2><p>Visual direction · Responsive website concept · Content & imagery</p><Button variant="studio" onClick={() => { onClose(); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' }), 60); }}>Create something for my brand <ArrowUpRight /></Button></section>
      <div className="mini-footer"><strong>{project.brand}</strong><span>CONCEPT PROJECT / KILT STUDIO</span><Button variant="ghost" onClick={onClose}><ArrowLeft /> Back to portfolio</Button></div>
    </div></Dialog.Content>}</Dialog.Portal></Dialog.Root>;
}
