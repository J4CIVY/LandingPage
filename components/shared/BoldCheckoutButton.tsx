'use client';

import { useEffect, useRef, useState } from 'react';
import { FaSpinner, FaLock, FaCreditCard } from 'react-icons/fa';
import { BOLD_CLIENT_CONFIG, validateBoldClientConfig } from '@/lib/bold-client-config';
import { type BoldPaymentConfig } from '@/lib/bold-utils';

interface BoldCheckoutButtonProps {
  config: BoldPaymentConfig;
  integritySignature: string;
  onPaymentStart?: () => void;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: any) => void;
  buttonText?: string;
  buttonClassName?: string;
  disabled?: boolean;
  renderMode?: 'redirect' | 'embedded';
}

/**
 * Componente de botón de pago Bold personalizado
 * 
 * Este componente maneja la integración con Bold de manera segura,
 * cargando el script necesario e inicializando el checkout cuando sea necesario.
 */
export default function BoldCheckoutButton({
  config,
  integritySignature,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
  buttonText = 'Pagar con Bold',
  buttonClassName,
  disabled = false,
  renderMode = 'embedded'
}: BoldCheckoutButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const checkoutInstanceRef = useRef<any>(null);

  // Log de configuración al montar
  useEffect(() => {
      hasConfig: !!config,
      orderId: config?.orderId,
      amount: config?.amount,
      hasIntegritySignature: !!integritySignature,
      disabled,
      renderMode
    });
  }, []);

  /**
   * Carga el script de Bold
   */
  const loadBoldScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar si ya existe
      const existingScript = document.querySelector(
        `script[src="${BOLD_CLIENT_CONFIG.CHECKOUT_SCRIPT_URL}"]`
      );

      if (existingScript) {
        setIsScriptLoaded(true);
        resolve();
        return;
      }

      setIsScriptLoading(true);

      const script = document.createElement('script');
      script.src = BOLD_CLIENT_CONFIG.CHECKOUT_SCRIPT_URL;
      script.async = true;

      script.onload = () => {
        setIsScriptLoaded(true);
        setIsScriptLoading(false);
        setScriptError(null);
        
        // Disparar evento personalizado
        window.dispatchEvent(new Event('boldCheckoutLoaded'));
        resolve();
      };

      script.onerror = () => {
        const error = 'Failed to load Bold checkout script';
        console.error(error);
        setScriptError(error);
        setIsScriptLoading(false);
        
        // Disparar evento de error
        window.dispatchEvent(new Event('boldCheckoutLoadFailed'));
        reject(new Error(error));
      };

      document.head.appendChild(script);
    });
  };

  /**
   * Inicializa la instancia de Bold Checkout
   */
  const initializeBoldCheckout = () => {
    if (typeof window === 'undefined' || !(window as any).BoldCheckout) {
      console.error('BoldCheckout is not available on window');
      return null;
    }


    try {
      // Preparar la configuración para Bold Checkout
      const boldConfig: any = {
        orderId: config.orderId,
        currency: config.currency || BOLD_CLIENT_CONFIG.DEFAULT_CURRENCY,
        amount: config.amount.toString(),
        apiKey: BOLD_CLIENT_CONFIG.PUBLIC_API_KEY,
        integritySignature: integritySignature,
        description: config.description,
        redirectionUrl: config.redirectionUrl,
        renderMode: renderMode,
      };

      // Agregar campos opcionales si existen
      if (config.tax) {
        boldConfig.tax = typeof config.tax === 'string' ? config.tax : config.tax.toString();
      }
      
      if (config.originUrl) {
        boldConfig.originUrl = config.originUrl;
      }
      
      if (config.expirationDate) {
        boldConfig.expirationDate = config.expirationDate.toString();
      }
      
      if (config.customerData) {
        // Bold espera customerData como string JSON
        boldConfig.customerData = JSON.stringify(config.customerData);
      }
      
      if (config.billingAddress) {
        // Bold espera billingAddress como string JSON
        boldConfig.billingAddress = JSON.stringify(config.billingAddress);
      }
      
      if (config.extraData1) {
        boldConfig.extraData1 = config.extraData1;
      }
      
      if (config.extraData2) {
        boldConfig.extraData2 = config.extraData2;
      }

        ...boldConfig,
        apiKey: boldConfig.apiKey ? '***HIDDEN***' : 'MISSING',
        integritySignature: '***HIDDEN***',
        amount: boldConfig.amount,
        orderId: boldConfig.orderId
      });

      const checkout = new (window as any).BoldCheckout(boldConfig);
      return checkout;
    } catch (error) {
      console.error('Error initializing Bold Checkout:', error);
      return null;
    }
  };

  /**
   * Maneja el clic en el botón de pago
   */
  const handlePaymentClick = async () => {
    if (disabled || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Notificar inicio de pago
      onPaymentStart?.();

      // Asegurar que el script esté cargado
      if (!isScriptLoaded) {
        await loadBoldScript();
      }

      // Crear o reutilizar instancia de checkout
      if (!checkoutInstanceRef.current) {
        checkoutInstanceRef.current = initializeBoldCheckout();
      }

      if (!checkoutInstanceRef.current) {
        const errorMsg = 'Failed to initialize Bold Checkout. Check console for details.';
        console.error(errorMsg, {
          scriptLoaded: isScriptLoaded,
          hasBoldCheckout: !!(window as any).BoldCheckout,
          hasConfig: !!config,
          hasIntegritySignature: !!integritySignature
        });
        throw new Error(errorMsg);
      }

      // Abrir el checkout
      checkoutInstanceRef.current.open();
      
      // El pago continúa en la pasarela de Bold
      // El resultado se manejará mediante el webhook o redirección
      
    } catch (error: any) {
      console.error('Error opening Bold Checkout:', error);
      const errorMessage = error.message || 'Error desconocido al abrir el checkout';
      setScriptError(errorMessage);
      
      // Mostrar alerta al usuario con más contexto
      alert(`Error al procesar el pago: ${errorMessage}\n\nPor favor, verifica la consola para más detalles o contacta al soporte.`);
      
      onPaymentError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Cargar script al montar el componente
   */
  useEffect(() => {
    // Validar configuración
    if (!validateBoldClientConfig()) {
      setScriptError('Configuración de Bold incompleta. Contacta al administrador.');
      return;
    }
    
    loadBoldScript().catch(console.error);
  }, []);

  /**
   * Limpiar al desmontar
   */
  useEffect(() => {
    return () => {
      checkoutInstanceRef.current = null;
    };
  }, []);

  // Botón por defecto si no se proporciona clase personalizada
  const defaultButtonClass = `
    w-full flex items-center justify-center gap-3 
    px-6 py-4 
    bg-gradient-to-r from-blue-600 to-blue-700 
    hover:from-blue-700 hover:to-blue-800 
    text-white font-semibold text-lg 
    rounded-xl shadow-lg 
    hover:shadow-xl 
    transform hover:scale-[1.02] 
    transition-all duration-200 
    disabled:opacity-50 disabled:cursor-not-allowed 
    disabled:hover:scale-100
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  const buttonClass = buttonClassName || defaultButtonClass;

  return (
    <div className="w-full">
      <button
        onClick={handlePaymentClick}
        disabled={disabled || isProcessing || isScriptLoading || !isScriptLoaded}
        className={buttonClass}
        type="button"
      >
        {isProcessing ? (
          <>
            <FaSpinner className="animate-spin text-xl" />
            <span>Procesando...</span>
          </>
        ) : isScriptLoading ? (
          <>
            <FaSpinner className="animate-spin text-xl" />
            <span>Cargando pasarela...</span>
          </>
        ) : (
          <>
            <FaCreditCard className="text-xl" />
            <span>{buttonText}</span>
            <FaLock className="text-sm opacity-75" />
          </>
        )}
      </button>

      {scriptError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 text-center font-semibold mb-1">
            Error al cargar el sistema de pagos
          </p>
          <p className="text-xs text-red-500 dark:text-red-400 text-center">
            {scriptError}
          </p>
        </div>
      )}

      {/* Debug info (remover en producción) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-slate-800 rounded text-xs">
          <div className="text-gray-600 dark:text-slate-400">
            Debug: Script {isScriptLoaded ? '✓' : '✗'} | 
            Config {config?.orderId ? '✓' : '✗'} | 
            API Key {BOLD_CLIENT_CONFIG.PUBLIC_API_KEY ? '✓' : '✗'}
          </div>
        </div>
      )}

      {/* Indicador de seguridad */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-slate-400">
        <FaLock />
        <span>Pago seguro procesado por Bold</span>
      </div>
    </div>
  );
}
