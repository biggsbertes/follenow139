import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Package, Truck } from "lucide-react";

const Comprar = () => {
  const products = [
    {
      title: "Curso de Logística",
      description: "Curso completo de logística e distribuição",
      price: "R$ 299,90",
      image: "📚"
    },
    {
      title: "Gestão Postal",
      description: "Especialização em gestão de serviços postais",
      price: "R$ 599,90", 
      image: "📮"
    },
    {
      title: "Tecnologia e Inovação",
      description: "Curso sobre tecnologias aplicadas aos correios",
      price: "R$ 449,90",
      image: "💻"
    },
    {
      title: "Atendimento ao Cliente",
      description: "Técnicas de atendimento e relacionamento",
      price: "R$ 199,90",
      image: "👥"
    }
  ];

  const features = [
    {
      icon: ShoppingCart,
      title: "Compra Segura",
      description: "Ambiente seguro com certificado SSL"
    },
    {
      icon: CreditCard,
      title: "Pagamento Fácil",
      description: "Cartão, PIX, boleto ou parcele sem juros"
    },
    {
      icon: Package,
      title: "Material Incluso",
      description: "Livros digitais e materiais complementares"
    },
    {
      icon: Truck,
      title: "Acesso Imediato",
      description: "Comece a estudar assim que finalizar a compra"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Cursos da Faculdade Correios
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Invista no seu futuro com nossos cursos especializados
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">{product.image}</div>
                  <CardTitle className="text-lg text-primary">{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {product.description}
                  </p>
                  <p className="text-2xl font-bold text-secondary mb-4">
                    {product.price}
                  </p>
                  <Button className="w-full">
                    Comprar Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">
                Transforme sua carreira!
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Seja um especialista em logística e serviços postais
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-secondary text-secondary-foreground hover:bg-secondary-hover"
              >
                Ver Todos os Cursos
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Comprar;