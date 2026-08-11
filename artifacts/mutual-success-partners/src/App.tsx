import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, Check, ChevronDown, CircleGauge, ClipboardCheck, Clock3, Mail, Menu, Phone, RotateCcw, Send, ShieldCheck, Target, TrendingUp, UserRound, X, Zap } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { BOOKING_URL, calculatorConfig, calculateResults, type CalculatorInputs } from './calculatorConfig';
import { assessmentQuestions, assessmentSteps, calculateAssessmentResult, type AssessmentAnswers, type AssessmentResult } from './assessmentConfig';

const queryClient = new QueryClient();
const navItems = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Assessment', href: '#assessment' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

function Brand() {
  return <a href="#top" className="brand" data-testid="link-brand" aria-label="Mutual Success Partners home"><span className="brand-mark"><span>MS</span></span><span className="brand-name">MUTUAL SUCCESS<small>— PARTNERS —</small></span></a>;
}

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }), { threshold: .12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function Navbar({ onAssessment }: { onAssessment: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const go = (href: string) => { setOpen(false); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); };
  const assessment = () => { setOpen(false); onAssessment(); };
  return <header className={`topbar ${scrolled ? 'scrolled' : ''}`}><div className="section-wrap nav-inner"><Brand /><nav className="nav-links" aria-label="Primary navigation">{navItems.map((item) => <button className="nav-link" data-testid={`button-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} key={item.href} onClick={item.label === 'Assessment' ? assessment : () => go(item.href)}>{item.label}</button>)}</nav><a href="#calculator" className="nav-cta" data-testid="link-nav-calculator">Get My Revenue Score <ArrowRight size={14} /></a><button className="menu-button" data-testid="button-mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button></div>{open && <nav className="mobile-menu" aria-label="Mobile navigation">{navItems.map((item) => <button className="nav-link" data-testid={`button-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`} key={item.href} onClick={item.label === 'Assessment' ? assessment : () => go(item.href)}>{item.label}</button>)}<a href="#calculator" className="nav-cta" data-testid="link-mobile-calculator" onClick={() => setOpen(false)}>Get My Revenue Score <ArrowRight size={14} /></a></nav>}</header>;
}

function AnimatedMetric({ value, formatter }: { value: number; formatter: (value: number) => string }) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number | undefined>(undefined);
  useEffect(() => {
    const start = display;
    const delta = value - start;
    const started = performance.now();
    const tick = (now: number) => { const progress = Math.min(1, (now - started) / 380); setDisplay(Math.round(start + delta * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) frame.current = requestAnimationFrame(tick); };
    frame.current = requestAnimationFrame(tick);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  // Number transitions intentionally respond only to incoming values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{formatter(display)}</>;
}

function SliderControl({ id, label, hint, value, min, max, step, display, onChange }: { id: string; label: string; hint: string; value: number; min: number; max: number; step: number; display: string; onChange: (value: number) => void }) {
  const progress = `${((value - min) / (max - min)) * 100}%`;
  return <div className="slider-row"><label htmlFor={id}>{label}<span>{display}</span></label><span className="slider-hint">{hint}</span><div className="range-wrap"><input id={id} data-testid={`input-${id}`} aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ '--range-progress': progress } as CSSProperties} /><div className="range-scale"><span>{id === 'average-job-value' ? '$2.5k' : id === 'response-time' ? 'Fast' : '5'}</span><span>{id === 'average-job-value' ? '$50k' : id === 'response-time' ? '12+ hrs' : '180'}</span></div></div></div>;
}
const money = (value: number) => `$${value.toLocaleString('en-US')}`;

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 51;
  return <div className="score-ring" data-testid="visual-score-ring" aria-label={`Revenue Growth Score ${score} out of 100`}><svg viewBox="0 0 120 120" role="img"><circle className="ring-track" cx="60" cy="60" r="51" /><circle className="ring-progress" cx="60" cy="60" r="51" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} /></svg><div className="ring-content"><span className="ring-score" data-testid="text-growth-score"><AnimatedMetric value={score} formatter={(v) => `${v}`} /></span><span className="ring-outof">out of 100</span></div></div>;
}

function Calculator({ onAssessment, onResult }: { onAssessment: () => void; onResult: (result: ReturnType<typeof calculateResults>) => void }) {
  const [inputs, setInputs] = useState<CalculatorInputs>({ monthlyOpportunities: calculatorConfig.fields.monthlyOpportunities.defaultValue, averageJobValue: calculatorConfig.fields.averageJobValue.defaultValue, responseMinutes: calculatorConfig.fields.responseMinutes.defaultValue });
  const results = useMemo(() => calculateResults(inputs), [inputs]);
  useEffect(() => onResult(results), [results, onResult]);
  const update = (key: keyof CalculatorInputs, value: number) => setInputs((current) => ({ ...current, [key]: value }));
  return <section className="section calculator-section" id="calculator" aria-labelledby="calculator-title"><div className="section-wrap"><div className="calc-card reveal"><div className="calc-head"><div><span className="eyebrow">Revenue intelligence / live model</span><h2 className="calc-title" id="calculator-title">Revenue Opportunity Calculator™</h2></div><CircleGauge size={21} color="hsl(var(--primary))" /></div><div className="calc-body"><div className="input-stack"><SliderControl id="monthly-opportunities" label="Monthly opportunities" hint="New leads, calls, or inquiries" value={inputs.monthlyOpportunities} min={calculatorConfig.fields.monthlyOpportunities.min} max={calculatorConfig.fields.monthlyOpportunities.max} step={calculatorConfig.fields.monthlyOpportunities.step} display={inputs.monthlyOpportunities.toString()} onChange={(value) => update('monthlyOpportunities', value)} /><SliderControl id="average-job-value" label="Average job value" hint="Average revenue per completed job" value={inputs.averageJobValue} min={calculatorConfig.fields.averageJobValue.min} max={calculatorConfig.fields.averageJobValue.max} step={calculatorConfig.fields.averageJobValue.step} display={money(inputs.averageJobValue)} onChange={(value) => update('averageJobValue', value)} /><SliderControl id="response-time" label="Average response time" hint="Time to respond to a new lead" value={inputs.responseMinutes} min={calculatorConfig.fields.responseMinutes.min} max={calculatorConfig.fields.responseMinutes.max} step={calculatorConfig.fields.responseMinutes.step} display={results.responseLabel} onChange={(value) => update('responseMinutes', value)} /></div><div className="score-panel"><span className="metric-kicker">Estimated annual opportunity</span><span className="metric-big" data-testid="text-annual-opportunity"><AnimatedMetric value={results.annualOpportunity} formatter={money} /></span><span className="fine-print">That’s the revenue currently exposed to process friction.</span><ScoreRing score={results.growthScore} /><span className="score-category" data-testid="text-score-category">{results.category}</span></div></div><div className="calc-results"><div className="result-cell"><span className="result-label">Potential additional<br />monthly revenue</span><span className="result-value" data-testid="text-additional-revenue"><AnimatedMetric value={results.additionalMonthlyRevenue} formatter={money} /></span></div><div className="result-cell"><span className="result-label">Estimated additional<br />jobs per year</span><span className="result-value" data-testid="text-additional-jobs"><AnimatedMetric value={results.additionalJobs} formatter={(value) => `${value}`} /></span></div><div className="result-cell"><span className="result-label">Potential ROI<br />annual return</span><span className="result-value" data-testid="text-roi"><AnimatedMetric value={Math.round(results.roi * 10)} formatter={(value) => `${(value / 10).toFixed(1)}x`} /></span></div></div><div className="calc-foot"><span className="fine-print"><ShieldCheck size={12} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />Estimates only. Directional, not a guaranteed financial forecast.</span><button className="button-primary" data-testid="button-continue-assessment" onClick={onAssessment}>See where revenue leaks <ArrowRight size={14} /></button></div></div></div></section>;
}

function AssessmentChoices({ question, answer, onChange }: { question: typeof assessmentQuestions[number]; answer: string | string[] | undefined; onChange: (value: string | string[]) => void }) {
  const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
  const toggle = (option: string) => {
    if (question.type === 'single') onChange(option);
    else onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  };
  return <div className={`assessment-choices ${question.type === 'multi' ? 'is-multi' : ''}`}>{question.options.map((option) => {
    const isSelected = selected.includes(option);
    return <button type="button" className={`choice-button ${isSelected ? 'selected' : ''}`} aria-pressed={isSelected} data-testid={`choice-${question.id}-${option.replaceAll(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`} key={option} onClick={() => toggle(option)}><span className="choice-indicator">{isSelected && <Check size={12} />}</span><span>{option}</span></button>;
  })}</div>;
}

function AssessmentExperience({ open, onClose, calculatorResult }: { open: boolean; onClose: () => void; calculatorResult?: ReturnType<typeof calculateResults> }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [result, setResult] = useState<AssessmentResult>();
  const activeStep = assessmentSteps[stepIndex];
  const activeQuestions = assessmentQuestions.filter((question) => question.stepId === activeStep.id);
  const completedQuestions = assessmentQuestions.filter((question) => answers[question.id] !== undefined && (Array.isArray(answers[question.id]) ? answers[question.id].length > 0 : Boolean(answers[question.id])));
  const isLast = stepIndex === assessmentSteps.length - 1;
  const completeStep = activeQuestions.every((question) => {
    const value = answers[question.id];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  const updateAnswer = (id: string, value: string | string[]) => setAnswers((current) => ({ ...current, [id]: value }));
  const close = () => { onClose(); setStepIndex(0); setResult(undefined); setAnswers({}); };
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  const next = () => {
    if (!completeStep) return;
    if (isLast) setResult(calculateAssessmentResult(answers, calculatorResult));
    else setStepIndex((value) => value + 1);
  };
  const restart = () => { setStepIndex(0); setAnswers({}); setResult(undefined); };
  const edit = () => setResult(undefined);
  return <div className="assessment-overlay" role="dialog" aria-modal="true" aria-labelledby="assessment-title"><div className="assessment-shell">
    <div className="assessment-topbar"><Brand /><div className="assessment-topbar-copy"><span className="eyebrow">The assessment experience</span><span>2–3 minutes · private by design</span></div><button className="assessment-close" aria-label="Close assessment" data-testid="button-close-assessment" onClick={close}><X size={20} /></button></div>
    <div className="assessment-layout">
      <aside className="assessment-intro"><span className="eyebrow">Revenue recovery assessment™</span><h1 id="assessment-title">Find the revenue<br /><span className="blue">hiding in plain sight.</span></h1><p>Answer a few quick questions to uncover the revenue leaks costing your business money — and get a personalized Revenue Recovery Report.</p><div className="assessment-proof"><span><Clock3 size={17} /><strong>Takes 2–3 minutes</strong><small>Quick, simple, and useful.</small></span><span><Target size={17} /><strong>Personalized results</strong><small>See exactly where you’re leaking.</small></span><span><BarChart3 size={17} /><strong>Actionable next steps</strong><small>Get a clear plan forward.</small></span></div><div className="assessment-safe"><ShieldCheck size={14} /> Your information is safe and never shared.</div></aside>
      <section className="assessment-workspace">
        {!result ? <><div className="assessment-stepper" aria-label="Assessment progress">{assessmentSteps.map((step, index) => <div className={`assessment-step ${index === stepIndex ? 'active' : ''} ${index < stepIndex ? 'done' : ''}`} key={step.id}><span>{index < stepIndex ? <Check size={12} /> : index + 1}</span><small>{step.title}</small></div>)}</div><div className="assessment-question-head"><span className="eyebrow">{activeStep.label} of 04</span><h2>{activeStep.title}</h2><p>{activeStep.description}</p><div className="assessment-progress" aria-label={`${completedQuestions.length} of ${assessmentQuestions.length} answered`}><span style={{ width: `${(completedQuestions.length / assessmentQuestions.length) * 100}%` }} /></div></div><div className="question-stack">{activeQuestions.map((question) => <article className="question-card" key={question.id}><div className="question-number">{String(question.number).padStart(2, '0')}</div><div className="question-content"><h3>{question.prompt}</h3><span className="question-hint">{question.hint}</span><AssessmentChoices question={question} answer={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} /></div></article>)}</div><div className="assessment-controls">{stepIndex > 0 ? <button className="button-secondary" data-testid="button-assessment-back" onClick={() => setStepIndex((value) => value - 1)}><ArrowLeft size={14} /> Previous</button> : <span />}{!completeStep && <span className="validation-note">Answer each question to continue</span>}<button className="button-primary" data-testid={isLast ? 'button-see-results' : 'button-assessment-next'} disabled={!completeStep} onClick={next}>{isLast ? 'See my results' : 'Next question'} <ArrowRight size={14} /></button></div><div className="assessment-footnote"><ShieldCheck size={12} /> Your progress is saved as you go.</div></> : <AssessmentResults result={result} onRestart={restart} onEdit={edit} onClose={close} /> }
      </section>
    </div>
  </div></div>;
}

function AssessmentResults({ result, onRestart, onEdit, onClose }: { result: AssessmentResult; onRestart: () => void; onEdit: () => void; onClose: () => void }) {
  return <div className="assessment-results"><div className="results-heading"><span className="eyebrow">Your results</span><h2>Here’s where your revenue<br /><span className="blue">is getting held back.</span></h2><p>{result.summary}</p></div><div className="results-score-layout"><div className="results-score"><ScoreRing score={result.score} /><strong>{result.category}</strong><p>There is meaningful upside in tightening the moments between inquiry and completed job.</p></div><div className="results-leaks"><h3>Your top revenue leaks</h3>{result.leaks.map((leak, index) => <div className="result-leak" key={leak.id}><span className="leak-rank">0{index + 1}</span><div><strong>{leak.title}</strong><p>{leak.description}</p></div><em className={leak.impact === 'High impact' ? 'high' : ''}>{leak.impact}</em></div>)}</div></div><div className="recommendation-panel"><span className="eyebrow">Your next moves</span><div>{result.recommendations.map((recommendation, index) => <p key={recommendation}><Check size={15} /><span><strong>0{index + 1}</strong>{recommendation}</span></p>)}</div></div><div className="results-actions"><button className="button-secondary" data-testid="button-edit-assessment" onClick={onEdit}>Edit assessment</button><button className="button-secondary" data-testid="button-restart-assessment" onClick={onRestart}><RotateCcw size={14} /> Start over</button><a className="button-primary" href={BOOKING_URL} data-testid="link-results-book-discovery">Book my discovery call <ArrowRight size={14} /></a></div><p className="results-disclaimer">This report is directional and designed to start a useful conversation — not a guaranteed financial forecast.</p><button className="text-button results-close" data-testid="button-close-results" onClick={onClose}>Return to the site</button></div>;
}

function Hero({ onAssessment, onResult }: { onAssessment: () => void; onResult: (result: ReturnType<typeof calculateResults>) => void }) {
  const toCalculator = () => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' });
  return <section className="hero" id="top"><div className="hero-orbit" aria-hidden="true" /><div className="section-wrap hero-grid"><div className="hero-copy reveal"><span className="eyebrow">Revenue growth consultants</span><h1 className="display">Recover the<br />revenue you’re<br /><span className="blue">already losing.</span></h1><p className="hero-lead">We help service-based businesses uncover hidden revenue leaks and build the systems that recover lost opportunities, close more jobs, and drive predictable growth.</p><div className="hero-actions"><button className="button-primary" data-testid="button-hero-calculate" onClick={toCalculator}>Calculate my revenue opportunity <ArrowRight size={14} /></button><button className="button-secondary" data-testid="button-hero-score" onClick={toCalculator}>Get my free revenue score</button></div><div className="hero-trust"><span><ShieldCheck size={13} /> No obligation</span><span><Clock3 size={13} /> Free analysis in 60 seconds</span></div></div><Calculator onAssessment={onAssessment} onResult={onResult} /></div><div className="hero-scroll">Scroll to explore</div></section>;
}

function Journey() {
  const steps = [{ icon: CircleGauge, label: 'Step 01', title: 'Revenue Opportunity', copy: 'See your potential in real time.' }, { icon: ClipboardCheck, label: 'Step 02', title: 'Recovery Assessment', copy: 'Answer a few questions about your business.' }, { icon: BarChart3, label: 'Step 03', title: 'Personalized Report', copy: 'We identify your biggest revenue leaks.' }, { icon: CalendarDays, label: 'Step 04', title: 'Discovery Call', copy: 'Review your report and map the next move.' }, { icon: TrendingUp, label: 'Step 05', title: 'Implement & Grow', copy: 'Put the right systems to work.' }];
  return <section className="journey" id="how-it-works"><div className="section-wrap"><div className="journey-head reveal"><span className="eyebrow">Your journey / from curiosity to growth</span><h2 className="section-title">Find the friction.<br /><span className="blue">Fund the future.</span></h2></div><div className="journey-grid">{steps.map((step, index) => <div className={`journey-step reveal stagger-${Math.min(index + 1, 3)}`} key={step.title}><div className="step-icon"><step.icon size={22} /></div><span className="step-label">{step.label}</span><strong className="step-title">{step.title}</strong><p className="step-copy">{step.copy}</p></div>)}</div></div></section>;
}

function RevenueLeaks() {
  const leaks = [{ icon: Phone, title: 'Missed calls', copy: 'Leads lost when no one answers.' }, { icon: Clock3, title: 'Slow response times', copy: 'The longer you wait, the colder the lead.' }, { icon: Mail, title: 'Leads that never get followed up', copy: 'Good leads that fall through the cracks.' }, { icon: CalendarDays, title: 'Estimates that go cold', copy: 'Opportunities lost without a system.' }, { icon: X, title: 'No-shows & cancellations', copy: 'Revenue lost before the appointment.' }, { icon: UserRound, title: 'Manual administrative work', copy: 'Time-consuming tasks that don’t drive revenue.' }];
  return <section className="section leaks" id="assessment"><div className="section-wrap"><div className="split-heading reveal"><div><span className="eyebrow">The hidden cost / common revenue leaks</span><h2 className="section-title">Every opportunity<br /><span className="blue">has a cost.</span></h2></div><p className="section-copy">Most businesses don’t have a lead problem. They have a follow-up problem. Small moments of friction compound into a number that quietly changes the trajectory of the business.</p></div><div className="leak-grid"><div className="leak-panel reveal"><h3>What you’ll uncover</h3><ul className="leak-list">{leaks.map((leak) => <li key={leak.title}><leak.icon className="leak-icon" size={22} /><div><strong>{leak.title}</strong><span>{leak.copy}</span></div></li>)}</ul></div><div className="leak-panel reveal stagger-1"><h3>Why speed to lead matters</h3><div className="speed-table"><div className="speed-row"><span className="speed-time">1 min</span><span className="speed-copy">You’re 21× more likely to qualify the lead.</span></div><div className="speed-row"><span className="speed-time">5 min</span><span className="speed-copy">You’re 9× more likely to convert the lead.</span></div><div className="speed-row"><span className="speed-time">30 min</span><span className="speed-copy">You’re 21× less likely to convert the lead.</span></div></div><div className="impact-callout"><Zap size={25} /><div>Every minute counts.<br /><span>Don’t let revenue walk away.</span></div></div></div></div></div></section>;
}

function Process() {
  const cards = [{ icon: Target, title: 'Identify', copy: 'We analyze your business and uncover the revenue you’re losing.' }, { icon: Zap, title: 'Implement', copy: 'We build the right systems, process, and automations to fix the leaks.' }, { icon: TrendingUp, title: 'Grow', copy: 'More opportunities. More closed jobs. More profit.' }];
  return <section className="section process"><div className="section-wrap process-layout"><div className="reveal"><span className="eyebrow">How we help / a better operating rhythm</span><h2 className="section-title">A clear path from<br /><span className="blue">leak to lift.</span></h2><p className="section-copy">Strategy is only valuable when it changes what happens next. We pair sharp diagnosis with practical implementation, so recovered revenue becomes repeatable.</p><a href="#contact" className="button-secondary" style={{ marginTop: 25 }} data-testid="link-process-contact">Talk through your growth plan <ArrowRight size={14} /></a></div><div className="process-cards">{cards.map((card, index) => <div className={`process-card reveal stagger-${index + 1}`} key={card.title}><card.icon size={28} /><h3>{card.title}</h3><p>{card.copy}</p></div>)}</div></div></section>;
}

function About() {
  return <section className="section about-band" id="about"><div className="section-wrap about-grid"><div className="reveal"><span className="eyebrow">About mutual success partners</span><h2 className="section-title">The best growth<br />is <span className="blue">mutual.</span></h2><p className="section-copy">We’re a revenue growth consultancy for service businesses that are ready to stop guessing. Our work connects the dots between lead response, sales process, operations, and the customer experience.</p></div><div className="principle-grid reveal stagger-1"><div className="principle"><strong>Diagnose first</strong><span>We start with the numbers and the actual customer journey.</span></div><div className="principle"><strong>Build for real life</strong><span>Systems your team can use when the day gets busy.</span></div><div className="principle"><strong>Measure the lift</strong><span>Progress you can see, track, and act on.</span></div><div className="principle"><strong>Win together</strong><span>Your growth is the measure of our work.</span></div></div></div></section>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <section className="section contact-section" id="contact"><div className="section-wrap contact-grid"><div className="reveal"><span className="eyebrow">Start a conversation</span><h2 className="section-title">Let’s find what’s<br /><span className="blue">costing you.</span></h2><p className="section-copy">Bring us your questions, your numbers, or simply the feeling that growth should be easier than this.</p><div className="contact-details"><span className="contact-line"><Phone size={17} /> (904) 913-3566</span><span className="contact-line"><Mail size={17} /> andrew@mutualsuccesspartners.com</span></div><a href={BOOKING_URL} className="button-secondary" style={{ marginTop: 23, width: 'fit-content' }} data-testid="link-book-discovery-call">Book a discovery call <ArrowRight size={14} /></a></div><form className="contact-form reveal stagger-1" onSubmit={submit}><div className="form-grid"><div className="field"><label htmlFor="contact-name">YOUR NAME</label><input id="contact-name" data-testid="input-contact-name" required placeholder="Your name" /></div><div className="field"><label htmlFor="contact-email">WORK EMAIL</label><input id="contact-email" data-testid="input-contact-email" required type="email" placeholder="you@company.com" /></div><div className="field"><label htmlFor="contact-company">COMPANY</label><input id="contact-company" data-testid="input-contact-company" required placeholder="Company name" /></div><div className="field"><label htmlFor="contact-phone">PHONE</label><input id="contact-phone" data-testid="input-contact-phone" placeholder="Optional" /></div><div className="field full"><label htmlFor="contact-message">WHAT’S ON YOUR MIND?</label><textarea id="contact-message" data-testid="input-contact-message" required placeholder="Tell us where growth feels stuck..." /></div></div><button className="button-primary" type="submit" data-testid="button-submit-contact" style={{ marginTop: 19 }}>{sent ? 'Message ready to send' : 'Send inquiry'} {sent ? <Check size={14} /> : <Send size={14} />}</button>{sent && <div className="form-success" role="status">Thanks — we’ll be in touch at the email you provided.</div>}</form></div></section>;
}

function Footer() {
  return <footer className="footer"><div className="section-wrap footer-row"><Brand /><span className="footer-copy">© 2026 Mutual Success Partners. All rights reserved.</span><div className="socials"><a href="mailto:andrew@mutualsuccesspartners.com" className="social-link" data-testid="link-footer-email" aria-label="Email Mutual Success Partners"><Mail size={15} /></a><a href="#top" className="social-link" data-testid="link-footer-top" aria-label="Back to top"><ChevronDown size={15} style={{ transform: 'rotate(180deg)' }} /></a></div></div></footer>;
}

function Home() {
  useReveal();
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [calculatorResult, setCalculatorResult] = useState<ReturnType<typeof calculateResults>>();
  const openAssessment = () => setAssessmentOpen(true);
  return <main className="site-shell"><Navbar onAssessment={openAssessment} /><Hero onAssessment={openAssessment} onResult={setCalculatorResult} /><Journey /><RevenueLeaks /><Process /><About /><section className="cta-section"><div className="section-wrap cta-row"><div><span className="eyebrow">Ready to see the upside?</span><h2>Put your next opportunity<br /><span className="cyan">on the calendar.</span></h2></div><a href={BOOKING_URL} className="button-primary" data-testid="link-cta-discovery-call">Book your discovery call <ArrowRight size={15} /></a></div></section><Contact /><Footer /><AssessmentExperience open={assessmentOpen} onClose={() => setAssessmentOpen(false)} calculatorResult={calculatorResult} /></main>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;