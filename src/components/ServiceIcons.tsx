import { 
  Calculator, 
  ShieldCheck, 
  Globe, 
  MapPin, 
  Smartphone, 
  ArrowRightLeft 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ServiceIcons = () => {
  const services = [
    {
      icon: Calculator,
      title: "Preços e Prazos",
      description: "Calcule valores e prazos de entrega",
      link: "/precos-e-prazos"
    },
    {
      icon: ShieldCheck,
      title: "Desconfiou de fraude?",
      description: "Denuncie tentativas de golpe",
      link: "/seguranca"
    },
    {
      icon: Globe,
      title: "Minhas Importações",
      description: "Acompanhe suas compras internacionais",
      link: "/importacoes"
    },
    {
      icon: MapPin,
      title: "Busca CEP ou Endereço",
      description: "Encontre CEP e endereços",
      link: "/busca-cep"
    },
    {
      icon: Smartphone,
      title: "App Correios",
      description: "Baixe nosso aplicativo",
      link: "/app"
    },
    {
      icon: ArrowRightLeft,
      title: "Correios Empresas",
      description: "Soluções para sua empresa",
      link: "/empresas"
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2 text-primary">
                    {service.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceIcons;