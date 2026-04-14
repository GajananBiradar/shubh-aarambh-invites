import toast from 'react-hot-toast';
import { initiatePayment, verifyRazorpay, devBypass } from '@/api/payments';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { getPricingContext } from '@/lib/pricing';
import { Template } from '@/types';

export const usePayment = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const triggerPaymentFlow = async (
    templateId: string,
    template?: Pick<Template, 'isFree'>,
    redirectAfterPayment?: string,
  ) => {
    const defaultRedirect = `/create/${templateId}`;

    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: redirectAfterPayment || defaultRedirect } });
      return;
    }

    // Free templates go straight to create
    if (template?.isFree) {
      navigate(redirectAfterPayment || defaultRedirect);
      return;
    }

    // Dev bypass
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      try {
        await devBypass(templateId);
      } catch { /* ignore in dev */ }
      toast.success('Dev mode — payment bypassed! 🛠️');
      navigate(redirectAfterPayment || defaultRedirect);
      return;
    }

    try {
      const { countryCode } = getPricingContext(user);
      const order = await initiatePayment(templateId, countryCode);
      loadRazorpay(order, templateId, redirectAfterPayment || defaultRedirect);
    } catch {
      toast.error('Could not create payment order. Please try again.');
    }
  };

  const loadRazorpay = (order: any, templateId: string, redirectTo: string) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'LuxEnvelope',
        description: 'Wedding Invitation',
        theme: { color: '#B8860B' },
        prefill: { name: user?.name, email: user?.email },
        handler: async (response: any) => {
          try {
            await verifyRazorpay({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              templateId,
            });
            toast.success('Payment successful! 🎉 Let\'s build your invite.');
            navigate(redirectTo);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => toast('Payment cancelled. Try again anytime.'),
        },
      };
      new window.Razorpay(options).open();
    };
    document.body.appendChild(script);
  };

  return { triggerPaymentFlow };
};
