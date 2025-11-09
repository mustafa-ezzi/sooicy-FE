import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Clock } from 'lucide-react';
import logo from "../logo/sooicy-logo.png";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)' }}>
      {/* Decorative Wave Top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-12 sm:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 L0,40 Q300,80 600,40 T1200,40 L1200,0 Z" fill="white" opacity="0.3" />
          <path d="M0,0 L0,60 Q300,100 600,60 T1200,60 L1200,0 Z" fill="white" opacity="0.2" />
          <path d="M0,0 L0,80 Q300,120 600,80 T1200,80 L1200,0 Z" fill="white" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 shadow-xl bg-white p-4">
              <img
                src={logo}
                alt="SooIcy Logo"
                className="object-contain w-30 h-30"
              />
            </div>

            <p className="text-white text-center md:text-left text-sm opacity-90">
              Your favorite ice cream & desserts, delivered fresh!
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#F279AB' }}>
              Contact Us
            </h3>
            <div className="space-y-3">
              <a href="tel:+923111794175" className="flex items-center space-x-3 text-white hover:text-pink-200 transition-colors group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#F279AB' }}>
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">+92 311 1794175</span>
              </a>

              <a href="mailto:sooicypk@gmail.com" className="flex items-center space-x-3 text-white hover:text-pink-200 transition-colors group">
                <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#F279AB' }}>
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">sooicypk@gmail.com</span>
              </a>

              <div className="flex items-start space-x-3 text-white">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F279AB' }}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">
                  Karachi, Pakistan
                </span>
              </div>
            </div>
          </div>

          {/* Timings Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#F279AB' }}>
              Our Timings
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white">
                <Clock className="w-5 h-5" style={{ color: '#F279AB' }} />
                <div>
                  <p className="font-semibold text-sm">Monday - Sunday</p>
                  <p className="text-sm opacity-90">12:00 PM - 02:30 AM</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm">
                <p className="text-xs text-white font-medium">
                  🎉 Open every day! Late night cravings? We got you covered!
                </p>
              </div>
            </div>
          </div>

          {/* Follow Us Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#F279AB' }}>
              Follow Us
            </h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white hover:scale-110 transition-all shadow-lg hover:shadow-xl"
                style={{ color: '#0486D2' }}
              >
                <Facebook className="w-6 h-6" fill="currentColor" />
              </a>
              <a
                href="https://www.instagram.com/sooicy.pk/?igsh=bzQ5b2tkc3oxcWFq&utm_source=qr#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white hover:scale-110 transition-all shadow-lg hover:shadow-xl"
                style={{ color: '#F279AB' }}
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white bg-opacity-30 my-6"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
            <a href="/terms" className="text-white hover:text-pink-200 transition-colors font-medium underline decoration-2" style={{ textDecorationColor: '#F279AB' }}>
              Terms and Conditions
            </a>
            <a href="/privacy" className="text-white hover:text-pink-200 transition-colors font-medium underline decoration-2" style={{ textDecorationColor: '#F279AB' }}>
              Privacy Policy
            </a>
          </div>

          <div className="text-white text-sm font-medium">
            © 2025 Powered by{' '}
            <a href="https://www.trisitesolutions.com" target="_blank" rel="noopener noreferrer">
              <span className="font-bold" style={{ color: '#42f483' }}>
                Trisite Solutions
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Wave Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg className="relative block w-full h-8 sm:h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 L0,40 Q300,80 600,40 T1200,40 L1200,0 Z" fill="white" opacity="0.1" />
        </svg>
      </div>
    </footer>
  );
};

export default Footer;