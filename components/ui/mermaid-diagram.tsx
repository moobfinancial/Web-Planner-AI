"use client";

import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut, RotateCcw, ImageOff } from 'lucide-react'; // Icons for controls + Placeholder
import { Button } from "@/components/ui/button"; // For control buttons


interface MermaidDiagramProps {
  chart: string; // The Mermaid syntax string
  id: string;    // Unique ID for the diagram container
}

// Initialize Mermaid once on the client
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false, // We will render manually
    theme: 'default', // Or 'dark', 'neutral', 'forest'
    // securityLevel: 'loose', // Consider security implications if needed
  });
  // console.log("Mermaid initialized");
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, id }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  // No longer need errorMessage state for user display
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useRef(0); // To handle potential race conditions

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Define an async function inside useEffect
    const renderDiagram = async () => {
      if (!containerRef.current) return; // Guard clause

      const currentRenderId = ++renderId.current; // Increment for this render attempt
      setHasError(false); // Reset error state

      // Basic validation: Check if chart is a non-empty string
      if (!chart || typeof chart !== 'string' || chart.trim().length === 0) {
        console.warn(`Mermaid diagram ${id}: Invalid or empty chart string provided.`);
        setHasError(true);
        if (containerRef.current) {
          containerRef.current.innerHTML = ''; // Clear potentially old diagram
        }
        return; // Stop processing if chart is invalid or empty
      }

      const container = containerRef.current;
      // Ensure container is empty before rendering
      container.innerHTML = '';
      container.removeAttribute('data-processed'); // Allow re-processing by mermaid

      // Create the specific div mermaid needs
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.textContent = chart; // Use textContent to avoid potential XSS with chart content if it were HTML
      container.appendChild(mermaidDiv);

      // console.log(`Mermaid diagram ${id}: Attempting to render...`);
      try {
        // Use mermaid.render instead of run for potentially better control/error handling
        // Generate a unique ID for the SVG to avoid conflicts if multiple diagrams are on page
        const svgId = `mermaid-svg-${id}-${currentRenderId}`;
        // Now 'await' is valid within this async function
        const { svg } = await mermaid.render(svgId, chart);

        // Check if the render was for the latest chart prop
        if (currentRenderId === renderId.current && containerRef.current) {
           // console.log(`Mermaid diagram ${id}: Render successful.`);
           containerRef.current.innerHTML = svg; // Replace container content with SVG
           setHasError(false); // Ensure error is cleared on success
        } else {
           // console.log(`Mermaid diagram ${id}: Stale render ignored.`);
        }
      } catch (error) {
         // This catches syntax errors and other rendering issues from mermaid.render
         if (currentRenderId === renderId.current) {
           console.error(`Error rendering Mermaid diagram ${id}:`, error);
           setHasError(true);
           // Clear the container in case of partial render or error message injection by mermaid
           if (containerRef.current) {
             containerRef.current.innerHTML = '';
           }
         }
      }
      /* Old mermaid.run logic - replaced by mermaid.render
      */
    };

    // Call the async function only when mounted
    if (isMounted) {
      renderDiagram();
    }
    // Cleanup function or dependency array logic remains the same
  }, [chart, id, isMounted]); // Rerun when chart, id, or mount status changes

  if (!isMounted) {
    // Still rendering server-side or waiting for hydration
    return <Skeleton className="h-64 w-full border rounded-md" />; // Slightly larger skeleton
  }

  // If there's an error, render a subtle placeholder
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full border rounded-md bg-muted/30 text-muted-foreground p-4">
        <ImageOff className="h-10 w-10 mb-2" />
        <p className="text-sm text-center">Visualization could not be generated.</p>
        <p className="text-xs text-center mt-1">(The provided diagram syntax might be invalid)</p>
      </div>
    );
  }

  // If no error, render the interactive diagram
  return (
    // Use card styling for consistency? Or keep simple border? Let's keep simple border for now.
    <div className="mermaid-diagram-wrapper border rounded-lg overflow-hidden relative bg-card/30 dark:bg-card/50 shadow-sm">
      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={4}
        limitToBounds={true}
        doubleClick={{ disabled: true }} // Disable double click zoom toggle if needed
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <>
            {/* Controls Overlay - Adjusted styling */}
            <div className="absolute top-2 right-2 z-10 flex space-x-1 bg-background/80 backdrop-blur-sm p-1 rounded-md border shadow-sm">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => zoomIn()} aria-label="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => zoomOut()} aria-label="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => resetTransform()} aria-label="Reset View">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Diagram Content - Ensure background matches theme */}
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }} // Ensure content fills the space
            >
              {/* This div will contain the Mermaid SVG */}
              {/* Apply min height/width to ensure container has size before SVG loads */}
              <div
                ref={containerRef}
                id={id}
                className="mermaid-container-content flex justify-center items-center min-h-[250px] bg-background p-2" // Slightly increased min-height and added padding
              >
                {/* Placeholder while SVG is rendering, removed once mermaid injects SVG - Use slightly larger skeleton */}
                <Skeleton className="h-60 w-full" />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MermaidDiagram;
