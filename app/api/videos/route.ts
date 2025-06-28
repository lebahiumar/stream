import { type NextRequest, NextResponse } from "next/server"

const { MUX_TOKEN_ID, MUX_TOKEN_SECRET } = process.env

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function makeAuthHeader(): string | undefined {
  if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) return undefined
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64")
      : globalThis.btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`)
  return `Basic ${encoded}`
}

/* ------------------------------------------------------------------ */
/* GET /api/videos                                                    */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") ?? "20"
  const page = req.nextUrl.searchParams.get("page") ?? "1"

  // ─── Credentials missing → return empty list with warning ─────────
  const auth = makeAuthHeader()
  if (!auth) {
    return NextResponse.json({ data: [], warning: "MUX credentials are missing." }, { status: 200 })
  }

  try {
    const muxRes = await fetch(`https://api.mux.com/video/v1/assets?limit=${limit}&page=${page}`, {
      headers: { Authorization: auth, "Content-Type": "application/json" },
    })

    // Success path
    if (muxRes.ok) {
      const muxJson = await muxRes.json()
      // Return ONLY the assets array so the front-end always gets an array
      return NextResponse.json({ data: muxJson.data ?? [] }, { status: 200 })
    }

    // Mux returned an error status
    const text = await muxRes.text()
    return NextResponse.json(
      {
        data: [],
        error: `Mux responded ${muxRes.status}`,
        details: text.slice(0, 200),
      },
      { status: 200 },
    )
  } catch (err) {
    // Network / fetch failure
    console.error("Mux fetch error:", err)
    return NextResponse.json({ data: [], error: "Failed to reach Mux.", details: `${err}` }, { status: 200 })
  }
}
