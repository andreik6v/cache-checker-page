"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Globe, CheckCircle, XCircle, AlertCircle, Zap } from "lucide-react"

interface CacheResult {
  hasCache: boolean
  cacheType: "plugin" | "standard"
  pluginCacheHeaders: string[]
  standardCacheHeaders: string[]
  details: Record<string, string>
}

export default function CacheChecker() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CacheResult | null>(null)
  const { toast } = useToast()

  const checkCache = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    // Basic URL validation
    let formattedUrl = url
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      formattedUrl = `https://${url}`
    }

    try {
      new URL(formattedUrl)
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/check-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formattedUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to check cache")
      }

      const data = await response.json()
      setResult(data)

      toast({
        title: "Success",
        description: "Cache check completed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check cache. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    checkCache()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Cache Checker</h1>
          <p className="text-muted-foreground">Check if your website uses caching headers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Website URL
            </CardTitle>
            <CardDescription>Enter the URL you want to check for caching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="example.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking Cache...
                  </>
                ) : (
                  "Check Cache"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {result.hasCache ? (
                  <>
                    {result.cacheType === "plugin" ? (
                      <Zap className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    )}
                  </>
                ) : (
                  <XCircle className="h-4 w-4 mr-2 text-destructive" />
                )}
                Cache Status
              </CardTitle>
              <CardDescription>
                {result.hasCache
                  ? result.cacheType === "plugin"
                    ? "Your website is using caching plugins/CDN"
                    : "Your website is using standard caching headers"
                  : "No caching headers detected"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cache Enabled:</span>
                  <span className={`text-sm ${result.hasCache ? "text-green-500" : "text-destructive"}`}>
                    {result.hasCache ? "Yes" : "No"}
                  </span>
                </div>

                {result.pluginCacheHeaders.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Caching Plugin/CDN Headers:
                      </span>
                    </div>
                    <div className="space-y-1">
                      {result.pluginCacheHeaders.map((header, index) => (
                        <div
                          key={index}
                          className="text-xs font-mono bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-2 border-green-500"
                        >
                          {header}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.standardCacheHeaders.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Standard Cache Headers:</span>
                    <div className="space-y-1">
                      {result.standardCacheHeaders.map((header, index) => (
                        <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                          {header}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!result.hasCache && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <p className="font-medium">No cache headers found</p>
                      <p className="text-xs mt-1">
                        Consider adding caching plugins like LiteSpeed Cache, WP Rocket, or enabling CDN caching to
                        improve performance.
                      </p>
                    </div>
                  </div>
                )}

                {result.hasCache && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Cache Type:</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        result.cacheType === "plugin"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {result.cacheType === "plugin" ? "Plugin/CDN Cache" : "Standard HTTP Cache"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
