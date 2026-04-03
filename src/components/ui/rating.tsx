import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  showValue?: boolean
}

export function Rating({ value, max = 5, size = 'sm', showValue = false }: RatingProps) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < Math.floor(value)
              ? 'fill-accent text-accent'
              : i < value
                ? 'fill-accent/50 text-accent'
                : 'text-muted-foreground/30'
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-foreground">{value.toFixed(1)}</span>
      )}
    </div>
  )
}