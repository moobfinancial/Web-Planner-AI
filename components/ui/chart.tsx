"use client"

import type React from "react"

import { createContext, useContext, useMemo } from "react"
import { Tooltip as RechartsTooltip, type TooltipProps } from "recharts"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContextValue {
  config: ChartConfig
  getFormattedValue: (value: unknown) => string
}

const ChartContext = createContext<ChartContextValue | null>(null)

interface ChartContainerProps {
  config: ChartConfig
  className?: string
  children: React.ReactNode
}

export function ChartContainer({ config, className, children }: ChartContainerProps) {
  const value = useMemo(() => {
    const getFormattedValue = (value: unknown) => {
      if (typeof value === "number") {
        return new Intl.NumberFormat("en-US").format(value)
      }
      return String(value)
    }

    return {
      config,
      getFormattedValue,
    }
  }, [config])

  const style = useMemo(() => {
    const variables = Object.entries(config).reduce(
      (acc, [key, { color }]) => ({
        ...acc,
        [`--color-${key}`]: color,
      }),
      {},
    )

    return variables
  }, [config])

  return (
    <ChartContext.Provider value={value}>
      <div className={className} style={style}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export function useChart() {
  const context = useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }

  return context
}

export function ChartTooltip(props: TooltipProps<any, any>) {
  return <RechartsTooltip {...props} content={<ChartTooltipContent />} />
}

export function ChartTooltipContent({ active, payload }: any) {
  const { config, getFormattedValue } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        {payload.map(({ name, value }: any) => {
          const { label, color } = config[name] || {
            label: name,
            color: "hsl(var(--foreground))",
          }

          return (
            <div key={name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <div className="text-xs font-medium">{getFormattedValue(value)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

