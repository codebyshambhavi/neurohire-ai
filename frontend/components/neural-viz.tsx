'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

type Node = { id: number; x: number; y: number; r: number; delay: number }
type Edge = { from: number; to: number }

function buildNetwork() {
  // Layered neural network layout across a 400x400 viewBox
  const layers = [
    { x: 60, count: 4 },
    { x: 160, count: 6 },
    { x: 260, count: 6 },
    { x: 360, count: 3 },
  ]
  const nodes: Node[] = []
  const layerNodes: number[][] = []
  let id = 0
  layers.forEach((layer, li) => {
    const ids: number[] = []
    const gap = 360 / (layer.count + 1)
    for (let i = 0; i < layer.count; i++) {
      nodes.push({
        id,
        x: layer.x,
        y: 20 + gap * (i + 1),
        r: li === 0 || li === layers.length - 1 ? 5 : 4,
        delay: (li * 0.15 + i * 0.05) % 2,
      })
      ids.push(id)
      id++
    }
    layerNodes.push(ids)
  })

  const edges: Edge[] = []
  for (let li = 0; li < layerNodes.length - 1; li++) {
    layerNodes[li].forEach((from) => {
      layerNodes[li + 1].forEach((to) => {
        // keep it airy: connect ~60% of pairs
        if (Math.abs((from * 7 + to * 13) % 10) > 4) edges.push({ from, to })
      })
    })
  }
  return { nodes, edges }
}

export function NeuralViz({ className }: { className?: string }) {
  const { nodes, edges } = useMemo(buildNetwork, [])

  return (
    <svg
      viewBox="0 0 400 400"
      className={cn('h-full w-full', className)}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient id="nv-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nv-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {edges.map((e, i) => {
        const a = nodes[e.from]
        const b = nodes[e.to]
        return (
          <motion.line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="url(#nv-edge)"
            strokeWidth={1}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.12, 0.5, 0.12] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: (i % 12) * 0.18,
              ease: 'easeInOut',
            }}
          />
        )
      })}

      {nodes.map((n) => (
        <g key={n.id}>
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={n.r * 3}
            fill="url(#nv-glow)"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.15, 0.45, 0.15], scale: [1, 1.15, 1] }}
            transition={{
              duration: 2.8,
              repeat: Number.POSITIVE_INFINITY,
              delay: n.delay,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          />
          <circle cx={n.x} cy={n.y} r={n.r} fill="var(--primary)" />
          <circle cx={n.x} cy={n.y} r={n.r} fill="var(--foreground)" opacity={0.15} />
        </g>
      ))}
    </svg>
  )
}
