import bcrypt from "bcryptjs"

export interface LicenseData {
  licenseId: string
  ownerName: string
  validityDays: number
  activationDate: string
}

export interface GeneratedLicense {
  // Datos individuales
  licenseId: string
  ownerName: string
  validityDays: number
  activationDate: string
  hashString: string
  
  // Clave completa formateada (lic_info)
  fullLicenseKey: string
  
  // Codigo de actualizacion (lic_code)
  updateCode: string
  updateCodeHash: string
  
  // Datos para la tabla lic_info
  licInfoData: {
    id: number
    init: string
    qty: number
    owner: string
    string: string
    license_id: string
  }
  
  // Datos para la tabla lic_code
  licCodeData: {
    id: number
    code: string
    qty: number
  }
  
  // Informacion de expiracion
  expirationInfo: {
    expirationDate: string
    expirationTimestamp: number
    totalDays: number
    daysFromToday: number
    isActiveFromToday: boolean
    formattedValidity: string
  }
}

export interface ValidationResult {
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
  expirationTimestamp?: number
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

export interface UpdateCodeValidation {
  isValid: boolean
  message: string
  parsedData?: {
    hash: string
    days: number
  }
}

// Presets de validez comunes
export const VALIDITY_PRESETS = [
  { label: "7 dias (Prueba)", days: 7, type: "trial" },
  { label: "30 dias (1 mes)", days: 30, type: "monthly" },
  { label: "90 dias (3 meses)", days: 90, type: "quarterly" },
  { label: "180 dias (6 meses)", days: 180, type: "semiannual" },
  { label: "365 dias (1 año)", days: 365, type: "annual" },
  { label: "730 dias (2 años)", days: 730, type: "biennial" },
  { label: "1825 dias (5 años)", days: 1825, type: "extended" },
  { label: "3650 dias (10 años)", days: 3650, type: "decade" },
  { label: "36500 dias (100 años)", days: 36500, type: "century" },
  { label: "360000 dias (Perpetua)", days: 360000, type: "perpetual" },
] as const

/**
 * Genera el string de validación para el hash bcrypt de lic_info
 * Formato EXACTO compatible con PHP: {fecha}-{dias}-{nombre}
 * Este es el formato que usa password_verify() en PHP
 */
export function generateValidationString(
  activationDate: string,
  validityDays: number,
  ownerName: string
): string {
  return `${activationDate}-${validityDays}-${ownerName}`
}

/**
 * Genera el string de validación para el hash bcrypt de lic_code
 * Formato: solo los dias (se hashea el numero de dias)
 */
export function generateUpdateCodeValidationString(validityDays: number): string {
  return `${validityDays}`
}

/**
 * Calcula la fecha de expiración de forma precisa
 */
export function calculateExpirationDate(activationDate: string, validityDays: number): Date {
  const date = new Date(activationDate + "T00:00:00Z")
  date.setUTCDate(date.getUTCDate() + validityDays)
  return date
}

/**
 * Formatea una fecha como YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export function getTodayDate(): string {
  return formatDate(new Date())
}

/**
 * Calcula la diferencia en dias entre dos fechas
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round((date2.getTime() - date1.getTime()) / oneDay)
}

/**
 * Convierte dias a años, meses y dias
 */
export function daysToYearsMonthsDays(days: number): { 
  years: number
  months: number
  days: number
  formatted: string 
} {
  const years = Math.floor(days / 365)
  const remainingAfterYears = days % 365
  const months = Math.floor(remainingAfterYears / 30)
  const remainingDays = remainingAfterYears % 30
  
  const parts: string[] = []
  if (years > 0) parts.push(`${years} año${years > 1 ? "s" : ""}`)
  if (months > 0) parts.push(`${months} mes${months > 1 ? "es" : ""}`)
  if (remainingDays > 0 || parts.length === 0) parts.push(`${remainingDays} dia${remainingDays !== 1 ? "s" : ""}`)
  
  return { 
    years, 
    months, 
    days: remainingDays, 
    formatted: parts.join(", ")
  }
}

/**
 * Genera una licencia completa compatible con el sistema BITSELL
 * 
 * FORMATO lic_info: {hash_bcrypt}@{license_id}@{fecha_activacion}@{dias_validez}@{nombre}
 * FORMATO lic_code: {hash_bcrypt}@{dias_validez}
 */
export async function generateLicense(data: LicenseData): Promise<GeneratedLicense> {
  const { licenseId, ownerName, validityDays, activationDate } = data
  
  // Validaciones
  if (!Number.isInteger(validityDays) || validityDays <= 0) {
    throw new Error("Los dias de validez deben ser un numero entero positivo")
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(activationDate)) {
    throw new Error("El formato de fecha debe ser YYYY-MM-DD")
  }
  
  // === GENERAR HASH PARA lic_info ===
  // Formato: {fecha}-{dias}-{nombre}
  const licInfoValidationString = generateValidationString(activationDate, validityDays, ownerName)
  const hashString = await bcrypt.hash(licInfoValidationString, 10)
  
  // === GENERAR HASH PARA lic_code ===
  // Este hash se usa para actualizar la licencia (renovacion)
  // El hash se genera sobre el string de validacion completo para que sea verificable
  const licCodeValidationString = generateUpdateCodeValidationString(validityDays)
  const updateCodeHash = await bcrypt.hash(licCodeValidationString, 10)
  
  // Formatear las claves
  const fullLicenseKey = `${hashString}@${licenseId}@${activationDate}@${validityDays}@${ownerName}`
  const updateCode = `${updateCodeHash}@${validityDays}`
  
  // Calcular fechas de expiracion
  const expirationDateObj = calculateExpirationDate(activationDate, validityDays)
  const expirationDate = formatDate(expirationDateObj)
  
  // Calcular dias desde hoy
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const activationDateObj = new Date(activationDate + "T00:00:00Z")
  const daysFromToday = daysBetween(today, expirationDateObj)
  const isActiveFromToday = daysFromToday > 0
  
  // Formatear validez
  const { formatted: formattedValidity } = daysToYearsMonthsDays(validityDays)
  
  return {
    licenseId,
    ownerName,
    validityDays,
    activationDate,
    hashString,
    fullLicenseKey,
    updateCode,
    updateCodeHash,
    licInfoData: {
      id: 1,
      init: activationDate,
      qty: validityDays,
      owner: ownerName,
      string: hashString,
      license_id: licenseId
    },
    licCodeData: {
      id: 1,
      code: updateCodeHash,
      qty: validityDays
    },
    expirationInfo: {
      expirationDate,
      expirationTimestamp: expirationDateObj.getTime(),
      totalDays: validityDays,
      daysFromToday,
      isActiveFromToday,
      formattedValidity
    }
  }
}

/**
 * Parsea una clave de licencia completa (lic_info)
 * FORMATO: {hash}@{license_id}@{fecha}@{dias}@{nombre}
 */
export function parseLicenseKey(licenseKey: string): ValidationResult["parsedData"] | null {
  const trimmedKey = licenseKey.trim()
  const parts = trimmedKey.split("@")
  
  if (parts.length !== 5) {
    return null
  }
  
  const [hashString, licenseId, activationDate, daysStr, ownerName] = parts
  const validityDays = parseInt(daysStr, 10)
  
  if (!hashString || !licenseId || !activationDate || isNaN(validityDays) || !ownerName) {
    return null
  }
  
  return {
    hashString,
    licenseId,
    activationDate,
    validityDays,
    ownerName
  }
}

/**
 * Parsea un codigo de actualizacion (lic_code)
 * FORMATO: {hash}@{dias}
 */
export function parseUpdateCode(code: string): UpdateCodeValidation["parsedData"] | null {
  const trimmedCode = code.trim()
  const parts = trimmedCode.split("@")
  
  if (parts.length !== 2) {
    return null
  }
  
  const [hash, daysStr] = parts
  const days = parseInt(daysStr, 10)
  
  if (!hash || isNaN(days) || days <= 0) {
    return null
  }
  
  return { hash, days }
}

/**
 * Valida un codigo de actualizacion (lic_code)
 */
export async function validateUpdateCode(code: string): Promise<UpdateCodeValidation> {
  const parsedData = parseUpdateCode(code)
  
  if (!parsedData) {
    return {
      isValid: false,
      message: "Formato de codigo invalido. Debe ser: {hash}@{dias}"
    }
  }
  
  const { hash, days } = parsedData
  
  // Verificar hash
  const validationString = generateUpdateCodeValidationString(days)
  
  try {
    const isHashValid = await bcrypt.compare(validationString, hash)
    
    if (!isHashValid) {
      return {
        isValid: false,
        message: "Codigo de actualizacion invalido o manipulado",
        parsedData
      }
    }
    
    return {
      isValid: true,
      message: `Codigo valido para ${days} dias de extension`,
      parsedData
    }
  } catch {
    return {
      isValid: false,
      message: "Error al verificar el codigo"
    }
  }
}

/**
 * Valida una clave de licencia completa
 * Verifica formato, hash y estado de expiracion
 */
export async function validateLicense(licenseKey: string): Promise<ValidationResult> {
  const parsedData = parseLicenseKey(licenseKey)
  
  if (!parsedData) {
    return {
      isValid: false,
      message: "Formato de licencia invalido. La clave debe tener 5 partes separadas por @",
      status: "invalid",
      statusMessage: "FORMATO_INVALIDO"
    }
  }
  
  const { hashString, activationDate, validityDays, ownerName } = parsedData
  
  // Validar formato de fecha
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(activationDate)) {
    return {
      isValid: false,
      message: "Formato de fecha invalido. Debe ser YYYY-MM-DD",
      parsedData,
      status: "invalid",
      statusMessage: "FECHA_INVALIDA"
    }
  }
  
  // Validar dias
  if (isNaN(validityDays) || validityDays <= 0) {
    return {
      isValid: false,
      message: "Dias de validez invalidos",
      parsedData,
      status: "invalid",
      statusMessage: "DIAS_INVALIDOS"
    }
  }
  
  // Verificar hash
  const validationString = generateValidationString(activationDate, validityDays, ownerName)
  
  let isHashValid = false
  try {
    isHashValid = await bcrypt.compare(validationString, hashString)
  } catch {
    return {
      isValid: false,
      message: "Error al verificar el hash",
      parsedData,
      status: "invalid",
      statusMessage: "HASH_ERROR"
    }
  }
  
  if (!isHashValid) {
    return {
      isValid: false,
      message: "LICENCIA MANIPULADA O INVALIDA. El hash no coincide con los datos.",
      parsedData,
      status: "invalid",
      statusMessage: "HASH_MISMATCH"
    }
  }
  
  // Calcular estado de expiracion
  const activationDateObj = new Date(activationDate + "T00:00:00Z")
  const expirationDateObj = calculateExpirationDate(activationDate, validityDays)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  
  // Dias usados desde la activacion
  const daysUsed = Math.max(0, daysBetween(activationDateObj, today))
  
  // Dias restantes (puede ser negativo si expiró)
  const daysRemaining = daysBetween(today, expirationDateObj)
  
  // Porcentaje usado
  const percentUsed = Math.min(100, Math.max(0, (daysUsed / validityDays) * 100))
  
  // Estado de expiracion
  const isExpired = daysRemaining < 0
  
  // Determinar estado y mensaje
  let status: ValidationResult["status"]
  let statusMessage: string
  let message: string
  
  if (isExpired) {
    status = "expired"
    statusMessage = "LICENCIA_EXPIRADA"
    const daysExpired = Math.abs(daysRemaining)
    message = `LICENCIA EXPIRADA hace ${daysExpired} dia${daysExpired !== 1 ? "s" : ""} (${formatDate(expirationDateObj)}). El programa no puede usarse hasta renovar.`
  } else if (daysRemaining <= 7) {
    status = "critical"
    statusMessage = "EXPIRACION_CRITICA"
    message = `ATENCION CRITICA: Solo quedan ${daysRemaining} dia${daysRemaining !== 1 ? "s" : ""}. Renueve inmediatamente.`
  } else if (daysRemaining <= 30) {
    status = "warning"
    statusMessage = "PROXIMA_EXPIRACION"
    message = `ADVERTENCIA: Quedan ${daysRemaining} dias. Se recomienda renovar pronto.`
  } else {
    status = "active"
    statusMessage = "LICENCIA_ACTIVA"
    const timeRemaining = daysToYearsMonthsDays(daysRemaining)
    message = `LICENCIA VALIDA. Tiempo restante: ${timeRemaining.formatted} (${daysRemaining} dias)`
  }
  
  const detailedTimeRemaining = daysRemaining > 0 ? daysToYearsMonthsDays(daysRemaining) : {
    years: 0,
    months: 0,
    days: 0,
    formatted: "Expirada"
  }
  
  return {
    isValid: !isExpired,
    message,
    parsedData,
    expirationDate: formatDate(expirationDateObj),
    expirationTimestamp: expirationDateObj.getTime(),
    daysRemaining: Math.max(0, daysRemaining),
    daysUsed,
    percentUsed,
    isExpired,
    status,
    statusMessage,
    detailedTimeRemaining
  }
}

/**
 * Genera SQL para las tablas lic_info y lic_code
 */
export function generateSQL(license: GeneratedLicense): {
  licInfo: string
  licCode: string
  combined: string
} {
  const { licInfoData, licCodeData, expirationInfo } = license
  const escapedOwner = licInfoData.owner.replace(/'/g, "''")
  const timestamp = new Date().toISOString()
  
  const licInfoSQL = `-- ============================================
-- SQL para tabla lic_info (Licencia Principal)
-- Generado: ${timestamp}
-- Expira: ${expirationInfo.expirationDate}
-- Validez: ${expirationInfo.formattedValidity}
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

-- ACTUALIZAR licencia existente
UPDATE lic_info SET
  init = '${licInfoData.init}',
  qty = ${licInfoData.qty},
  owner = '${escapedOwner}',
  string = '${licInfoData.string}',
  license_id = '${licInfoData.license_id}',
  updated_at = CURRENT_TIMESTAMP
WHERE id = ${licInfoData.id};`

  const licCodeSQL = `-- ============================================
-- SQL para tabla lic_code (Codigo de Actualizacion)
-- Generado: ${timestamp}
-- Dias: ${licCodeData.qty}
-- ============================================

-- INSERTAR nuevo codigo
INSERT INTO lic_code (id, code, qty)
VALUES (${licCodeData.id}, '${licCodeData.code}', ${licCodeData.qty});

-- ACTUALIZAR codigo existente
UPDATE lic_code SET
  code = '${licCodeData.code}',
  qty = ${licCodeData.qty},
  updated_at = CURRENT_TIMESTAMP
WHERE id = ${licCodeData.id};`

  const combinedSQL = `-- ============================================
-- SQL COMPLETO - BITSELL POS License System
-- Generado: ${timestamp}
-- License ID: ${licInfoData.license_id}
-- Owner: ${escapedOwner}
-- Activacion: ${licInfoData.init}
-- Validez: ${licInfoData.qty} dias (${expirationInfo.formattedValidity})
-- Expira: ${expirationInfo.expirationDate}
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
INSERT INTO lic_code (id, code, qty)
VALUES (${licCodeData.id}, '${licCodeData.code}', ${licCodeData.qty})
ON DUPLICATE KEY UPDATE
  code = VALUES(code),
  qty = VALUES(qty);`

  return {
    licInfo: licInfoSQL,
    licCode: licCodeSQL,
    combined: combinedSQL
  }
}
