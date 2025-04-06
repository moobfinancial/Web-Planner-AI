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

// Initialize Mermaid once on the client with error handling
if (typeof window !== 'undefined') {
  try {
    mermaid.initialize({
      startOnLoad: false, // We will render manually
      theme: 'default', // Or 'dark', 'neutral', 'forest'
      securityLevel: 'loose', // Needed to allow rendering in our component
      logLevel: 'error', // Only show errors, not warnings
      fontFamily: 'inherit', // Use the app's font
    });
    console.log("Mermaid initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Mermaid:", error);
  }
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, id }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useRef(0); // To handle potential race conditions

  useEffect(() => {
    setIsMounted(true);
    
    // Cleanup function to handle component unmounting
    return () => {
      // Clear any content in the container to prevent DOM manipulation errors
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    // Skip rendering if not mounted yet
    if (!isMounted || !containerRef.current) return;
    
    // Define an async function inside useEffect
    const renderDiagram = async () => {
      const currentRenderId = ++renderId.current; // Increment for this render attempt
      setHasError(false); // Reset error state
      setIsLoading(true); // Start loading
      setSvgContent(null); // Clear any previous SVG content

      // Basic validation: Check if chart is a non-empty string
      if (!chart || typeof chart !== 'string' || chart.trim().length === 0) {
        console.warn(`Mermaid diagram ${id}: Invalid or empty chart string provided.`);
        setHasError(true);
        setIsLoading(false);
        return; // Stop processing if chart is invalid or empty
      }

      try {
        // Use a try/catch block to handle chunk loading errors
        const svgId = `mermaid-svg-${id}-${currentRenderId}`;
        
        // Attempt to render with error handling
        try {
          const { svg } = await mermaid.render(svgId, chart);
          
          // Check if the render was for the latest chart prop
          if (currentRenderId === renderId.current) {
            // Store the SVG content in state instead of directly manipulating the DOM
            setSvgContent(svg);
            setHasError(false);
          }
        } catch (renderError) {
          console.error(`Error rendering Mermaid diagram ${id}:`, renderError);
          
          // Try a second approach with parse + render if the first fails
          try {
            // Parse the diagram first to validate syntax
            await mermaid.parse(chart);
            
            // Create a temporary div for rendering that's not attached to the DOM
            const tempDiv = document.createElement('div');
            tempDiv.className = 'mermaid';
            tempDiv.textContent = chart;
            
            // Use mermaid.render with the temporary div
            const { svg } = await mermaid.render(svgId, chart);
            
            if (currentRenderId === renderId.current) {
              setSvgContent(svg);
              setHasError(false);
            }
          } catch (fallbackError) {
            console.error(`Fallback rendering also failed for diagram ${id}:`, fallbackError);
            setHasError(true);
          }
        }
      } catch (error) {
        console.error(`Fatal error with Mermaid diagram ${id}:`, error);
        setHasError(true);
      } finally {
        setIsLoading(false); // Always mark loading as complete
      }
    };

    // Call the async function
    renderDiagram();
    
  }, [chart, id, isMounted]); // Rerun when chart, id, or mount status changes

  // Update the DOM with SVG content when it changes
  useEffect(() => {
    if (svgContent && containerRef.current) {
      // Safely update the container content
      try {
        containerRef.current.innerHTML = svgContent;
      } catch (error) {
        console.error(`Error updating SVG content for diagram ${id}:`, error);
        setHasError(true);
        // Clear the container to prevent partial renders
        containerRef.current.innerHTML = '';
      }
    }
  }, [svgContent, id]);

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
                {/* Placeholder while SVG is rendering */}
                {isLoading && <Skeleton className="h-60 w-full" />}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MermaidDiagram;
