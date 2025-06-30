import { cn } from '@/lib/utils';
import { markDownClassNames } from './_MarkdownEditor';
import { MDXRemoteProps, MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

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
