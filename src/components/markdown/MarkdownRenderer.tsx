import { cn } from '@/lib/utils';
import { MDXRemoteProps, MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

const markDownClassNames =
  'max-w-none prose prose-neutral dark:prose-invert font-sans';

export default function MarkdownRenderer({
  className,
  options,
  ...props
}: MDXRemoteProps & { className?: string }) {
  return (
    <div className={cn(markDownClassNames, className)}>
      <MDXRemote
        {...props}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              ...(options?.mdxOptions?.remarkPlugins ?? [])
            ],
            ...options?.mdxOptions
          }
        }}
      />
    </div>
  );
}
