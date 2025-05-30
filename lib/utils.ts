import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getDeviceInfo(): string {
  const userAgent = navigator.userAgent
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return /iPad/.test(userAgent) ? "📱 Tablet" : "📱 Mobile"
  }
  return "💻 Desktop"
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length
}

export function exportToFile(content: string, filename: string, mimeType = "text/plain") {
  const dataStr = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content)
  const downloadAnchorNode = document.createElement("a")
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", filename)
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
