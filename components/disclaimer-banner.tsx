import { Github } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="border-b border-neutral-800 bg-surface-secondary">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2.5 px-4 py-2 lg:px-6">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-status-warning opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-warning" />
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-500">
          <span className="font-semibold text-status-warning">Community Project</span>
          {" · "}In active development —{" "}
          <a
            href="https://github.com/hareeshnagaraj/iamstranded"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-neutral-400 underline underline-offset-2 transition-colors hover:text-text-primary"
          >
            contribute or report issues on GitHub
            <Github size={10} />
          </a>
        </p>
      </div>
    </div>
  );
}
