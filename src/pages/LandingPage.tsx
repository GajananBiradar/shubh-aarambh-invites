import PageWrapper from '@/components/layout/PageWrapper';
import HeroSection from '@/components/landing/HeroSection';
import TemplateShowcase from '@/components/landing/TemplateShowcase';
import CustomTemplateCTA from '@/components/landing/CustomTemplateCTA';
import FeatureSection from '@/components/landing/FeatureSection';
import HowItWorks from '@/components/landing/HowItWorks';
import SocialProofStats from '@/components/landing/SocialProofStats';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialSection from '@/components/landing/TestimonialSection';
import FAQSection from '@/components/landing/FAQSection';
import QuoteForm from '@/components/landing/QuoteForm';

const LandingPage = () => (
  <PageWrapper>
    <HeroSection />
    <TemplateShowcase />
    <CustomTemplateCTA />
    <FeatureSection />
    <HowItWorks />
    <SocialProofStats />
    <TestimonialSection />
    <PricingSection />
    <FAQSection />
    <QuoteForm />
  </PageWrapper>
);

export default LandingPage;
