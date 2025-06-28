import { type NextRequest, NextResponse } from "next/server"

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET

export async function POST(request: NextRequest) {
  try {
    if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
      return NextResponse.json({ error: "Mux credentials not configured" }, { status: 500 })
    }

    const { title, description } = await request.json()

    const response = await fetch("https://api.mux.com/video/v1/uploads", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_asset_settings: {
          playbook_policy: ["public"],
          mp4_support: "standard",
          normalize_audio: true,
          passthrough: JSON.stringify({
            title: title || "Untitled Video",
            description: description || "",
          }),
        },
        cors_origin: "*",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Mux upload URL error:", errorText)
      throw new Error(`Failed to create upload URL: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ data: data.data })
  } catch (error) {
    console.error("Error creating upload URL:", error)
    return NextResponse.json({ error: "Failed to create upload URL", details: `${error}` }, { status: 500 })
  }
}
