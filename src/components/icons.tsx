import { BrainCircuit } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" {...props}>
      <BrainCircuit className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold font-headline text-foreground">
        MindBloom
      </span>
    </div>
  );
}
