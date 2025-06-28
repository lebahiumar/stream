import { type NextRequest, NextResponse } from "next/server"

const { MUX_TOKEN_ID, MUX_TOKEN_SECRET } = process.env

const makeAuthHeader = () => {
  if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) return undefined
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64")
      : globalThis.btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`)
  return `Basic ${encoded}`
}

/* ------------------------------------------------------------------ */
/* GET /api/videos/[id]                                               */
/* ------------------------------------------------------------------ */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = makeAuthHeader()
  if (!auth) {
    return NextResponse.json({ data: null, warning: "MUX credentials are missing." }, { status: 200 })
  }

  try {
    const muxRes = await fetch(`https://api.mux.com/video/v1/assets/${params.id}`, {
      headers: { Authorization: auth, "Content-Type": "application/json" },
    })

    if (muxRes.ok) {
      const muxJson = await muxRes.json()
      // muxJson.data is the single asset object
      return NextResponse.json({ data: muxJson.data ?? null }, { status: 200 })
    }

    const text = await muxRes.text()
    return NextResponse.json(
      {
        data: null,
        error: `Mux responded ${muxRes.status}`,
        details: text.slice(0, 200),
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("Mux fetch error:", err)
    return NextResponse.json({ data: null, error: "Failed to reach Mux.", details: `${err}` }, { status: 200 })
  }
}
