"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Copy, Key, Shield, Database, Calendar, User, Hash, Clock, Terminal, Skull, Zap, Timer, TrendingUp, RefreshCw, AlertTriangle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { VALIDITY_PRESETS } from "@/lib/license"

interface GeneratedLicense {
  licenseId: string
  ownerName: string
  validityDays: number
  activationDate: string
  hashString: string
  fullLicenseKey: string
  updateCode: string
  updateCodeHash: string
  licInfoData: {
    id: number
    init: string
    qty: number
    owner: string
    string: string
    license_id: string
  }
  licCodeData: {
    id: number
    code: string
    qty: number
    license_id: string
  }
  expirationInfo: {
    expirationDate: string
    expirationTimestamp: number
    totalDays: number
    daysFromToday: number
    isActiveFromToday: boolean
    formattedValidity: string
  }
  phpVerification?: {
    licInfoValidationString: string
    licCodeValidationString: string
    phpCodeLicInfo: string
    phpCodeLicCode: string
  }
}

interface ValidationResult {
  isValid: boolean
  message: string
  parsedData?: {
    hashString: string
    licenseId: string
    activationDate: string
    validityDays: number
    ownerName: string
  }
  expirationDate?: string
  daysRemaining?: number
  daysUsed?: number
  percentUsed?: number
  isExpired?: boolean
  status?: "active" | "expired" | "warning" | "critical" | "invalid"
  statusMessage?: string
  detailedTimeRemaining?: {
    years: number
    months: number
    days: number
    formatted: string
  }
}

// Componente de texto con efecto glitch
function GlitchText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block glitch ${className}`}>
      {children}
    </span>
  )
}

// Componente de efecto Matrix Rain
function MatrixRain() {
  const [columns, setColumns] = useState<number[]>([])
  
  useEffect(() => {
    const cols = Math.floor(window.innerWidth / 20)
    setColumns(Array.from({ length: cols }, () => Math.random() * 100))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
      {columns.map((delay, i) => (
        <div
          key={i}
          className="absolute top-0 text-primary font-mono text-xs"
          style={{
            left: `${i * 20}px`,
            animation: `matrix-rain ${3 + Math.random() * 2}s linear infinite`,
            animationDelay: `${delay * 0.05}s`,
          }}
        >
          {Array.from({ length: 20 }, () => 
            String.fromCharCode(0x30A0 + Math.random() * 96)
          ).join('\n')}
        </div>
      ))}
    </div>
  )
}

// Terminal typing effect
function TerminalText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("")
  
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [text])

  return (
    <span className="font-mono">
      {displayText}
      <span className="animate-pulse">_</span>
    </span>
  )
}

// Progress bar component with enhanced styling
function ProgressBar({ percent, status }: { percent: number; status: string }) {
  const getColor = () => {
    if (status === "expired") return "bg-red-500"
    if (status === "critical") return "bg-red-400"
    if (status === "warning") return "bg-yellow-500"
    return "bg-primary"
  }
  
  const getGlow = () => {
    if (status === "expired") return "shadow-[0_0_10px_rgba(239,68,68,0.5)]"
    if (status === "critical") return "shadow-[0_0_10px_rgba(248,113,113,0.5)]"
    if (status === "warning") return "shadow-[0_0_10px_rgba(234,179,8,0.5)]"
    return "shadow-[0_0_10px_rgba(0,255,65,0.3)]"
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1 font-mono">
        <span className="text-muted-foreground">TIEMPO USADO</span>
        <span className={status === "expired" ? "text-red-400" : "text-primary"}>{percent.toFixed(1)}%</span>
      </div>
      <div className="w-full h-4 bg-background/50 rounded-full overflow-hidden border border-primary/30">
        <div 
          className={`h-full transition-all duration-500 ${getColor()} ${getGlow()}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  )
}

// Status indicator component
function StatusIndicator({ status }: { status: string }) {
  const config = {
    active: { color: "bg-primary", text: "ACTIVO", icon: CheckCircle2, pulse: true },
    warning: { color: "bg-yellow-500", text: "ADVERTENCIA", icon: AlertTriangle, pulse: true },
    critical: { color: "bg-red-400", text: "CRITICO", icon: AlertCircle, pulse: true },
    expired: { color: "bg-red-500", text: "EXPIRADO", icon: XCircle, pulse: false },
    invalid: { color: "bg-gray-500", text: "INVALIDO", icon: XCircle, pulse: false },
  }
  
  const { color, text, icon: Icon, pulse } = config[status as keyof typeof config] || config.invalid
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}/20 border border-current`}>
      <div className={`w-2 h-2 rounded-full ${color} ${pulse ? "animate-pulse" : ""}`} />
      <Icon className="h-4 w-4" />
      <span className="font-mono text-sm font-bold">{text}</span>
    </div>
  )
}

export default function LicenseGenerator() {
  // Estado para generacion
  const [licenseId, setLicenseId] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [validityDays, setValidityDays] = useState("365")
  const [activationDate, setActivationDate] = useState(new Date().toISOString().split("T")[0])
  const [generatedLicense, setGeneratedLicense] = useState<GeneratedLicense | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showPresets, setShowPresets] = useState(false)
  const [sqlTab, setSqlTab] = useState<"combined" | "licInfo" | "licCode">("combined")

  // Estado para validacion
  const [licenseKeyToValidate, setLicenseKeyToValidate] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Copiar al portapapeles
  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
  }

  // Aplicar preset de dias
  const applyPreset = (days: number) => {
    setValidityDays(days.toString())
    setShowPresets(false)
  }

  // Formatear dias a texto legible
  const formatDaysToReadable = useCallback((days: number) => {
    const years = Math.floor(days / 365)
    const months = Math.floor((days % 365) / 30)
    const remainingDays = days % 30
    
    const parts = []
    if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`)
    if (months > 0) parts.push(`${months} mes${months > 1 ? 'es' : ''}`)
    if (remainingDays > 0 || parts.length === 0) parts.push(`${remainingDays} dia${remainingDays !== 1 ? 's' : ''}`)
    
    return parts.join(', ')
  }, [])

  // Generar licencia
  const handleGenerate = async () => {
    if (!licenseId || !ownerName || !validityDays || !activationDate) {
      setGenerateError("ERROR: Datos incompletos - Todos los campos son requeridos")
      return
    }

    const days = parseInt(validityDays)
    if (isNaN(days) || days <= 0) {
      setGenerateError("ERROR: Los dias de validez deben ser un numero positivo")
      return
    }

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const response = await fetch("/api/license/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId,
          ownerName,
          validityDays: days,
          activationDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al generar licencia")
      }

      setGeneratedLicense(data)
    } catch (error) {
      setGenerateError(`FATAL_ERROR: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Validar licencia
  const handleValidate = async () => {
    if (!licenseKeyToValidate.trim()) {
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch("/api/license/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: licenseKeyToValidate }),
      })

      const data = await response.json()
      setValidationResult(data)
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
        status: "invalid",
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Generar SQL statements
  const generateLicInfoSQL = (license: GeneratedLicense) => {
    const { licInfoData, expirationInfo, phpVerification } = license
    const escapedOwner = licInfoData.owner.replace(/'/g, "''")
    return `-- ============================================
-- SQL para tabla lic_info (Licencia Principal)
-- Generado: ${new Date().toISOString()}
-- License ID: ${licInfoData.license_id}
-- Expira: ${expirationInfo.expirationDate}
-- Validez: ${expirationInfo.formattedValidity}
-- ============================================
-- String de validacion PHP: ${phpVerification?.licInfoValidationString || `${licInfoData.init}-${licInfoData.qty}-${licInfoData.owner}`}
-- ============================================

-- INSERTAR nueva licencia
INSERT INTO lic_info (id, init, qty, owner, string, license_id)
VALUES (
  ${licInfoData.id},
  '${licInfoData.init}',
  ${licInfoData.qty},
  '${escapedOwner}',
  '${licInfoData.string}',
  '${licInfoData.license_id}'
);

-- ACTUALIZAR licencia existente (alternativa)
UPDATE lic_info SET
  init = '${licInfoData.init}',
  qty = ${licInfoData.qty},
  owner = '${escapedOwner}',
  string = '${licInfoData.string}',
  license_id = '${licInfoData.license_id}',
  updated_at = CURRENT_TIMESTAMP
WHERE id = ${licInfoData.id};`
  }

  const generateLicCodeSQL = (license: GeneratedLicense) => {
    const { licCodeData, phpVerification } = license
    return `-- ============================================
-- SQL para tabla lic_code (Codigo de Actualizacion)
-- Generado: ${new Date().toISOString()}
-- License ID: ${licCodeData.license_id}
-- Dias: ${licCodeData.qty}
-- ============================================
-- String de validacion PHP: ${phpVerification?.licCodeValidationString || `${licCodeData.license_id}-${licCodeData.qty}`}
-- ============================================

-- INSERTAR nuevo codigo
INSERT INTO lic_code (id, code, qty, license_id)
VALUES (${licCodeData.id}, '${licCodeData.code}', ${licCodeData.qty}, '${licCodeData.license_id}');

-- ACTUALIZAR codigo existente (alternativa)
UPDATE lic_code SET
  code = '${licCodeData.code}',
  qty = ${licCodeData.qty},
  license_id = '${licCodeData.license_id}',
  updated_at = CURRENT_TIMESTAMP
WHERE id = ${licCodeData.id};`
  }

  const generateCombinedSQL = (license: GeneratedLicense) => {
    const { licInfoData, licCodeData, expirationInfo, phpVerification } = license
    const escapedOwner = licInfoData.owner.replace(/'/g, "''")
    return `-- ============================================
-- SQL COMPLETO - BITSELL POS License System
-- ============================================
-- Generado: ${new Date().toISOString()}
-- License ID: ${licInfoData.license_id}
-- Owner: ${escapedOwner}
-- Activacion: ${licInfoData.init}
-- Validez: ${licInfoData.qty} dias (${expirationInfo.formattedValidity})
-- Expira: ${expirationInfo.expirationDate}
-- ============================================
-- VERIFICACION PHP:
-- lic_info: password_verify("${phpVerification?.licInfoValidationString || `${licInfoData.init}-${licInfoData.qty}-${licInfoData.owner}`}", $hash)
-- lic_code: password_verify("${phpVerification?.licCodeValidationString || `${licCodeData.license_id}-${licCodeData.qty}`}", $hash)
-- ============================================

-- =====================
-- TABLA: lic_info
-- =====================
INSERT INTO lic_info (id, init, qty, owner, string, license_id)
VALUES (
  ${licInfoData.id},
  '${licInfoData.init}',
  ${licInfoData.qty},
  '${escapedOwner}',
  '${licInfoData.string}',
  '${licInfoData.license_id}'
)
ON DUPLICATE KEY UPDATE
  init = VALUES(init),
  qty = VALUES(qty),
  owner = VALUES(owner),
  string = VALUES(string),
  license_id = VALUES(license_id);

-- =====================
-- TABLA: lic_code
-- =====================
INSERT INTO lic_code (id, code, qty, license_id)
VALUES (${licCodeData.id}, '${licCodeData.code}', ${licCodeData.qty}, '${licCodeData.license_id}')
ON DUPLICATE KEY UPDATE
  code = VALUES(code),
  qty = VALUES(qty),
  license_id = VALUES(license_id);`
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Scanline effect */}
      <div className="scanline" />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Skull className="h-8 w-8 text-primary flicker" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <GlitchText>HACKEADO</GlitchText>
            </h1>
            <Skull className="h-8 w-8 text-primary flicker" />
          </div>
          <p className="text-primary/80 font-mono text-sm md:text-base">
            <TerminalText text="[SISTEMA BITSELL POS COMPROMETIDO] // License Bypass Tool v2.0" />
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline" className="hacker-border text-primary font-mono">
              <Shield className="h-3 w-3 mr-1" /> STATUS: BYPASSED
            </Badge>
            <Badge variant="outline" className="hacker-border text-primary font-mono">
              <Zap className="h-3 w-3 mr-1" /> ACCESS: ROOT
            </Badge>
            <Badge variant="outline" className="hacker-border text-primary font-mono">
              <Terminal className="h-3 w-3 mr-1" /> MODE: STEALTH
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="generate" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6 hacker-glow">
            <TabsTrigger value="generate" className="data-[state=active]:bg-primary data-[state=active]:text-background font-mono">
              <Key className="h-4 w-4 mr-2" /> GENERAR CRACK
            </TabsTrigger>
            <TabsTrigger value="validate" className="data-[state=active]:bg-primary data-[state=active]:text-background font-mono">
              <Shield className="h-4 w-4 mr-2" /> VERIFICAR
            </TabsTrigger>
          </TabsList>

          {/* Generador de Licencias */}
          <TabsContent value="generate">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Input Form */}
              <Card className="hacker-border bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Terminal className="h-5 w-5" />
                    <span className="font-mono">PARAMETROS_CRACK</span>
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-muted-foreground">
                    {"// Introduce los datos para generar la licencia"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* License ID */}
                  <div className="space-y-2">
                    <Label htmlFor="licenseId" className="flex items-center gap-2 font-mono text-sm">
                      <Hash className="h-4 w-4 text-primary" />
                      LICENSE_ID
                    </Label>
                    <Input
                      id="licenseId"
                      placeholder="ej: 1779504437"
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      className="font-mono bg-background/50 hacker-border focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground font-mono">{"// ID unico de la instalacion"}</p>
                  </div>

                  {/* Owner Name */}
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="flex items-center gap-2 font-mono text-sm">
                      <User className="h-4 w-4 text-primary" />
                      TARGET_NAME
                    </Label>
                    <Input
                      id="ownerName"
                      placeholder="ej: Empresa XYZ"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="font-mono bg-background/50 hacker-border focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground font-mono">{"// Nombre del propietario/negocio"}</p>
                  </div>

                  {/* Activation Date */}
                  <div className="space-y-2">
                    <Label htmlFor="activationDate" className="flex items-center gap-2 font-mono text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      ACTIVATION_DATE
                    </Label>
                    <Input
                      id="activationDate"
                      type="date"
                      value={activationDate}
                      onChange={(e) => setActivationDate(e.target.value)}
                      className="font-mono bg-background/50 hacker-border focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground font-mono">{"// Fecha de inicio de la licencia"}</p>
                  </div>

                  {/* Validity Days */}
                  <div className="space-y-2">
                    <Label htmlFor="validityDays" className="flex items-center gap-2 font-mono text-sm">
                      <Timer className="h-4 w-4 text-primary" />
                      VALIDITY_DAYS
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="validityDays"
                        type="number"
                        min="1"
                        placeholder="ej: 365"
                        value={validityDays}
                        onChange={(e) => setValidityDays(e.target.value)}
                        className="font-mono bg-background/50 hacker-border focus:ring-primary"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setShowPresets(!showPresets)}
                        className="hacker-border font-mono"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                    {validityDays && parseInt(validityDays) > 0 && (
                      <p className="text-xs text-primary font-mono">
                        {"// "}{formatDaysToReadable(parseInt(validityDays))}
                      </p>
                    )}
                    
                    {/* Presets dropdown */}
                    {showPresets && (
                      <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-background/90 rounded-lg hacker-border">
                        {VALIDITY_PRESETS.map((preset) => (
                          <Button
                            key={preset.days}
                            variant="ghost"
                            size="sm"
                            onClick={() => applyPreset(preset.days)}
                            className="justify-start font-mono text-xs hover:bg-primary/20 hover:text-primary"
                          >
                            <span className="text-primary mr-2">{">>"}</span>
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="bg-primary/30" />

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="w-full pulse-glow font-mono text-background"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        PROCESANDO...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        EJECUTAR CRACK
                      </>
                    )}
                  </Button>

                  {generateError && (
                    <Alert variant="destructive" className="hacker-border">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="font-mono">ERROR</AlertTitle>
                      <AlertDescription className="font-mono text-sm">{generateError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="hacker-border bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Key className="h-5 w-5" />
                    <span className="font-mono">OUTPUT_LICENCIA</span>
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-muted-foreground">
                    {"// Licencia generada - Compatible con BITSELL POS"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedLicense ? (
                    <div className="space-y-4">
                      {/* License Key */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-mono text-sm text-primary flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            CLAVE_COMPLETA (lic_info)
                          </Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(generatedLicense.fullLicenseKey, "Clave de licencia")}
                            className="h-8 px-2 hover:bg-primary/20"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          readOnly
                          value={generatedLicense.fullLicenseKey}
                          className="font-mono text-xs h-24 bg-background/50 hacker-border text-primary resize-none"
                        />
                        <p className="text-xs text-muted-foreground font-mono">
                          {"// Esta clave bypasea la verificacion completa"}
                        </p>
                      </div>

                      {/* Update Code (lic_code) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-mono text-sm text-yellow-500 flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            CODIGO_ACTUALIZACION (lic_code)
                          </Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(generatedLicense.updateCode, "Codigo de actualizacion")}
                            className="h-8 px-2 hover:bg-yellow-500/20"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          readOnly
                          value={generatedLicense.updateCode}
                          className="font-mono text-xs bg-background/50 hacker-border text-yellow-500"
                        />
                        <p className="text-xs text-muted-foreground font-mono">
                          {"// Codigo para renovar licencia via validate_lic_manual()"}
                        </p>
                      </div>

                      <Separator className="bg-primary/30" />

                      {/* Expiration Info */}
                      <div className="p-3 rounded-lg bg-background/50 hacker-border">
                        <h4 className="font-mono text-sm text-primary mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          INFO_EXPIRACION
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                          <div>
                            <span className="text-muted-foreground">Activacion:</span>
                            <p className="text-primary">{generatedLicense.activationDate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expiracion:</span>
                            <p className="text-primary">{generatedLicense.expirationInfo.expirationDate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Dias:</span>
                            <p className="text-primary">{generatedLicense.validityDays.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Validez:</span>
                            <p className="text-primary">{generatedLicense.expirationInfo.formattedValidity}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Badge 
                            variant="outline" 
                            className={`font-mono ${generatedLicense.expirationInfo.isActiveFromToday ? "text-primary border-primary" : "text-red-400 border-red-400"}`}
                          >
                            {generatedLicense.expirationInfo.isActiveFromToday 
                              ? `ACTIVA (${generatedLicense.expirationInfo.daysFromToday} dias restantes desde hoy)`
                              : "EXPIRADA"}
                          </Badge>
                        </div>
                      </div>

                      <Separator className="bg-primary/30" />

                      {/* SQL Output */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="font-mono text-sm text-primary flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            SQL_OUTPUT
                          </Label>
                        </div>
                        
                        {/* SQL Tabs */}
                        <div className="flex gap-1 p-1 bg-background/50 rounded-lg hacker-border">
                          <Button 
                            variant={sqlTab === "combined" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSqlTab("combined")}
                            className="font-mono text-xs flex-1"
                          >
                            COMPLETO
                          </Button>
                          <Button 
                            variant={sqlTab === "licInfo" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSqlTab("licInfo")}
                            className="font-mono text-xs flex-1"
                          >
                            lic_info
                          </Button>
                          <Button 
                            variant={sqlTab === "licCode" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSqlTab("licCode")}
                            className="font-mono text-xs flex-1"
                          >
                            lic_code
                          </Button>
                        </div>

                        <div className="relative">
                          <Textarea
                            readOnly
                            value={
                              sqlTab === "combined" 
                                ? generateCombinedSQL(generatedLicense)
                                : sqlTab === "licInfo"
                                  ? generateLicInfoSQL(generatedLicense)
                                  : generateLicCodeSQL(generatedLicense)
                            }
                            className="font-mono text-xs h-48 bg-background/50 hacker-border text-muted-foreground resize-none"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(
                              sqlTab === "combined" 
                                ? generateCombinedSQL(generatedLicense)
                                : sqlTab === "licInfo"
                                  ? generateLicInfoSQL(generatedLicense)
                                  : generateLicCodeSQL(generatedLicense),
                              "SQL"
                            )}
                            className="absolute top-2 right-2 h-8 px-2 hover:bg-primary/20"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Database Table Preview */}
                      <div className="space-y-2">
                        <Label className="font-mono text-sm text-primary flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          TABLA_lic_info
                        </Label>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs font-mono">
                            <thead>
                              <tr className="border-b border-primary/30">
                                <th className="text-left p-2 text-primary">id</th>
                                <th className="text-left p-2 text-primary">init</th>
                                <th className="text-left p-2 text-primary">qty</th>
                                <th className="text-left p-2 text-primary">owner</th>
                                <th className="text-left p-2 text-primary">license_id</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-primary/10">
                                <td className="p-2">{generatedLicense.licInfoData.id}</td>
                                <td className="p-2">{generatedLicense.licInfoData.init}</td>
                                <td className="p-2 text-yellow-500">{generatedLicense.licInfoData.qty}</td>
                                <td className="p-2">{generatedLicense.licInfoData.owner}</td>
                                <td className="p-2">{generatedLicense.licInfoData.license_id}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-mono text-sm text-yellow-500 flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          TABLA_lic_code
                        </Label>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs font-mono">
                            <thead>
                              <tr className="border-b border-yellow-500/30">
                                <th className="text-left p-2 text-yellow-500">id</th>
                                <th className="text-left p-2 text-yellow-500">code (hash)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-yellow-500/10">
                                <td className="p-2">{generatedLicense.licCodeData.id}</td>
                                <td className="p-2 text-yellow-500 truncate max-w-[200px]">{generatedLicense.licCodeData.code}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <Terminal className="h-16 w-16 mb-4 opacity-30" />
                      <p className="font-mono text-sm">{"// Esperando datos..."}</p>
                      <p className="font-mono text-xs mt-2 text-primary/50">
                        {"root@bitsell:~$ ./crack --generate"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Validador de Licencias */}
          <TabsContent value="validate">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Input */}
              <Card className="hacker-border bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Shield className="h-5 w-5" />
                    <span className="font-mono">VERIFICAR_INTEGRIDAD</span>
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-muted-foreground">
                    {"// Pega la clave de licencia para verificar su estado"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-sm flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      LICENSE_KEY
                    </Label>
                    <Textarea
                      placeholder="Pega aqui la clave de licencia completa..."
                      value={licenseKeyToValidate}
                      onChange={(e) => setLicenseKeyToValidate(e.target.value)}
                      className="font-mono text-xs h-32 bg-background/50 hacker-border resize-none"
                    />
                    <p className="text-xs text-muted-foreground font-mono">
                      {"// Formato: {hash}@{id}@{fecha}@{dias}@{nombre}"}
                    </p>
                  </div>

                  <Button 
                    onClick={handleValidate} 
                    disabled={isValidating || !licenseKeyToValidate.trim()}
                    className="w-full pulse-glow font-mono text-background"
                  >
                    {isValidating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ANALIZANDO...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        VERIFICAR INTEGRIDAD
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="hacker-border bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-mono">RESULTADO_ANALISIS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {validationResult ? (
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex justify-center">
                        <StatusIndicator status={validationResult.status || "invalid"} />
                      </div>

                      {/* Message */}
                      <Alert 
                        variant={validationResult.isValid ? "default" : "destructive"}
                        className="hacker-border"
                      >
                        {validationResult.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertTitle className="font-mono">
                          {validationResult.status?.toUpperCase()}
                        </AlertTitle>
                        <AlertDescription className="font-mono text-sm">
                          {validationResult.message}
                        </AlertDescription>
                      </Alert>

                      {validationResult.parsedData && (
                        <>
                          <Separator className="bg-primary/30" />

                          {/* Progress Bar */}
                          {typeof validationResult.percentUsed !== "undefined" && (
                            <ProgressBar 
                              percent={validationResult.percentUsed} 
                              status={validationResult.status || "invalid"} 
                            />
                          )}

                          {/* Time Stats */}
                          {validationResult.detailedTimeRemaining && (
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-3 bg-background/50 rounded-lg hacker-border">
                                <div className="text-2xl font-bold text-primary font-mono">
                                  {validationResult.detailedTimeRemaining.years}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">AÑOS</div>
                              </div>
                              <div className="p-3 bg-background/50 rounded-lg hacker-border">
                                <div className="text-2xl font-bold text-primary font-mono">
                                  {validationResult.detailedTimeRemaining.months}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">MESES</div>
                              </div>
                              <div className="p-3 bg-background/50 rounded-lg hacker-border">
                                <div className="text-2xl font-bold text-primary font-mono">
                                  {validationResult.detailedTimeRemaining.days}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">DIAS</div>
                              </div>
                            </div>
                          )}

                          <Separator className="bg-primary/30" />

                          {/* Parsed Data */}
                          <div className="space-y-3 text-xs font-mono">
                            <h4 className="text-primary flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              DATOS_EXTRAIDOS
                            </h4>
                            
                            <div className="grid gap-2">
                              <div className="flex justify-between p-2 bg-background/30 rounded">
                                <span className="text-muted-foreground">LICENSE_ID:</span>
                                <span className="text-primary">{validationResult.parsedData.licenseId}</span>
                              </div>
                              <div className="flex justify-between p-2 bg-background/30 rounded">
                                <span className="text-muted-foreground">OWNER:</span>
                                <span className="text-primary">{validationResult.parsedData.ownerName}</span>
                              </div>
                              <div className="flex justify-between p-2 bg-background/30 rounded">
                                <span className="text-muted-foreground">ACTIVATION:</span>
                                <span className="text-primary">{validationResult.parsedData.activationDate}</span>
                              </div>
                              <div className="flex justify-between p-2 bg-background/30 rounded">
                                <span className="text-muted-foreground">VALIDITY:</span>
                                <span className={validationResult.isExpired ? "text-red-400" : "text-yellow-500"}>
                                  {validationResult.parsedData.validityDays} dias
                                </span>
                              </div>
                              <div className="flex justify-between p-2 bg-background/30 rounded">
                                <span className="text-muted-foreground">EXPIRATION:</span>
                                <span className={validationResult.isExpired ? "text-red-400" : "text-primary"}>
                                  {validationResult.expirationDate}
                                </span>
                              </div>
                              <div className="flex justify-between p-2 bg-background/30 rounded">
                                <span className="text-muted-foreground">DIAS_USADOS:</span>
                                <span className="text-yellow-500">{validationResult.daysUsed}</span>
                              </div>
                              <div className="flex justify-between p-2 bg-background/30 rounded">
                                <span className="text-muted-foreground">DIAS_RESTANTES:</span>
                                <span className={validationResult.isExpired ? "text-red-400" : "text-primary"}>
                                  {validationResult.isExpired ? "0 (EXPIRADA)" : validationResult.daysRemaining}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Hash verification */}
                          <div className="mt-4 p-3 bg-background/30 rounded-lg hacker-border">
                            <h4 className="text-primary text-xs font-mono mb-2 flex items-center gap-2">
                              <Hash className="h-3 w-3" />
                              HASH_BCRYPT
                            </h4>
                            <code className="text-xs text-muted-foreground break-all">
                              {validationResult.parsedData.hashString}
                            </code>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <Shield className="h-16 w-16 mb-4 opacity-30" />
                      <p className="font-mono text-sm">{"// Esperando licencia..."}</p>
                      <p className="font-mono text-xs mt-2 text-primary/50">
                        {"root@bitsell:~$ ./verify --check"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-8 text-xs font-mono text-muted-foreground">
          <p>{"// BITSELL POS License Bypass Tool"}</p>
          <p className="text-primary/50 mt-1">{"// Solo para uso educativo y pruebas"}</p>
        </div>
      </div>
    </div>
  )
}
