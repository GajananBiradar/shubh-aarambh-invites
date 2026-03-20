import PageWrapper from '@/components/layout/PageWrapper';
import HeroSection from '@/components/landing/HeroSection';
import TemplateShowcase from '@/components/landing/TemplateShowcase';
import FeatureSection from '@/components/landing/FeatureSection';
import HowItWorks from '@/components/landing/HowItWorks';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialSection from '@/components/landing/TestimonialSection';
import FAQSection from '@/components/landing/FAQSection';

const LandingPage = () => (
  <PageWrapper>
    <HeroSection />
    <TemplateShowcase />
    <FeatureSection />
    <HowItWorks />
    <PricingSection />
    <TestimonialSection />
    <FAQSection />
  </PageWrapper>
);

export default LandingPage;
