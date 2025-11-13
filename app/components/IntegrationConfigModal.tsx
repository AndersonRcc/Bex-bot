'use client'
import { useState, useEffect } from 'react'
import { X, Save, Key, Globe, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { configurarIntegracion } from '@/lib/integrationsService'

interface IntegrationConfigModalProps {
  isOpen: boolean
  onClose: () => void
  integration: {
    id: string
    name: string
    category: string
    icon: string
    config?: Record<string, any>
  }
  empresaId: string
  onSuccess: (message: string) => void
  onError: (message: string) => void
}
export default function IntegrationConfigModal({
  isOpen,
  onClose,
  integration,
  empresaId,
  onSuccess,
  onError
}: IntegrationConfigModalProps) {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  useEffect(() => {
    if (isOpen && integration.config) {
      setConfig(integration.config)
    } else {
      setConfig(getDefaultConfig(integration.id))
    }
    setErrors({})
  }, [isOpen, integration])
  const getDefaultConfig = (integrationId: string): Record<string, any> => {
    const defaults: Record<string, Record<string, any>> = {
      'hubspot': {
        apiKey: '',
        portalId: '',
        enableAutoSync: true,
        syncInterval: '1h'
      },
      'salesforce': {
        instanceUrl: '',
        clientId: '',
        clientSecret: '',
        refreshToken: '',
        sandbox: false
      },
      'google-analytics': {
        measurementId: '',
        trackingId: '',
        enableEventTracking: true
      },
      'zapier': {
        webhookUrl: '',
        apiKey: ''
      },
      'stripe': {
        publishableKey: '',
        secretKey: '',
        webhookSecret: '',
        testMode: false
      },
      'slack': {
        webhookUrl: '',
        botToken: '',
        channelId: '',
        enableAlerts: true
      },
      'mailchimp': {
        apiKey: '',
        serverPrefix: '',
        audienceId: '',
        enableDoubleOptIn: true
      },
      'shopify': {
        shopDomain: '',
        apiKey: '',
        apiSecret: '',
        accessToken: ''
      },
      'twilio': {
        accountSid: '',
        authToken: '',
        phoneNumber: '',
        enableSMS: true
      },
      'google-sheets': {
        spreadsheetId: '',
        sheetName: '',
        serviceAccountEmail: '',
        enableAutoExport: true
      },
      'zendesk': {
        subdomain: '',
        email: '',
        apiToken: '',
        enableAutoTickets: true
      },
      'openai': {
        apiKey: '',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      }
    }

    return defaults[integrationId] || {}
  }
  const getConfigFields = (integrationId: string) => {
    const fields: Record<string, any[]> = {
      'hubspot': [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true, icon: Key },
        { name: 'portalId', label: 'Portal ID', type: 'text', required: true, icon: Globe },
        { name: 'enableAutoSync', label: 'Sincronización Automática', type: 'checkbox', icon: CheckCircle },
        { name: 'syncInterval', label: 'Intervalo de Sincronización', type: 'select', options: ['15m', '30m', '1h', '6h', '24h'] }
      ],
      'salesforce': [
        { name: 'instanceUrl', label: 'Instance URL', type: 'text', required: true, placeholder: 'https://yourinstance.salesforce.com' },
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
        { name: 'sandbox', label: 'Sandbox Environment', type: 'checkbox' }
      ],
      'google-analytics': [
        { name: 'measurementId', label: 'Measurement ID', type: 'text', required: true, placeholder: 'G-XXXXXXXXXX' },
        { name: 'trackingId', label: 'Tracking ID', type: 'text', placeholder: 'UA-XXXXXXXXX-X' },
        { name: 'enableEventTracking', label: 'Rastreo de Eventos', type: 'checkbox' }
      ],
      'zapier': [
        { name: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://hooks.zapier.com/...' },
        { name: 'apiKey', label: 'API Key', type: 'password' }
      ],
      'stripe': [
        { name: 'publishableKey', label: 'Publishable Key', type: 'text', required: true, placeholder: 'pk_test_...' },
        { name: 'secretKey', label: 'Secret Key', type: 'password', required: true, placeholder: 'sk_test_...' },
        { name: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...' },
        { name: 'testMode', label: 'Modo de Prueba', type: 'checkbox' }
      ],
      'slack': [
        { name: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://hooks.slack.com/...' },
        { name: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'xoxb-...' },
        { name: 'channelId', label: 'Channel ID', type: 'text', placeholder: 'C0123456789' },
        { name: 'enableAlerts', label: 'Alertas Habilitadas', type: 'checkbox' }
      ],
      'openai': [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
        { name: 'model', label: 'Modelo', type: 'select', options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
        { name: 'temperature', label: 'Temperature', type: 'number', min: 0, max: 2, step: 0.1 },
        { name: 'maxTokens', label: 'Max Tokens', type: 'number', min: 1, max: 4000 }
      ]
    }
    return fields[integrationId] || [
      { name: 'apiKey', label: 'API Key', type: 'password', required: true },
      { name: 'apiSecret', label: 'API Secret', type: 'password' },
      { name: 'webhookUrl', label: 'Webhook URL', type: 'text' }
    ]
  }
  const handleInputChange = (name: string, value: any) => {
    setConfig(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  const validateForm = (): boolean => {
    const fields = getConfigFields(integration.id)
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      if (field.required && !config[field.name]) {
        newErrors[field.name] = `${field.label} es requerido`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSave = async () => {
    if (!validateForm()) {
      onError('Por favor completa todos los campos requeridos')
      return
    }
    setIsSaving(true)
    try {
      await configurarIntegracion(empresaId, integration.id, config)
      onSuccess(`Configuración de ${integration.name} guardada exitosamente`)
      onClose()
    } catch (error: any) {
      onError(error.message || 'Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }
  if (!isOpen) return null
  const fields = getConfigFields(integration.id)
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-borders-default flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{integration.icon}</div>
            <div>
              <h2 className="text-xl font-bold">Configurar {integration.name}</h2>
              <p className="text-sm text-text-muted">{integration.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-semibold">
                  {field.label}
                  {field.required && <span className="text-accent-error ml-1">*</span>}
                </label>
                {field.type === 'checkbox' ? (
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config[field.name] || false}
                      onChange={(e) => handleInputChange(field.name, e.target.checked)}
                      className="w-5 h-5 rounded border-borders-default bg-background-primary text-accent-primary focus:ring-2 focus:ring-accent-primary"
                    />
                    <span className="text-text-secondary text-sm">Habilitar esta opción</span>
                  </label>
                ) : field.type === 'select' ? (
                  <select
                    value={config[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Seleccionar...</option>
                    {field.options?.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={config[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    placeholder={field.placeholder}
                    className="input-field w-full"
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={config[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="input-field w-full"
                  />
                )}

                {errors[field.name] && (
                  <p className="text-accent-error text-sm flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors[field.name]}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          {/* Security Notice */}
          <div className="mt-6 p-4 bg-accent-warning/10 border border-accent-warning/30 rounded-lg flex items-start space-x-3">
            <Shield className="w-5 h-5 text-accent-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm text-text-secondary">
              <p className="font-semibold text-accent-warning mb-1">Información Segura</p>
              <p>Tus credenciales se almacenan de forma segura y encriptada. Nunca las compartimos con terceros.</p>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-borders-default flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}