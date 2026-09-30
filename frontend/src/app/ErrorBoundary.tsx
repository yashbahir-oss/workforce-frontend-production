import { twClass } from "../lib/tw";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("WORKFORCE application error", error, info); }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className={twClass('grid min-h-screen place-items-center bg-slate-50 p-5')}><section className={twClass('w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl')}><div className={twClass('mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600')}><AlertTriangle/></div><h1 className={twClass('mt-4 text-xl font-black text-slate-900')}>Something went wrong</h1><p className={twClass('mt-2 text-sm leading-6 text-slate-500')}>The page could not be displayed. Please reload and try again.</p><button type="button" onClick={() => window.location.reload()} className={twClass('mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white')}><RotateCcw size={16}/> Reload application</button></section></main>;
  }
}
