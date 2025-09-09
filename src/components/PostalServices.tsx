import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Package, CreditCard } from "lucide-react";

const PostalServices = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Agilize suas postagens no site ou app Correios!
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            E entregue sua encomenda em uma de nossas agências.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Origem/Destino Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl text-primary">
                Calcular Postagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Origem</label>
                  <input 
                    type="text" 
                    placeholder="Informe o CEP"
                    className="w-full p-3 border border-border rounded-md mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Destino</label>
                  <input 
                    type="text" 
                    placeholder="Informe o CEP"
                    className="w-full p-3 border border-border rounded-md mt-1"
                  />
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary-hover" size="lg">
                Calcular Preço e Prazo
              </Button>
            </CardContent>
          </Card>

          {/* Rating Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl text-primary">
                Avalie sua experiência no site
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Sua opinião ajuda a melhorar nossos serviços
              </p>
              <Button 
                variant="outline" 
                size="lg"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
              >
                Avaliar Agora
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Services */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-primary mb-2">Envios Rápidos</h3>
            <p className="text-sm text-muted-foreground">
              Entrega expressa em todo território nacional
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-primary mb-2">Logística Completa</h3>
            <p className="text-sm text-muted-foreground">
              Soluções integradas para sua empresa
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-primary mb-2">Rede Nacional</h3>
            <p className="text-sm text-muted-foreground">
              Milhares de pontos de atendimento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostalServices;