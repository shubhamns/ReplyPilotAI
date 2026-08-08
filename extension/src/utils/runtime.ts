export function isExtensionAlive(): boolean {
  try {
    return Boolean(chrome.runtime?.id)
  } catch {
    return false
  }
}

export function safeRuntimeSendMessage<T = unknown>(message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!isExtensionAlive()) {
      reject(new Error('Extension context invalidated'))
      return
    }
    try {
      chrome.runtime.sendMessage(message, (response: T) => {
        const err = chrome.runtime.lastError
        if (err) {
          reject(new Error(err.message))
          return
        }
        resolve(response)
      })
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}
