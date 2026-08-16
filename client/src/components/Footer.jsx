import { Link } from 'react-router-dom'
import { Truck, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
)

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // Simulated subscribe action
    alert('Thank you for subscribing to the FreightIQ newsletter!')
    e.target.reset()
  }

  return (
    <footer className="relative border-t border-slate-200 bg-slate-100 pt-20 pb-10 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 gradient-primary opacity-5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 opacity-5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Company Bio */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-accent-500/20 group-hover:shadow-accent-500/40 transition-shadow duration-300">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Freight<span className="gradient-text">IQ</span>
                </span>
                <p className="text-[10px] text-slate-500 -mt-1 font-semibold tracking-wider uppercase">
                  Intelligence
                </p>
              </div>
            </Link>
            
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              Streamlining global logistics with industry-leading AI quote optimization, real-time routing, and carbon-aware dispatch. 
            </p>

            <div className="flex items-center gap-3">
              {[
                { icon: TwitterIcon, href: 'https://twitter.com' },
                { icon: LinkedinIcon, href: 'https://linkedin.com' },
                { icon: GithubIcon, href: 'https://github.com' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-650 hover:border-slate-350 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-semibold text-sm tracking-wider uppercase">Solutions</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '#home' },
                { name: 'Features', href: '#features' },
                { name: 'About Us', href: '#about' },
                { name: 'Contact', href: '#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-600 hover:text-slate-950 text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support / Contact */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-semibold text-sm tracking-wider uppercase">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span>100 Innovation Way, Suite 400, Boston, MA 02110</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <a href="tel:+18005550199" className="hover:text-blue-650 transition-colors">+1 (800) 555-0199</a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a href="mailto:support@freightiq.ai" className="hover:text-blue-650 transition-colors">support@freightiq.ai</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-semibold text-sm tracking-wider uppercase">Stay Updated</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Subscribe to receive updates on advanced AI shipping innovations.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="relative mt-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white hover:shadow-lg hover:shadow-accent-500/20 active:scale-95 transition-all cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            &copy; {currentYear} FreightIQ. All rights reserved. Made for final-year engineering research project.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-800 transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-slate-800 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
