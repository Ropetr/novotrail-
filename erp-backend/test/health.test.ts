import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn } from 'child_process'
import path from 'path'

let devProcess: ReturnType<typeof spawn> | null = null

const waitForReady = (proc: ReturnType<typeof spawn>, timeoutMs = 30_000) => {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Backend dev server did not start in time'))
    }, timeoutMs)

    const onData = (data: Buffer) => {
      const text = data.toString()
      if (text.includes('http://localhost:8787') || text.includes('localhost:8787')) {
        clearTimeout(timeout)
        cleanup()
        resolve()
      }
    }

    const onError = (err: Error) => {
      clearTimeout(timeout)
      cleanup()
      reject(err)
    }

    const cleanup = () => {
      proc.stdout?.off('data', onData)
      proc.stderr?.off('data', onData)
      proc.off('error', onError)
    }

    proc.stdout?.on('data', onData)
    proc.stderr?.on('data', onData)
    proc.on('error', onError)
  })
}

beforeAll(async () => {
  devProcess = spawn(
    'pnpm',
    ['--filter', '@erp/backend', 'dev', '--', '--local', '--port', '8787'],
    {
      cwd: path.resolve(__dirname, '..'),
      shell: true,
      env: {
        ...process.env,
        ENVIRONMENT: 'development',
      },
    }
  )

  await waitForReady(devProcess)
})

afterAll(() => {
  if (devProcess && !devProcess.killed) {
    devProcess.kill()
  }
})

describe('health', () => {
  it('returns ok', async () => {
    const res = await fetch('http://localhost:8787/health')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })
})
