export type CopyTextResult = 'success' | 'unsupported' | 'failed'

export async function copyTextToClipboard(textToCopy: string): Promise<CopyTextResult> {
  if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function') {
    return 'unsupported'
  }

  try {
    await navigator.clipboard.writeText(textToCopy)
    return 'success'
  } catch {
    return 'failed'
  }
}
