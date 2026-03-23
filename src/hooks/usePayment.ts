import toast from 'react-hot-toast';
import { initiatePayment, verifyRazorpay, devBypass } from '@/api/payments';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_TEMPLATES } from '@/mock/sampleInvitation';

export const usePayment = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const getTemplate = (templateId: string) => {
    return SAMPLE_TEMPLATES.find(t => t.id === templateId) || SAMPLE_TEMPLATES[0];
  };

  const triggerPaymentFlow = async (templateId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/create/${templateId}` } });
      return;
    }

    // Free templates go straight to create
    const template = getTemplate(templateId);
    if (template.isFree) {
      navigate(`/create/${templateId}`);
      return;
    }

    // Dev bypass
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      try {
        await devBypass(templateId);
      } catch { /* ignore in dev */ }
      toast.success('Dev mode — payment bypassed! 🛠️');
      navigate(`/create/${templateId}`);
      return;
    }

    try {
      const order = await initiatePayment(templateId);
      loadRazorpay(order, templateId);
    } catch {
      toast.error('Could not create payment order. Please try again.');
    }
  };

  const loadRazorpay = (order: any, templateId: string) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'WeddingInvites.in',
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
            navigate(`/create/${templateId}`);
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

  return { triggerPaymentFlow, getTemplate };
};
