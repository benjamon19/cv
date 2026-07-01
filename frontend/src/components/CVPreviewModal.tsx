import { X, Download, Pencil } from 'lucide-react'
import type { OutputFormat } from '../types/cv'

interface Props {
  url: string
  format: OutputFormat
  onDownload: () => void
  onClose: () => void
}

export default function CVPreviewModal({ url, format, onDownload, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Vista previa de tu CV</h3>
            <p className="text-xs text-zinc-500">Revisa el resultado antes de descargarlo.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-zinc-100 p-4">
          {format === 'pdf' ? (
            <iframe
              src={url}
              title="Vista previa del CV"
              className="w-full h-[65vh] rounded-lg border border-zinc-200 bg-white"
            />
          ) : (
            <img
              src={url}
              alt="Vista previa del CV"
              className="max-w-full h-auto rounded-lg border border-zinc-200 bg-white mx-auto"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
              text-zinc-600 bg-zinc-100 hover:bg-zinc-200 active:scale-95 transition-all duration-200
            "
          >
            <Pencil className="w-4 h-4" />
            Volver a editar
          </button>
          <button
            onClick={onDownload}
            className="
              inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold
              text-white bg-zinc-900 hover:bg-zinc-700 active:scale-95 transition-all duration-200
            "
          >
            <Download className="w-4 h-4" />
            Descargar {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  )
}
