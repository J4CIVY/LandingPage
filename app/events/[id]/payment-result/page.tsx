'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFileInvoice,
  FaCalendarCheck
} from 'react-icons/fa';
import Link from 'next/link';

interface TransactionResult {
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod?: string;
  transactionDate?: string;
}

export default function PaymentResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const eventId = params.id as string;
  const orderId = searchParams.get('orderId') || searchParams.get('bold-order-id');
  
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Esperar a que la autenticación se verifique
  useEffect(() => {
    // Dar tiempo para que useAuth verifique la sesión
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // No hacer nada mientras se verifica la autenticación
    if (checkingAuth) return;

    if (!isAuthenticated) {
      // Solo redirigir si definitivamente no hay sesión después de verificar
      router.push(`/login?returnUrl=/events/${eventId}/payment-result?orderId=${orderId}`);
      return;
    }

    if (!orderId) {
      setError('No se proporcionó un ID de orden');
      setLoading(false);
      return;
    }

    void fetchTransactionStatus();
  }, [orderId, isAuthenticated, checkingAuth]);

  const fetchTransactionStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bold/transactions/${orderId}/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setError('No se pudo obtener el estado de la transacción');
        return;
      }

      const data = await response.json();
      
      if (data.success && data.data?.transaction) {
        setTransaction(data.data.transaction);
      } else {
        setError('Respuesta inválida del servidor');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error fetching transaction:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!transaction) return null;

    switch (transaction.status) {
      case 'APPROVED':
        return <FaCheckCircle className="text-6xl text-green-500" />;
      case 'REJECTED':
      case 'FAILED':
        return <FaTimesCircle className="text-6xl text-red-500" />;
      case 'PENDING':
      case 'PROCESSING':
        return <FaSpinner className="text-6xl text-yellow-500 animate-spin" />;
      default:
        return <FaExclamationTriangle className="text-6xl text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    if (!transaction) return '';

    switch (transaction.status) {
      case 'APPROVED':
        return '¡Pago aprobado exitosamente!';
      case 'REJECTED':
        return 'Pago rechazado';
      case 'FAILED':
        return 'Pago fallido';
      case 'PENDING':
        return 'Pago pendiente';
      case 'PROCESSING':
        return 'Pago en proceso';
      default:
        return 'Estado desconocido';
    }
  };

  const getStatusDescription = () => {
    if (!transaction) return '';

    switch (transaction.status) {
      case 'APPROVED':
        return 'Tu inscripción al evento ha sido confirmada. Recibirás un correo con los detalles.';
      case 'REJECTED':
        return 'El pago fue rechazado por tu entidad financiera. Por favor intenta nuevamente con otro método de pago.';
      case 'FAILED':
        return 'Ocurrió un error durante el procesamiento del pago. Por favor intenta nuevamente.';
      case 'PENDING':
        return 'Tu pago está pendiente de confirmación. Te notificaremos cuando se complete.';
      case 'PROCESSING':
        return 'Estamos procesando tu pago. Esto puede tomar unos minutos.';
      default:
        return '';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 dark:text-blue-400 mx-auto mb-6" />
          <p className="text-lg text-gray-600 dark:text-slate-400">
            {checkingAuth ? 'Verificando sesión...' : 'Consultando el estado de tu pago...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              {error || 'No se pudo obtener la información de la transacción'}
            </p>
          </div>
          
          <Link
            href={`/events/${eventId}`}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft />
            Volver al evento
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Card principal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header con estado */}
          <div className={`p-8 text-center ${
            transaction.status === 'APPROVED' ? 'bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' :
            transaction.status === 'REJECTED' || transaction.status === 'FAILED' ? 'bg-linear-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20' :
            'bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20'
          }`}>
            <div className="mb-4">
              {getStatusIcon()}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {getStatusMessage()}
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              {getStatusDescription()}
            </p>
          </div>

          {/* Detalles de la transacción */}
          <div className="p-8 space-y-6">
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaFileInvoice />
                Detalles de la transacción
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Orden:</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {transaction.orderId}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Descripción:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">
                    {transaction.description}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-slate-400">Monto:</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </span>
                </div>
                
                {transaction.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Método de pago:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {transaction.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                )}
                
                {transaction.transactionDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Fecha:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(transaction.transactionDate).toLocaleString('es-CO')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-3">
              {transaction.status === 'APPROVED' && (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <FaCalendarCheck />
                    Ver mis eventos
                  </Link>
                  
                  <Link
                    href={`/events/${eventId}`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FaArrowLeft />
                    Volver al evento
                  </Link>
                </>
              )}
              
              {(transaction.status === 'REJECTED' || transaction.status === 'FAILED') && (
                <>
                  <Link
                    href={`/events/${eventId}`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Intentar nuevamente
                  </Link>
                  
                  <Link
                    href="/events"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Ver otros eventos
                  </Link>
                </>
              )}
              
              {(transaction.status === 'PENDING' || transaction.status === 'PROCESSING') && (
                <>
                  <button
                    onClick={fetchTransactionStatus}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <FaSpinner className="animate-spin" />
                    Actualizar estado
                  </button>
                  
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Ir al dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
          <p>
            ¿Necesitas ayuda? {' '}
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
