import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageWrapperProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

const PageWrapper = ({ children, showNavbar = true, showFooter = true }: PageWrapperProps) => (
  <div className="min-h-screen flex flex-col">
    {showNavbar && <Navbar />}
    <main className={`flex-1 ${showNavbar ? 'pt-16' : ''}`}>{children}</main>
    {showFooter && <Footer />}
  </div>
);

export default PageWrapper;
