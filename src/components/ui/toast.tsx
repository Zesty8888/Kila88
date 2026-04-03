import { useStore } from '@/store'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export function ToastContainer() {
  const { state, dispatch } = useStore()

  if (state.toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {state.toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-elegant animate-slide-in ${
            toast.type === 'error' ? 'border-destructive/30' : toast.type === 'success' ? 'border-success/30' : 'border-primary/30'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-success shrink-0" />}
          {toast.type === 'error' && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-primary shrink-0" />}
          <span className="text-sm text-card-foreground">{toast.message}</span>
          <button
            onClick={() => dispatch({ type: 'REMOVE_TOAST', id: toast.id })}
            className="ml-2 text-muted-foreground hover:text-foreground transition-smooth shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}