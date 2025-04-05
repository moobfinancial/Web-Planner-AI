declare module 'react-mermaid2' {
  import { ReactNode } from 'react';

  interface MermaidProps {
    chart: string;
    config?: Record<string, unknown>;
    className?: string;
  }

  export const Mermaid: React.FC<MermaidProps>;
}
