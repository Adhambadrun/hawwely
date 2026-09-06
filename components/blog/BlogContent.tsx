import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/helpers';

/** Markdown renderer for blog posts / legal pages (GFM tables supported). */
export function BlogContent({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={cn('prose-hawwely', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const h = href ?? '#';
            const internal = h.startsWith('/') && !h.startsWith('//');
            return internal ? (
              <Link href={h}>{children}</Link>
            ) : (
              <a href={h} target={h.startsWith('http') ? '_blank' : undefined} rel={h.startsWith('http') ? 'noopener noreferrer' : undefined}>
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="not-prose my-6 overflow-x-auto rounded-card border border-card-border">
              <table className="w-full text-small [&_td]:px-3 [&_td]:py-2 [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-bold [&_th]:text-navy [&_tr]:border-b [&_tr]:border-card-border">{children}</table>
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
