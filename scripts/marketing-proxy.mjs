#!/usr/bin/env node
import http from 'node:http'
import https from 'node:https'
import { spawn } from 'node:child_process'

const HOST = '127.0.0.1'
const PROXY_PORT = 8081
const EXPO_PORT = 8082
const STAGING_API_ORIGIN = 'https://dfy-be-staging.onrender.com'
const STAGING_API_PREFIX = '/api/v1'

if (process.env.EXPO_PUBLIC_DFY_API_URL !== `http://${HOST}:${PROXY_PORT}${STAGING_API_PREFIX}`) {
  console.error('Refusing to start screenshot proxy: EXPO_PUBLIC_DFY_API_URL must point to the local staging-only proxy.')
  process.exit(1)
}

const expo = spawn('npx', ['expo', 'start', '--web', '--port', String(EXPO_PORT), '--clear'], {
  stdio: 'inherit',
  env: { ...process.env, EXPO_PUBLIC_DFY_API_URL: `http://${HOST}:${PROXY_PORT}${STAGING_API_PREFIX}` },
  shell: process.platform === 'win32',
})

const server = http.createServer((req, res) => {
  const incomingUrl = new URL(req.url || '/', `http://${HOST}:${PROXY_PORT}`)

  // Only the exact staging API origin is reachable through the API proxy.
  const isApiRequest = incomingUrl.pathname === STAGING_API_PREFIX
    || incomingUrl.pathname.startsWith(`${STAGING_API_PREFIX}/`)

  if (isApiRequest) {
    const targetPath = `${incomingUrl.pathname}${incomingUrl.search}`
    const upstream = https.request(`${STAGING_API_ORIGIN}${targetPath}`, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(STAGING_API_ORIGIN).host,
        origin: STAGING_API_ORIGIN,
      },
    }, (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers)
      upstreamRes.pipe(res)
    })
    upstream.on('error', (error) => {
      console.error(`Staging API proxy failed for ${req.method} ${targetPath}: ${error.message}`)
      if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ success: false, message: 'Staging API is unavailable through the screenshot proxy.' }))
    })
    req.pipe(upstream)
    return
  }

  const upstream = http.request(`http://${HOST}:${EXPO_PORT}${req.url || '/'}`, {
    method: req.method,
    headers: { ...req.headers, host: `${HOST}:${EXPO_PORT}` },
  }, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers)
    upstreamRes.pipe(res)
  })
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(503, { 'content-type': 'text/plain' })
    res.end('Expo web server is starting.')
  })
  req.pipe(upstream)
})

server.listen(PROXY_PORT, HOST, () => {
  console.log(`DFY staging-only screenshot proxy listening on http://${HOST}:${PROXY_PORT}`)
})

function shutdown() {
  server.close()
  expo.kill('SIGTERM')
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
expo.on('exit', (code) => {
  if (code && code !== 0) process.exitCode = code
  server.close()
})
