/**
 * adds gzip content-encoding header to response so that cloudflare can compress it
 * @param response
 * @returns
 */
export const compressResponse = (response: Response): Response => {
  return new Response(response.body, {
    headers: {
      ...response.headers,
      'content-encoding': 'gzip',
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname
    if (pathname === '/favicon.ico' || pathname.startsWith('/_next')) {
      return await env.FRONTEND.fetch(request)
    }
    if (url.searchParams.has('_rsc')) {
      return compressResponse(await env.FRONTEND.fetch(request))
    }

    if (request.url.endsWith('/')) {
      return compressResponse(await env.FRONTEND.fetch(request))
    }
    const r2Response = await fetch(new Request(request))

    if (r2Response.status === 404) {
      return compressResponse(await env.FRONTEND.fetch(request))
    }
    return r2Response
  },
}
