import { type NextRequest, NextResponse } from "next/server"

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET

export async function POST(request: NextRequest) {
  try {
    if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
      return NextResponse.json({ error: "Mux credentials not configured" }, { status: 500 })
    }

    const { title, description } = await request.json()

    const response = await fetch("https://api.mux.com/video/v1/assets", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [
          {
            url: "https://storage.googleapis.com/muxdemofiles/mux-video-intro.mp4",
          },
        ],
        playback_policy: ["public"],
        mp4_support: "standard",
        normalize_audio: true,
        master_access: "temporary",
        test: false,
        passthrough: JSON.stringify({
          title: title || "Untitled Video",
          description: description || "",
        }),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Mux API error:", errorText)
      throw new Error(`Mux API responded with ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json({ data: data.data })
  } catch (error) {
    console.error("Error creating video asset:", error)
    return NextResponse.json({ error: "Failed to create video asset", details: `${error}` }, { status: 500 })
  }
}
