import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Institucional",
      links: [
        { name: "Sobre a Faculdade Correios", href: "/sobre" },
        { name: "Missão e Valores", href: "/missao" },
        { name: "Governança", href: "/governanca" },
        { name: "Sustentabilidade", href: "/sustentabilidade" },
        { name: "Trabalhe Conosco", href: "/carreiras" }
      ]
    },
    {
      title: "Serviços",
      links: [
        { name: "Graduação", href: "/graduacao" },
        { name: "Pós-graduação", href: "/pos-graduacao" },
        { name: "Cursos Técnicos", href: "/tecnicos" },
        { name: "Educação à Distância", href: "/ead" },
        { name: "Extensão", href: "/extensao" }
      ]
    },
    {
      title: "Atendimento",
      links: [
        { name: "Central de Atendimento", href: "/atendimento" },
        { name: "Fale Conosco", href: "/contato" },
        { name: "Ouvidoria", href: "/ouvidoria" },
        { name: "FAQ", href: "/faq" },
        { name: "Tutorial", href: "/tutorial" }
      ]
    },
    {
      title: "Acesso Rápido",
      links: [
        { name: "Portal do Aluno", href: "/portal-aluno" },
        { name: "Biblioteca Digital", href: "/biblioteca" },
        { name: "Calendário Acadêmico", href: "/calendario" },
        { name: "Processo Seletivo", href: "/vestibular" },
        { name: "Bolsas e Financiamentos", href: "/bolsas" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", name: "Facebook" },
    { icon: Instagram, href: "#", name: "Instagram" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Youtube, href: "#", name: "YouTube" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-lg mb-4 text-secondary">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-secondary" />
              <div>
                <p className="font-semibold">Endereço</p>
                <p className="text-sm text-primary-foreground/80">
                  SBN Quadra 1, Bloco A - Brasília/DF
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-3 text-secondary" />
              <div>
                <p className="font-semibold">Telefone</p>
                <p className="text-sm text-primary-foreground/80">
                  0800 570 0100
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-secondary" />
              <div>
                <p className="font-semibold">E-mail</p>
                <p className="text-sm text-primary-foreground/80">
                  contato@faculdadecorreios.edu.br
                </p>
              </div>
            </div>
          </div>

          {/* Social media */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-semibold mb-2">Siga-nos nas redes sociais</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-8 h-8 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors"
                      aria-label={social.name}
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
            
            <div className="text-right text-sm text-primary-foreground/80">
              <p>Baixe nosso aplicativo:</p>
              <div className="flex space-x-2 mt-2">
                <span className="bg-primary-foreground/10 px-3 py-1 rounded">App Store</span>
                <span className="bg-primary-foreground/10 px-3 py-1 rounded">Google Play</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="bg-primary-hover">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="mb-2 md:mb-0">
              <p>&copy; 2024 Faculdade Correios. Todos os direitos reservados.</p>
            </div>
            <div className="flex space-x-4">
              <a href="/politica-de-privacidade" className="hover:text-secondary transition-colors">
                Política de Privacidade
              </a>
              <a href="/termos-de-uso" className="hover:text-secondary transition-colors">
                Termos de Uso
              </a>
              <a href="/acessibilidade" className="hover:text-secondary transition-colors">
                Acessibilidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;