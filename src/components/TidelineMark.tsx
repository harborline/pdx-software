import { useId } from 'react'

/**
 * The Tideline identity mark from the current Harborline brand handoff.
 *
 * The larger form carries five independently moving swells. Compact lockups
 * drop the two longest swells, and tiny surfaces use the single opaque wave
 * specified for 16–20px rendering.
 */

export type TidelineDetail = 'full' | 'compact' | 'tiny'

export interface TidelineMarkProps {
  detail?: TidelineDetail
  color?: string
  className?: string
  /** Accessible name. Omit for decorative instances (rendered aria-hidden). */
  label?: string
}

const paths = {
  swell84:
    'M-168 23 C-147 20 -147 20 -126 23 C-105 26 -105 26 -84 23 C-63 20 -63 20 -42 23 C-21 26 -21 26 0 23 C21 20 21 20 42 23 C63 26 63 26 84 23 C105 20 105 20 126 23 C147 26 147 26 168 23 V52 H-168 Z',
  swell63:
    'M-126 26 C-110.25 21.5 -110.25 21.5 -94.5 26 C-78.75 30.5 -78.75 30.5 -63 26 C-47.25 21.5 -47.25 21.5 -31.5 26 C-15.75 30.5 -15.75 30.5 0 26 C15.75 21.5 15.75 21.5 31.5 26 C47.25 30.5 47.25 30.5 63 26 C78.75 21.5 78.75 21.5 94.5 26 C110.25 30.5 110.25 30.5 126 26 C141.75 21.5 141.75 21.5 157.5 26 C173.25 30.5 173.25 30.5 189 26 V52 H-126 Z',
  swell48:
    'M-96 24 C-84 20.5 -84 20.5 -72 24 C-60 27.5 -60 27.5 -48 24 C-36 20.5 -36 20.5 -24 24 C-12 27.5 -12 27.5 0 24 C12 20.5 12 20.5 24 24 C36 27.5 36 27.5 48 24 C60 20.5 60 20.5 72 24 C84 27.5 84 27.5 96 24 C108 20.5 108 20.5 120 24 C132 27.5 132 27.5 144 24 V52 H-96 Z',
  wave42Back:
    'M-84 25.5 C-73.5 22 -73.5 22 -63 25.5 C-52.5 29 -52.5 29 -42 25.5 C-31.5 22 -31.5 22 -21 25.5 C-10.5 29 -10.5 29 0 25.5 C10.5 22 10.5 22 21 25.5 C31.5 29 31.5 29 42 25.5 C52.5 22 52.5 22 63 25.5 C73.5 29 73.5 29 84 25.5 C94.5 22 94.5 22 105 25.5 C115.5 29 115.5 29 126 25.5 V52 H-84 Z',
  wave42Front:
    'M-84 27 C-73.5 22 -73.5 22 -63 27 C-52.5 32 -52.5 32 -42 27 C-31.5 22 -31.5 22 -21 27 C-10.5 32 -10.5 32 0 27 C10.5 22 10.5 22 21 27 C31.5 32 31.5 32 42 27 C52.5 22 52.5 22 63 27 C73.5 32 73.5 32 84 27 C94.5 22 94.5 22 105 27 C115.5 32 115.5 32 126 27 V52 H-84 Z',
} as const

export function TidelineMark({
  detail = 'full',
  color = '#1c2a22',
  className,
  label,
}: TidelineMarkProps) {
  const instanceId = useId().replaceAll(':', '')
  const clipId = `tideline-clip-${instanceId}`
  const titleId = `tideline-title-${instanceId}`
  const full = detail === 'full'
  const compact = detail === 'compact'

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      style={{ color }}
      role={label ? 'img' : undefined}
      aria-labelledby={label ? titleId : undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {label && <title id={titleId}>{label}</title>}
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect x="3" y="3" width="42" height="42" rx="10" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {full && (
          <>
            <g className="tideline-drift tideline-drift-84">
              <path className="tideline-bob tideline-bob-53" d={paths.swell84} fill="currentColor" opacity="0.2" />
            </g>
            <g className="tideline-drift tideline-drift-63">
              <path className="tideline-bob tideline-bob-67" d={paths.swell63} fill="currentColor" opacity="0.22" />
            </g>
          </>
        )}
        {(full || compact) && (
          <g className="tideline-drift tideline-drift-48">
            <path
              className="tideline-bob tideline-bob-41"
              d={paths.swell48}
              fill="currentColor"
              opacity={compact ? '0.28' : '0.26'}
            />
          </g>
        )}
        {(full || compact) && (
          <g className="tideline-drift tideline-drift-42-slow">
            <path d={paths.wave42Back} fill="currentColor" opacity={compact ? '0.32' : '0.3'} />
          </g>
        )}
        <g className="tideline-drift tideline-drift-42-fast">
          <path
            d={paths.wave42Front}
            fill="currentColor"
            opacity={detail === 'tiny' ? '1' : compact ? '0.46' : '0.42'}
          />
        </g>
      </g>
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="10"
        fill="none"
        stroke="currentColor"
        strokeWidth={detail === 'tiny' ? '5' : compact ? '3.4' : '3'}
      />
    </svg>
  )
}
