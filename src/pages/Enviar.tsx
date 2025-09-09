import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Truck, Clock, Shield } from "lucide-react";

const Enviar = () => {
  const services = [
    {
      icon: Package,
      title: "PAC",
      description: "Encomenda Econômica Nacional",
      price: "A partir de R$ 12,50",
      delivery: "5 a 12 dias úteis"
    },
    {
      icon: Truck,
      title: "SEDEX",
      description: "Encomenda Expressa Nacional", 
      price: "A partir de R$ 24,90",
      delivery: "1 a 2 dias úteis"
    },
    {
      icon: Clock,
      title: "SEDEX 10",
      description: "Entrega até às 10h do dia útil seguinte",
      price: "A partir de R$ 45,00",
      delivery: "1 dia útil"
    },
    {
      icon: Shield,
      title: "SEDEX 12",
      description: "Entrega até às 12h do dia útil seguinte",
      price: "A partir de R$ 38,00",
      delivery: "1 dia útil"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Serviços de Envio
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Escolha o melhor serviço para suas necessidades de envio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-primary">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <p className="font-semibold text-secondary mb-2">
                      {service.price}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {service.delivery}
                    </p>
                    <Button className="w-full">
                      Calcular Frete
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">
                Como Enviar
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <h3 className="font-semibold mb-2">Prepare o Objeto</h3>
                <p className="text-sm text-muted-foreground">
                  Embale adequadamente e preencha o endereço completo
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <h3 className="font-semibold mb-2">Escolha o Serviço</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione entre PAC, SEDEX ou outros serviços
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <h3 className="font-semibold mb-2">Poste na Agência</h3>
                <p className="text-sm text-muted-foreground">
                  Leve até uma agência dos Correios e efetue o pagamento
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Enviar;