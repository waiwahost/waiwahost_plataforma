import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full py-3 px-6 border-t text-xs text-muted-foreground bg-card text-center">
    © {new Date().getFullYear()} SaaS Platform. Todos los derechos reservados.
  </footer>
);

export default Footer;
