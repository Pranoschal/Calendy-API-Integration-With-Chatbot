export default function getMessageDate(message: unknown): Date {
  try {
    const m = message as any

    if (m && ("createdAt" in m) && m.createdAt) {
      return new Date(m.createdAt)
    }

    if (m && m.metadata && (m.metadata.createdAt || m.metadata.timestamp)) {
      return new Date(m.metadata.createdAt ?? m.metadata.timestamp)
    }
    if (m && (m.timestamp || m.ts)) {
      return new Date(m.timestamp ?? m.ts)
    }
    return new Date()
  } catch {
    return new Date()
  }
}
