import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Make a HEAD request to check headers without downloading content
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Cache-Checker/1.0",
      },
    })

    const headers = response.headers
    const cacheHeaders: string[] = []
    const details: any = {}

    const cachePluginHeaders = [
      "x-litespeed-cache",
      "x-cache",
      "x-fastcgi-cache",
      "x-wp-rocket-cache",
      "x-cache-status",
      "x-served-by",
      "x-cache-hit",
      "x-wp-super-cache",
      "x-cachify",
      "x-hyper-cache",
      "x-endurance-cache-level",
      "x-cache-enabled",
      "x-nginx-cache",
      "x-varnish",
      "x-proxy-cache",
      "cf-cache-status", // Cloudflare
      "x-amz-cf-pop", // CloudFront
      "x-served-from-cache",
      "x-cache-lookup",
      "x-cache-detail",
    ]

    let foundCachePlugin = false
    const pluginCacheInfo: string[] = []

    // Check for caching plugin headers
    cachePluginHeaders.forEach((headerName) => {
      const headerValue = headers.get(headerName)
      if (headerValue) {
        foundCachePlugin = true
        pluginCacheInfo.push(`${headerName}: ${headerValue}`)
        details[headerName.replace(/-/g, "_")] = headerValue
      }
    })

    // Check for standard cache headers (secondary indicators)
    const cacheControl = headers.get("cache-control")
    const expires = headers.get("expires")
    const etag = headers.get("etag")
    const lastModified = headers.get("last-modified")
    const pragma = headers.get("pragma")
    const vary = headers.get("vary")

    if (cacheControl) {
      cacheHeaders.push(`Cache-Control: ${cacheControl}`)
      details.cacheControl = cacheControl
    }

    if (expires) {
      cacheHeaders.push(`Expires: ${expires}`)
      details.expires = expires
    }

    if (etag) {
      cacheHeaders.push(`ETag: ${etag}`)
      details.etag = etag
    }

    if (lastModified) {
      cacheHeaders.push(`Last-Modified: ${lastModified}`)
      details.lastModified = lastModified
    }

    if (pragma) {
      cacheHeaders.push(`Pragma: ${pragma}`)
    }

    if (vary) {
      cacheHeaders.push(`Vary: ${vary}`)
    }

    const hasCache =
      foundCachePlugin ||
      (cacheHeaders.length > 0 &&
        cacheControl &&
        !cacheControl.includes("no-cache") &&
        !cacheControl.includes("no-store"))

    return NextResponse.json({
      hasCache,
      cacheType: foundCachePlugin ? "plugin" : "standard",
      pluginCacheHeaders: pluginCacheInfo,
      standardCacheHeaders: cacheHeaders,
      details,
      status: response.status,
      statusText: response.statusText,
    })
  } catch (error) {
    console.error("Cache check error:", error)
    return NextResponse.json({ error: "Failed to check cache headers" }, { status: 500 })
  }
}
