import { NextRequest, NextResponse } from "next/server"
import { validateLicense } from "@/lib/license"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { licenseKey } = body
    
    if (!licenseKey || typeof licenseKey !== "string") {
      return NextResponse.json(
        { 
          isValid: false,
          message: "Clave de licencia requerida"
        },
        { status: 400 }
      )
    }
    
    // Validar la licencia
    const result = await validateLicense(licenseKey.trim())
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error("Error validating license:", error)
    return NextResponse.json(
      { 
        isValid: false,
        message: "Error interno al validar la licencia"
      },
      { status: 500 }
    )
  }
}
