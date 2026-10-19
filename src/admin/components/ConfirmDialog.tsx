interface ConfirmDialogProps {
  title: string
  message: string
  confirmText?: string
  onConfirm: () => void
  onCancel: () => void
}

/** 通用二次确认弹窗（所有删除/危险操作必须走这里） */
export default function ConfirmDialog({ title, message, confirmText = '确认删除', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onCancel} role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-space-card p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-mist">{title}</h3>
        <p className="mt-2 text-sm text-mist-dim">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-mist-dim transition-colors hover:bg-white/5 hover:text-mist"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
