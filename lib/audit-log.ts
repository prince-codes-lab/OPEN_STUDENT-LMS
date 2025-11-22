const auditLogs: Array<{
  timestamp: number
  userId: string | null
  action: string
  resource: string
  resourceId?: string
  status: "success" | "failure"
  details?: string
  ipAddress?: string
}> = []

function cleanupOldLogs() {
  const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000 // Keep last 7 days
  while (auditLogs.length > 0 && auditLogs[0].timestamp < cutoffTime) {
    auditLogs.shift()
  }
}

export function logAudit(data: {
  userId: string | null
  action: string
  resource: string
  resourceId?: string
  status: "success" | "failure"
  details?: string
  ipAddress?: string
}) {
  cleanupOldLogs()

  auditLogs.push({
    timestamp: Date.now(),
    ...data,
  })

  // Log to console in production
  if (process.env.NODE_ENV === "production") {
    console.log(
      "[AUDIT]",
      JSON.stringify({
        timestamp: new Date().toISOString(),
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        status: data.status,
        ipAddress: data.ipAddress,
      }),
    )
  }
}

export function getAuditLogs(filter?: {
  userId?: string
  action?: string
  status?: "success" | "failure"
  startTime?: number
  endTime?: number
}) {
  let filtered = [...auditLogs]

  if (filter?.userId) {
    filtered = filtered.filter((log) => log.userId === filter.userId)
  }

  if (filter?.action) {
    filtered = filtered.filter((log) => log.action === filter.action)
  }

  if (filter?.status) {
    filtered = filtered.filter((log) => log.status === filter.status)
  }

  if (filter?.startTime) {
    filtered = filtered.filter((log) => log.timestamp >= filter.startTime!)
  }

  if (filter?.endTime) {
    filtered = filtered.filter((log) => log.timestamp <= filter.endTime!)
  }

  return filtered
}
