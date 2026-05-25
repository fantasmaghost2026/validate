import { NextRequest, NextResponse } from "next/server"
import { generateLicense } from "@/lib/license"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { licenseId, ownerName, validityDays, activationDate } = body
    
    // Validaciones
    if (!licenseId || typeof licenseId !== "string") {
      return NextResponse.json(
        { error: "ID de licencia requerido" },
        { status: 400 }
      )
    }
    
    if (!ownerName || typeof ownerName !== "string") {
      return NextResponse.json(
        { error: "Nombre del propietario requerido" },
        { status: 400 }
      )
    }
    
    if (!validityDays || typeof validityDays !== "number" || validityDays <= 0) {
      return NextResponse.json(
        { error: "Días de validez debe ser un número positivo" },
        { status: 400 }
      )
    }
    
    if (!activationDate || !/^\d{4}-\d{2}-\d{2}$/.test(activationDate)) {
      return NextResponse.json(
        { error: "Fecha de activación inválida (formato: YYYY-MM-DD)" },
        { status: 400 }
      )
    }
    
    // Generar la licencia
    const license = await generateLicense({
      licenseId,
      ownerName,
      validityDays,
      activationDate
    })
    
    return NextResponse.json(license)
    
  } catch (error) {
    console.error("Error generating license:", error)
    return NextResponse.json(
      { error: "Error interno al generar la licencia" },
      { status: 500 }
    )
  }
}
