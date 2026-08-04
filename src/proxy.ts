import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export function proxy(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const password = process.env.SITE_PASSWORD

  if (!password) {
    return NextResponse.next() // dev fallback: no password set
  }

  if (authHeader.startsWith('Basic ')) {
    const encoded = authHeader.slice(6)
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    // accept any username, check password only
    const [, pass] = decoded.split(':')
    if (pass === password) return NextResponse.next()
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="WECode Planning Hub"',
    },
  })
}
